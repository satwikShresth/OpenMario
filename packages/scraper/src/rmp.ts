const API_LINK = 'https://www.ratemyprofessors.com/graphql';

const HEADERS: Record<string, string> = {
   'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0',
   Accept: '*/*',
   'Accept-Language': 'en-US,en;q=0.5',
   'Content-Type': 'application/json',
   Authorization: 'Basic dGVzdDp0ZXN0',
   'Sec-GPC': '1',
   'Sec-Fetch-Dest': 'empty',
   'Sec-Fetch-Mode': 'cors',
   'Sec-Fetch-Site': 'same-origin',
   Priority: 'u=4'
};

const TEACHER_SEARCH_QUERY = `
  query TeacherSearchResultsPageQuery(
    $query: TeacherSearchQuery!
    $schoolID: ID
    $includeSchoolFilter: Boolean!
  ) {
    search: newSearch {
      ...TeacherSearchPagination_search_1ZLmLD
    }
    school: node(id: $schoolID) @include(if: $includeSchoolFilter) {
      __typename
      ... on School {
        name
      }
      id
    }
  }

  fragment TeacherSearchPagination_search_1ZLmLD on newSearch {
    teachers(query: $query, first: 8, after: "") {
      didFallback
      edges {
        cursor
        node {
          ...TeacherCard_teacher
          id
          __typename
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      resultCount
      filters {
        field
        options {
          value
          id
        }
      }
    }
  }

  fragment TeacherCard_teacher on Teacher {
    id
    legacyId
    avgRating
    numRatings
    ...CardFeedback_teacher
    ...CardSchool_teacher
    ...CardName_teacher
    ...TeacherBookmark_teacher
  }

  fragment CardFeedback_teacher on Teacher {
    wouldTakeAgainPercent
    avgDifficulty
  }

  fragment CardSchool_teacher on Teacher {
    department
    school {
      name
      id
    }
  }

  fragment CardName_teacher on Teacher {
    firstName
    lastName
  }

  fragment TeacherBookmark_teacher on Teacher {
    id
    isSaved
  }
`;

const SCHOOL_SEARCH_QUERY = `
  query NewSearchSchoolsQuery($query: SchoolSearchQuery!) {
    newSearch {
      schools(query: $query) {
        edges {
          cursor
          node {
            id
            legacyId
            name
            city
            state
            departments {
              id
              name
            }
            numRatings
            avgRatingRounded
            summary {
              campusCondition
              campusLocation
              careerOpportunities
              clubAndEventActivities
              foodQuality
              internetSpeed
              libraryCondition
              schoolReputation
              schoolSafety
              schoolSatisfaction
              socialActivities
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export interface SchoolSearchNode {
   id: string;
   legacyId: number;
   name: string;
   city: string;
   state: string;
   departments: { id: string; name: string }[];
   numRatings: number;
   avgRatingRounded: number;
   summary?: Record<string, number>;
}

export interface SchoolSearchEdge {
   cursor: string;
   node: SchoolSearchNode;
}

export interface TeacherSearchNode {
   __typename: string;
   id: string;
   legacyId: number;
   avgRating: number;
   avgDifficulty: number;
   numRatings: number;
   wouldTakeAgainPercent: number;
   department: string;
   firstName: string;
   lastName: string;
   isSaved: boolean;
   school: { id: string; name: string };
}

export interface TeacherSearchEdge {
   cursor: string;
   node: TeacherSearchNode;
}

export interface ProfessorRating {
   avgRating: number;
   avgDifficulty: number;
   wouldTakeAgainPercent: number;
   numRatings: number;
   formattedName: string;
   department: string;
   rmpId: string;
   rmpLegacyId: number;
   link: string;
}

export async function searchSchools(
   schoolName: string
): Promise<SchoolSearchEdge[] | undefined> {
   try {
      const response = await fetch(API_LINK, {
         credentials: 'include',
         headers: HEADERS,
         method: 'POST',
         mode: 'cors',
         body: JSON.stringify({
            query: SCHOOL_SEARCH_QUERY,
            variables: { query: { text: schoolName } }
         })
      });

      if (!response.ok) {
         throw new Error(`RMP school search failed: ${response.status}`);
      }

      const data = (await response.json()) as {
         data?: { newSearch?: { schools?: { edges?: SchoolSearchEdge[] } } };
      };
      return data.data?.newSearch?.schools?.edges;
   } catch (error) {
      console.error('[RMP] searchSchools error:', error);
      return undefined;
   }
}

export async function searchProfessorsAtSchool(
   professorName: string,
   schoolId: string
): Promise<TeacherSearchEdge[] | undefined> {
   try {
      const response = await fetch(API_LINK, {
         credentials: 'include',
         headers: HEADERS,
         method: 'POST',
         mode: 'cors',
         body: JSON.stringify({
            query: TEACHER_SEARCH_QUERY,
            variables: {
               query: {
                  text: professorName,
                  schoolID: schoolId,
                  fallback: true,
                  departmentID: null
               },
               schoolID: schoolId,
               includeSchoolFilter: true
            }
         })
      });

      if (!response.ok) {
         throw new Error(`RMP professor search failed: ${response.status}`);
      }

      const data = (await response.json()) as {
         data?: { search?: { teachers?: { edges?: TeacherSearchEdge[] } } };
      };
      return data.data?.search?.teachers?.edges;
   } catch (error) {
      console.error('[RMP] searchProfessorsAtSchool error:', error);
      return undefined;
   }
}

export async function getProfessorRating(
   professorName: string,
   schoolId: string
): Promise<ProfessorRating | null> {
   const edges = await searchProfessorsAtSchool(professorName, schoolId);

   if (!edges || edges.length === 0) {
      return null;
   }

   const node = edges[0]!.node;
   return {
      avgRating: node.avgRating ?? 0,
      avgDifficulty: node.avgDifficulty ?? 0,
      wouldTakeAgainPercent: node.wouldTakeAgainPercent ?? 0,
      numRatings: node.numRatings ?? 0,
      formattedName: `${node.firstName} ${node.lastName}`.trim(),
      department: node.department ?? '',
      rmpId: node.id,
      rmpLegacyId: node.legacyId,
      link: `https://www.ratemyprofessors.com/professor/${node.legacyId}`
   };
}
