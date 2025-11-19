import { os } from './context';
import { neo4jService } from '@/services/neo4j.service';

// Type definitions
interface CourseInfo {
   id: string;
   name: string;
   subjectId: string;
   courseNumber: string;
}

interface Prerequisite {
   id: string;
   name: string;
   subjectId: string;
   courseNumber: string;
   relationshipType: string;
   groupId: string;
   canTakeConcurrent: boolean;
   minimumGrade: string;
   relationshipId: number | null;
}

interface Corequisite {
   id: string;
   name: string;
   subjectId: string;
   courseNumber: string;
}

// interface CourseRequirementsData {
//    course: CourseInfo;
//    prerequisites: Prerequisite[][];
//    corequisites: Corequisite[];
// }

interface TermData {
   term: string;
   crn: string;
   instructor: {
      id: number;
      name: string;
      avg_difficulty: number | null;
      avg_rating: number | null;
      num_ratings: number | null;
   } | null;
}

/**
 * Retrieve all attributes for a specific course
 */
export const getCourse = os.graph.course.handler(
   async ({ input: { course_id } }) => {
      const cypher = `
      MATCH (course:Course)
      WHERE course.id = $course_id
      OPTIONAL MATCH (course)-[offers:OFFERS]->(section:Section)
      RETURN course.id AS id,
             course.subject_id AS subject_id,
             course.course_number AS course_number,
             course.title AS title,
             course.description AS description,
             course.credits AS credits,
             course.writing_intensive AS writing_intensive,
             course.repeat_status AS repeat_status,
             offers.instruction_type AS instruction_type,
             offers.instruction_method AS instruction_method,
             section.crn AS crn
   `;

      return await neo4jService
         .executeReadQuery(cypher, {
            course_id
         })
         .then(records => {
            if (!records || records.length === 0) {
               throw new Error('Course not found');
            }

            const [record] = records;

            return {
               data: {
                  id: record!.get('id'),
                  subject_id: record!.get('subject_id'),
                  course_number: record!.get('course_number'),
                  title: record!.get('title'),
                  description: record!.get('description'),
                  credits: record!.get('credits'),
                  writing_intensive: record!.get('writing_intensive'),
                  repeat_status: record!.get('repeat_status'),
                  instruction_type: record!.get('instruction_type'),
                  instruction_method: record!.get('instruction_method'),
                  crn: record!.get('crn')
               }
            };
         })
         .catch(error => {
            console.error('Error fetching course:', error);
            throw new Error(error.message || 'Failed to fetch course');
         });
   }
);

/**
 * Retrieve prerequisites and corequisites for a specific course
 */
export const getCourseRequisites = os.graph.requisites.handler(
   async ({ input: { course_id } }) => {
      const cypher = `
      MATCH (course:Course)
      WHERE course.id = $course_id
      OPTIONAL MATCH (prereq:Course)-[prerequisiteRel:PREREQUISITE]->(course)
      OPTIONAL MATCH (course)-[coreqRel:COREQUISITE]-(coreq:Course)
      RETURN course.id AS courseId,
             course.title AS courseName,
             course.subject_id AS subjectId,
             course.course_number AS courseNumber,
             COLLECT(DISTINCT {
                 id: prereq.id,
                 name: prereq.title,
                 subjectId: prereq.subject_id,
                 courseNumber: prereq.course_number,
                 relationshipType: prerequisiteRel.relationship_type,
                 groupId: toString(prerequisiteRel.group_id),
                 canTakeConcurrent: prerequisiteRel.can_take_concurrent,
                 minimumGrade: prerequisiteRel.minimum_grade,
                 relationshipId: id(prerequisiteRel)
             }) AS prerequisites,
             COLLECT(DISTINCT {
                 id: coreq.id,
                 name: coreq.title,
                 subjectId: coreq.subject_id,
                 courseNumber: coreq.course_number
             }) AS corequisites
   `;

      return await neo4jService
         .executeReadQuery(cypher, {
            course_id
         })
         .then(records => {
            if (!records || records.length === 0) {
               throw new Error('Course not found');
            }

            const [record] = records;

            const courseData: CourseInfo = {
               id: record!.get('courseId'),
               name: record!.get('courseName'),
               subjectId: record!.get('subjectId'),
               courseNumber: record!.get('courseNumber')
            };

            const prerequisites: Prerequisite[] = record!
               .get('prerequisites')
               .filter((p: Prerequisite) => p.id !== null);

            const corequisites: Corequisite[] = record!
               .get('corequisites')
               .filter((c: Corequisite) => c.id !== null);

            const groupedPrerequisites = Object.values(
               prerequisites.reduce(
                  (
                     acc: Record<string, Prerequisite[]>,
                     { groupId, ...prereq }
                  ) => {
                     if (!acc[groupId]) {
                        acc[groupId] = [];
                     }
                     acc[groupId].push({ groupId, ...prereq });
                     return acc;
                  },
                  {}
               )
            );

            return {
               data: {
                  course: courseData,
                  prerequisites: groupedPrerequisites,
                  corequisites
               }
            };
         })
         .catch(error => {
            console.error('Error fetching course requisites:', error);
            throw new Error(
               error.message || 'Failed to fetch course requisites'
            );
         });
   }
);

/**
 * Retrieve all sections available for a specific course across all terms
 */
export const getCourseAvailabilities = os.graph.availabilities.handler(
   async ({ input: { course_id } }) => {
      const cypher = `
         MATCH (course:Course)
         WHERE course.id = $course_id
         MATCH (course)-[offers:OFFERS]->(section:Section)
         WHERE offers.instruction_type = 'Lecture' OR offers.instruction_type IS NOT NULL
         OPTIONAL MATCH (instructor:Instructor)-[:TEACHES]->(section)
         WITH course,
            COLLECT(DISTINCT {
               term: toString(section.term),
               crn: toString(section.crn),
               instructor: CASE WHEN instructor IS NULL 
                  THEN null
                  ELSE {
                    id: toInteger(instructor.id),
                    name: COALESCE(instructor.name, ''),
                    avg_difficulty: CASE 
                        WHEN instructor.avg_difficulty IS NULL THEN null
                        ELSE toFloat(instructor.avg_difficulty)
                    END,
                    avg_rating: CASE 
                        WHEN instructor.avg_rating IS NULL THEN null
                        ELSE toFloat(instructor.avg_rating)
                    END,
                    num_ratings: CASE 
                        WHEN instructor.num_ratings IS NULL THEN null
                        ELSE toInteger(instructor.num_ratings)
                    END
                  }
                END
              }) AS terms
         RETURN 
           course.id AS course_id,
           terms
      `;

      return await neo4jService
         .executeReadQuery(cypher, {
            course_id
         })
         .then(records => {
            if (!records || records.length === 0) {
               throw new Error('Course not found or no availabilities');
            }

            const [record] = records;
            const terms: TermData[] = record!.get('terms');

            if (!terms || terms.length === 0) {
               return [];
            }

            const validTerms = terms.filter(
               (term: TermData) => term && term.term && term.crn
            );
            return validTerms;
         })
         .catch(error => {
            console.error('Error fetching course availabilities:', error);
            throw new Error(
               error.message || 'Failed to fetch course availabilities'
            );
         });
   }
);
