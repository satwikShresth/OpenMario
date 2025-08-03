import { location } from '../../../src/db/index.ts';
import { db } from '../../../src/db/index.ts';
import { parse } from 'jsr:@std/csv';
import { join } from 'jsr:@std/path';

export async function seedLocation() {
   try {
      // Read the CSV file
      const text = await Deno.readTextFile(
         join(
            Deno.cwd(),
            'database',
            'openmario',
            'seeds',
            'assets',
            'us_cities.csv',
         ),
      );

      // Parse CSV content
      const records = parse(text, {
         skipFirstRow: true,
         strip: true,
      });

      // Prepare the data for insertion
      const locationData = records.map((record) => ({
         state_code: record.STATE_CODE,
         state: record.STATE_NAME,
         city: record.CITY,
      }));

      // Insert data in batches of 100
      const batchSize = 100;
      for (let i = 0; i < locationData.length; i += batchSize) {
         const batch = locationData.slice(i, i + batchSize);

         await db
            .insert(location)
            .values(batch)
            .onConflictDoNothing({
               target: [location.state_code, location.state, location.city],
            });

         console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
      }

      console.log('Seeding completed successfully');
   } catch (error) {
      console.error('Error seeding database:', error);
      Deno.exit(1);
   }
}
