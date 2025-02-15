import { schema } from "../schema/mod.ts";
import { parse } from "jsr:@std/csv";
import { join } from "jsr:@std/path";
import { db } from "../mod.ts";

const location = schema.location;

export async function seedLocation() {
  try {
    // Read the CSV file
    const text = await Deno.readTextFile(
      join(Deno.cwd(), "database", "seeds", "assets", "us_cities.csv"),
    );

    // Parse CSV content
    const records = parse(text, {
      skipFirstRow: true,
      strip: true,
    });

    // Prepare the data for insertion
    const locationData = records.map((record) => ({
      stateId: record.STATE_CODE,
      state: record.STATE_NAME,
      city: record.CITY,
    }));

    // Insert data in batches of 100
    const batchSize = 100;
    for (let i = 0; i < locationData.length; i += batchSize) {
      const batch = locationData.slice(i, i + batchSize);

      await db.insert(location)
        .values(batch)
        .onConflictDoNothing({ target: [location.state, location.city] });

      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    Deno.exit(1);
  }
}
