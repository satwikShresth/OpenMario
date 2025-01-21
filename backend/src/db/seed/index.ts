import { db } from '#db';
import { authors, books } from '#/db/schema.ts';
import * as csv from 'jsr:@std/csv';
import * as path from 'jsr:@std/path';

async function seedDatabase() {
   try {
      const authorsData = await Deno.readTextFile(
         path.join(import.meta.dirname!, 'authors.csv'),
      );
      const booksData = await Deno.readTextFile(
         path.join(import.meta.dirname!, 'books.csv'),
      );

      // Parse authors CSV
      const parsedAuthors = csv.parse(authorsData, {
         header: true,
         skipFirstRow: true,
         strip: true,
      });

      const parsedBooks = csv.parse(booksData, {
         header: true,
         skipFirstRow: true,
         strip: true,
      });

      await db.insert(authors).values(parsedAuthors!);
      await db.insert(books).values(parsedBooks!);

      console.log('Seed data inserted successfully');
   } catch (error) {
      console.error('Error seeding data:', error);
      throw error;
   }
}

seedDatabase();

