import type { CourseRef, MajorProgram, RequirementBlock } from './types'

const c = (code: string, title: string, credits?: number): CourseRef => ({
   code,
   title,
   ...(credits != null ? { credits } : {}),
})

const upperDivision: CourseRef[] = [
   c('CS 361', 'Concurrent Programming'),
   c('CS 370', 'Operating Systems'),
   c('CS 377', 'Software Security'),
   c('CS 380', 'Artificial Intelligence'),
   c('CS 432', 'Interactive Computer Graphics'),
   c('CS 472', 'Computer Networks: Theory, Applications and Programming'),
   c('SE 320', 'Software Verification and Validation'),
]

const csElectives: CourseRef[] = [
   c('CS 300', 'Applied Symbolic Computation'),
   c('CS 303', 'Algorithmic Number Theory and Cryptography'),
   c('CS 314', 'Computing in the Small'),
   c('CS 345', 'Computer Game Design and Development'),
   c('CS 352', 'Processor Architecture & Analysis'),
   c('CS 375', 'Web Development'),
   c('CS 383', 'Machine Learning'),
   c('CS 385', 'Evolutionary Computing'),
   c('CS 387', 'Game AI Development'),
   c('CS 417', 'Reinforcement Learning'),
   c('CS 429', 'Software Defined Radio Laboratory'),
   c('CS 430', 'Computer Graphics'),
   c('CS 435', 'Computational Photography'),
   c('CS 438', 'Game Engine Programming'),
   c('CS 440', 'Theory of Computation'),
   c('CS 441', 'Compiler Implementation'),
   c('CS 455', 'Computational Network Neuroscience'),
   c('CS 457', 'Data Structures and Algorithms I'),
   c('CS 458', 'Data Structures and Algorithms II'),
   c('CS 461', 'Database Systems'),
   c('CS 463', 'Cloud Native Platform Engineering'),
   c('CS 465', 'Privacy and Trust'),
   c('CS 475', 'Network Security'),
   c('CS 476', 'High Performance Computing'),
   c('CS 478', 'Advanced Web Development'),
   c('CS 479', 'Advanced Network Security'),
   c('CS 481', 'Advanced Artificial Intelligence'),
   c('CS 482', 'Robust Machine Learning'),
   c('CS 486', 'Topics in Artificial Intelligence'),
   c('DSCI 351', 'Recommender Systems'),
   c('DSCI 471', 'Applied Deep Learning'),
   c('ECE 302', 'Design with Embedded Processors'),
   c('ECEC 412', 'Modern Processor Design'),
   c('ECEC 413', 'Introduction to Parallel Computer Architecture'),
   c('ECEC 414', 'High Performance Computing'),
   c('GMAP 377', 'Game Development: Workshop I'),
   c('GMAP 378', 'Game Development: Workshop II'),
   c('INFO 310', 'Human-Centered Design Process & Methods'),
   c('INFO 323', 'Cloud Computing and Big Data'),
   c('INFO 420', 'Software Project Management'),
   c('MATH 300', 'Numerical Analysis I'),
   c('MATH 301', 'Numerical Analysis II'),
   c('MATH 305', 'Introduction to Optimization Theory'),
   c('MATH 475', 'Cryptography'),
   c('SE 311', 'Software Architecture'),
   c('SE 410', 'Software Evolution'),
   c('SE 420', 'Open Source Software Engineering'),
]

const scienceBio: RequirementBlock = {
   id: 'sci-bio',
   title: 'Biology sequence',
   kind: 'all',
   tone: 'science',
   summary: 'BIO 131–136 lecture + lab',
   courses: [
      c('BIO 131', 'Cells and Biomolecules'),
      c('BIO 134', 'Cells and Biomolecules Lab'),
      c('BIO 132', 'Genetics and Evolution'),
      c('BIO 135', 'Genetics and Evolution Lab'),
      c('BIO 133', 'Physiology and Ecology'),
      c('BIO 136', 'Anatomy and Ecology Lab'),
   ],
}

const scienceChem: RequirementBlock = {
   id: 'sci-chem',
   title: 'Chemistry sequence',
   kind: 'all',
   tone: 'science',
   summary: 'CHEM 101–103',
   courses: [
      c('CHEM 101', 'General Chemistry I'),
      c('CHEM 102', 'General Chemistry II'),
      c('CHEM 103', 'General Chemistry III'),
   ],
}

const sciencePhys: RequirementBlock = {
   id: 'sci-phys',
   title: 'Physics sequence',
   kind: 'all',
   tone: 'science',
   summary: 'PHYS 101, 102, 201',
   courses: [
      c('PHYS 101', 'Fundamentals of Physics I'),
      c('PHYS 102', 'Fundamentals of Physics II'),
      c('PHYS 201', 'Fundamentals of Physics III'),
   ],
}

const csCore: RequirementBlock = {
   id: 'cs-core',
   title: 'Core courses',
   kind: 'all',
   tone: 'cs',
   summary: 'Required CS & SE foundations',
   credits: 41,
   items: [
      { type: 'course', course: c('CS 164', 'Introduction to Computer Science', 3) },
      {
         type: 'or',
         courses: [
            c('CS 171', 'Computer Programming I', 3),
            c('CS 175', 'Advanced Computer Programming I', 3),
         ],
      },
      { type: 'course', course: c('CS 172', 'Computer Programming II', 3) },
      { type: 'course', course: c('CS 260', 'Data Structures', 4) },
      { type: 'course', course: c('CS 265', 'Advanced Programming Tools and Techniques', 3) },
      { type: 'course', course: c('CS 270', 'Mathematical Foundations of Computer Science', 3) },
      { type: 'course', course: c('CS 277', 'Algorithms and Analysis', 3) },
      { type: 'course', course: c('CS 281', 'Systems Architecture', 4) },
      { type: 'course', course: c('CS 283', 'Systems Programming', 3) },
      { type: 'course', course: c('CS 360', 'Programming Language Concepts', 3) },
      {
         type: 'or',
         courses: [
            c('SE 181', 'Introduction to Software Engineering and Development', 3),
            c('SE 201', 'Introduction to Software Engineering and Development', 3),
         ],
      },
      { type: 'course', course: c('SE 310', 'Software Design', 3) },
   ],
}

const csUpper: RequirementBlock = {
   id: 'cs-upper',
   title: 'Upper division',
   credits: 6,
   kind: 'pick_n',
   n: 2,
   tone: 'cs',
   summary: 'Pick 2 advanced CS/SE courses',
   notes: 'Complete two of the following',
   courses: upperDivision,
}

const csElectivesBlock: RequirementBlock = {
   id: 'cs-electives',
   title: 'Electives',
   credits: 18,
   kind: 'pick_n',
   n: 6,
   tone: 'cs',
   summary: '6 courses · 18 credits',
   notes: '300/400-level CS or SE; max 3 from outside CS/SE',
   courses: csElectives,
}

export const BS_CS: MajorProgram = {
   id: 'bs-cs',
   name: 'Computer Science',
   degree: 'Bachelor of Science (BS)',
   totalCredits: 187,
   description:
      'Foundation courses in the sciences and applied mathematics, leading to careers involving applications in science and engineering.',
   footnotes: [
      'COOP 101 registration depends on co-op cycle; some students may take COOP 001 instead.',
      'Arts & Humanities electives: at least 3.0 credits from Business and 3.0 from Social Studies.',
      'CS electives: 6 courses (18 cr) at 300/400-level CS/SE not already used above; max 3 from outside CS/SE.',
      'Three writing-intensive courses required after freshman year (two in major).',
   ],
   blocks: [
      {
         id: 'computer-science',
         title: 'Computer Science',
         kind: 'faction',
         tone: 'cs',
         credits: 65,
         summary: 'Core · upper division · electives',
         children: [csCore, csUpper, csElectivesBlock],
      },
      {
         id: 'ci',
         title: 'Computing & Informatics',
         kind: 'all',
         tone: 'ci',
         credits: 15,
         summary: 'Design studio + senior project',
         courses: [
            c('CI 101', 'Computing and Informatics Design I', 2),
            c('CI 102', 'Computing and Informatics Design II', 2),
            c('CI 103', 'Computing and Informatics Design III', 2),
            c('CI 491', 'Senior Project I', 3),
            c('CI 492', 'Senior Project II', 3),
            c('CI 493', 'Senior Project III', 3),
         ],
      },
      {
         id: 'math',
         title: 'Mathematics',
         kind: 'all',
         tone: 'math',
         credits: 27,
         summary: 'Calc through probability',
         courses: [
            c('MATH 121', 'Calculus I', 4),
            c('MATH 122', 'Calculus II', 4),
            c('MATH 123', 'Calculus III', 4),
            c('MATH 200', 'Multivariate Calculus', 4),
            c('MATH 201', 'Linear Algebra', 4),
            c('MATH 221', 'Discrete Mathematics', 3),
            c('MATH 311', 'Probability and Statistics I', 4),
         ],
      },
      {
         id: 'science',
         title: 'Science',
         credits: 19,
         kind: 'one_of_sequences',
         tone: 'science',
         summary: 'Pick a lab sequence + electives',
         notes: 'Choose one lab sequence and complete every course in it, then science electives to 19 credits.',
         children: [scienceBio, scienceChem, sciencePhys],
      },
      {
         id: 'ah',
         title: 'Arts & Humanities',
         kind: 'faction',
         tone: 'ah',
         credits: 39,
         summary: 'Writing · speaking · electives',
         children: [
            {
               id: 'ah-required',
               title: 'Required courses',
               kind: 'all',
               tone: 'ah',
               summary: 'COM, ENGL, PHIL 311',
               items: [
                  { type: 'course', course: c('COM 230', 'Techniques of Speaking', 3) },
                  {
                     type: 'or',
                     courses: [
                        c('ENGL 101', 'Composition and Rhetoric I', 3),
                        c('ENGL 111', 'English Composition I', 3),
                     ],
                  },
                  {
                     type: 'or',
                     courses: [
                        c('ENGL 102', 'Composition and Rhetoric II', 3),
                        c('ENGL 112', 'English Composition II', 3),
                     ],
                  },
                  {
                     type: 'or',
                     courses: [
                        c('ENGL 103', 'Composition and Rhetoric III', 3),
                        c('ENGL 113', 'English Composition III', 3),
                     ],
                  },
                  { type: 'course', course: c('PHIL 311', 'Ethics and Information Technology', 3) },
               ],
            },
            {
               id: 'ah-writing',
               title: 'Writing & Communication',
               credits: 6,
               kind: 'credits',
               tone: 'ah',
               summary: '6 credits WI / COM / WRIT',
               notes: 'WRIT / COM / ENGL (WI) / SCRP 270 / SCRP 275',
            },
            {
               id: 'ah-electives',
               title: 'A&H / Business / Social',
               credits: 18,
               kind: 'credits',
               tone: 'ah',
               summary: '18 credits · mix required',
               notes: '≥3 cr Business + ≥3 cr Social Studies',
            },
         ],
      },
      {
         id: 'university',
         title: 'University',
         credits: 4,
         kind: 'all',
         tone: 'university',
         summary: 'Civic · co-op · Drexel Experience',
         items: [
            { type: 'course', course: c('CIVC 101', 'Introduction to Civic Engagement', 1) },
            { type: 'course', course: c('COOP 101', 'Career Management and Professional Development', 1) },
            {
               type: 'or',
               courses: [
                  c('UNIV CI101', 'The Drexel Experience', 2),
                  c('CI 120', 'CCI Transfer Student Seminar', 2),
               ],
            },
         ],
      },
      {
         id: 'free',
         title: 'Free Electives',
         credits: 21,
         kind: 'credits',
         tone: 'free',
         summary: 'Any unrestricted 100–499',
         notes: 'Any unrestricted 100–499 course',
      },
   ],
}
