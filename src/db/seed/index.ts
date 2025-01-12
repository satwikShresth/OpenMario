import { db } from '../index.js';
import { authors, books } from '../schema.js';

try {
    await db.insert(authors).values({
        id: 1,
        name: 'Figginsworth III',
        bio: 'A traveling gentleman.'
    });

    await db.insert(books).values({
        id: 1,
        author_id: 1,
        title: 'My Fairest Lady',
        pub_year: '1866',
        genre: 'romance'
    });

    await db.insert(books).values({
        id: 2,
        author_id: 1,
        title: 'A Travelogue of Tales',
        pub_year: '1867',
        genre: 'adventure'
    });

    console.log('Seed data inserted successfully');
} catch (error) {
    console.error('Error seeding data:', error);
}
