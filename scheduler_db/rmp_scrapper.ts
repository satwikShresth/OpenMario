import defaultRatings from  "npm:@mtucourses/rate-my-professors";

(async () => {
  const ratings = defaultRatings.default;
  console.log(ratings)
  //const schools = await ratings.searchSchool('michigan technological university');
  //
  //console.log(schools);
  /*
    [
      {
        city: 'Houghton',
        id: 'U2Nob29sLTYwMg==',
        name: 'Michigan Technological University',
        state: 'MI'
      }
    ]
  */

  const teachers = await ratings.searchTeacher('mtu shene');

  console.log(teachers);
  /*
    [
      {
        firstName: 'Ching-Kuang',
        id: 'VGVhY2hlci0yMjkxNjI=',
        lastName: 'Shene',
        school: {
          id: 'U2Nob29sLTYwMg==',
          name: 'Michigan Technological University'
        }
      }
    ] 
  */

  const teacher = await ratings.getTeacher('VGVhY2hlci0yMjkxNjI=');

  console.log(teacher);
  /*
    {
      avgDifficulty: 4.4,
      avgRating: 3.3,
      numRatings: 28,
      department: 'Computer Science',
      firstName: 'Ching-Kuang',
      id: 'VGVhY2hlci0yMjkxNjI=',
      lastName: 'Shene',
      school: {
        city: 'Houghton',
        id: 'U2Nob29sLTYwMg==',
        name: 'Michigan Technological University',
        state: 'MI'
      },
      legacyId: 1234567
    }
  */
})();
