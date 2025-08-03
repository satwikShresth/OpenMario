import Cypher from '@neo4j/cypher-builder';

// Define the main course node that we're searching for
export const course = new Cypher.Node();

// Define the prerequisite course node and relationship
export const prereq = new Cypher.Node();
export const prerequisiteRel = new Cypher.Relationship();

// Create the prerequisite pattern: (course:Course)<-[prerequisiteRel:PREREQUISITE]-(prereq:Course)
export const prerequisitePattern = new Cypher.Pattern(course, {
   labels: ['Course'],
})
   .related(prerequisiteRel, { type: 'PREREQUISITE', direction: 'left' })
   .to(prereq, { labels: ['Course'] });
