import { db } from "../mod.ts";
import { join } from "jsr:@std/path";
import { company, position } from "../schema/table.ts";
import { eq } from "drizzle-orm";

export async function seedComapnyPositions() {
  try {
    // Read and parse the JSON file
    const fileContent = await Deno.readTextFile(
      join(
        Deno.cwd(),
        "database",
        "seeds",
        "assets",
        "company_positions.json",
      ),
    );

    const companyData = JSON.parse(fileContent);

    const companyIds = new Map<string, string>();

    for (const companyName of Object.keys(companyData)) {
      const [insertedCompany] = await db.insert(company)
        .values({ name: companyName })
        .returning({ id: company.id })
        .onConflictDoNothing({ target: [company.name] });

      if (insertedCompany) {
        companyIds.set(companyName, insertedCompany.id);
      } else {
        const [existingCompany] = await db
          .select()
          .from(company)
          .where(eq(company.name, companyName))
          .limit(1);

        if (existingCompany) {
          companyIds.set(companyName, existingCompany.id);
        }
      }
    }

    // Insert positions
    for (const [companyName, positions] of Object.entries(companyData)) {
      const companyId = companyIds.get(companyName);

      if (!companyId) {
        console.warn(
          `Company ID not found for ${companyName}, skipping positions`,
        );
        continue;
      }

      const positionValues = positions.map((pos) => ({
        companyId,
        name: pos.position,
      }));

      // Insert positions in batches
      const batchSize = 100;
      for (let i = 0; i < positionValues.length; i += batchSize) {
        const batch = positionValues.slice(i, i + batchSize);

        await db.insert(position)
          .values(batch)
          .onConflictDoNothing({
            target: [position.companyId, position.name],
          });

        console.log(
          `Inserted batch ${Math.floor(i / batchSize) + 1} for ${companyName}`,
        );
      }
    }

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}
