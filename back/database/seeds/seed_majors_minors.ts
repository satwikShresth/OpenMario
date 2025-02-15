import { join } from "jsr:@std/path";
import { db } from "db";
import { programLevelType } from "../schema/enums.ts";
import { major, minor } from "../schema/table.ts";

async function parseFile(filename: string): Promise<string[]> {
  const content = await Deno.readTextFile(filename);
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

const assets = join(Deno.cwd(), "database", "seeds", "assets");

export async function seedMajorsMinors() {
  try {
    const gMajors = await parseFile(join(assets, "g_majors.txt"));
    const ugMajors = await parseFile(join(assets, "ug_majors.txt"));

    const majorData: {
      name: string;
      programLevel: typeof programLevelType;
    }[] = [
      ...gMajors.map((name) => ({
        name: name.trim(),
        programLevel: "Graduate" as const,
      })),
      ...ugMajors.map((name) => ({
        name: name.trim(),
        programLevel: "Undergraduate" as const,
      })),
    ];

    // Process minors
    const gMinors = await parseFile(join(assets, "g_minors.txt"));
    const ugMinors = await parseFile(join(assets, "ug_minors.txt"));

    const minorData: {
      name: string;
      programLevel: typeof programLevelType;
    }[] = [
      ...gMinors.map((name) => ({
        name: name.trim(),
        programLevel: "Graduate" as const,
      })),
      ...ugMinors.map((name) => ({
        name: name.trim(),
        programLevel: "Undergraduate" as const,
      })),
    ];

    // Insert majors in batches
    const batchSize = 100;
    for (let i = 0; i < majorData.length; i += batchSize) {
      const batch = majorData.slice(i, i + batchSize);
      await db.insert(major)
        .values(batch)
        .onConflictDoNothing({ target: [major.name] });

      console.log(`Inserted majors batch ${Math.floor(i / batchSize) + 1}`);
    }

    // Insert minors in batches
    for (let i = 0; i < minorData.length; i += batchSize) {
      const batch = minorData.slice(i, i + batchSize);
      await db.insert(minor)
        .values(batch)
        .onConflictDoNothing({ target: [minor.name] });

      console.log(`Inserted minors batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    Deno.exit(1);
  }
}
