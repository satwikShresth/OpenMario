import { join } from "jsr:@std/path";
import { company, position } from "../../src/db/schema.ts";
import { db } from "../../src/db/index.ts";
import { eq } from "drizzle-orm";

export async function seedComapnyPositions() {
  try {
    const fileContent = await Deno.readTextFile(
      join(Deno.cwd(), "database", "seeds", "assets", "company_positions.json"),
    );

    // Parse the new structure: { companyName: string[] }
    const companyData: { [key: string]: string[] } = JSON.parse(fileContent);

    const companyIds = new Map<string, string>();

    // Insert or retrieve companies
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

    // Insert positions for each company using the new structure
    for (const [companyName, positions] of Object.entries(companyData)) {
      const company_id = companyIds.get(companyName);
      if (!company_id) {
        console.warn(`Company ID not found for ${companyName}, skipping positions`);
        continue;
      }

      const positionValues = positions.map((pos: string) => ({
        company_id,
        name: pos.trim(),
      }));

      const batchSize = 100;
      for (let i = 0; i < positionValues.length; i += batchSize) {
        const batch = positionValues.slice(i, i + batchSize);
        await db.insert(position)
          .values(batch)
          .onConflictDoNothing({
            target: [position.company_id, position.name],
          });
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} for ${companyName}`);
      }
    }

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

