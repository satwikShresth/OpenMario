import { 
  company, 
  position, 
  location, 
  job_posting,
  job_experience_levels,
  job_posting_major,
  major
} from "../../../src/db/index.ts";
import {writeFileSync, appendFileSync } from 'node:fs';
import { db } from "../../../src/db/index.ts";
import { eq, and } from 'drizzle-orm';
import jobData from "./assets/job_posting.json" with {type:"json"}
import locationData from "./assets/cleaned_location.json" with {type:"json"}
import locationDataCleaned from "./assets/ccleaned_location.json" with {type:"json"}
import cleanedMajorData from "./assets/cleaned_majors_map.json" with {type:"json"}

const problematicAddressesFile = 'problematic_addresses.txt';
const problematicMajorsFile = 'problematic_majors.txt';

function logProblematicAddress(employer, position, locationString) {
  const logEntry = `
Employer: ${employer}
Position: ${position}
Location String: ${locationString}
-----------------------------------------
`;

  appendFileSync(problematicAddressesFile, logEntry);
}

function logProblematicMajor(employer, position, majorString) {
  const logEntry = `
Employer: ${employer}
Position: ${position}
Major String: ${majorString}
-----------------------------------------
`;

  appendFileSync(problematicMajorsFile, logEntry);
}

// Helper function to get state name from state code
function getStateName(stateCode) {
  const stateMap = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming",
    "DC": "District of Columbia"
  };

  return stateMap[stateCode.toUpperCase()] || "Unknown";
}

// Parse job duration to extract cycle
function parseCycle(duration) {
  if (duration.includes("Fall/Winter")) return "Fall/Winter";
  if (duration.includes("Winter/Spring")) return "Winter/Spring";
  if (duration.includes("Spring/Summer")) return "Spring/Summer";
  if (duration.includes("Summer/Fall")) return "Summer/Fall";
  return "Fall/Winter"; // Default
}

// Parse job duration to extract year
function parseYear(duration) {
  // Extract year from a string like "Spring/Summer (March 2023 - Sept 2023)"
  const match = duration.match(/\d{4}/);
  if (match) {
    return parseInt(match[0]);
  }
  return new Date().getFullYear(); // Default to current year
}

// Helper function to find or create a company and return its ID
async function findOrCreateCompany(companyName) {
  // Insert with onConflictDoNothing and return the ID
  const result = await db.insert(company)
    .values({ name: companyName })
    .onConflictDoUpdate({
      target: company.name,
      set: { name: companyName }
    })
    .returning({ id: company.id });

  if (result.length > 0) {
    return result[0].id;
  }

  // If no result is returned, query the existing record
  const existing = await db.select({ id: company.id })
    .from(company)
    .where(eq(company.name, companyName))
    .limit(1);

  return existing[0].id;
}

// Helper function to find or create a position
async function findOrCreatePosition(positionName, companyId) {
  // Insert with onConflictDoNothing and return the ID
  const result = await db.insert(position)
    .values({
      name: positionName,
      company_id: companyId
    })
    .onConflictDoUpdate({
      target: [position.company_id, position.name],
      set: { 
        name: positionName,
        company_id: companyId
      }
    })
    .returning({ id: position.id });

  if (result.length > 0) {
    return result[0].id;
  }

  // If no result is returned, query the existing record
  const existing = await db.select({ id: position.id })
    .from(position)
    .where(and(
      eq(position.name, positionName),
      eq(position.company_id, companyId)
    ))
    .limit(1);

  return existing[0].id;
}

// Helper function to find or create a location
async function findOrCreateLocation(city, state, stateCode) {
  // Insert with onConflictDoNothing and return the ID
  const result = await db.insert(location)
    .values({
      city,
      state,
      state_code: stateCode
    })
    .onConflictDoUpdate({
      target: [location.city, location.state, location.state_code],
      set: { 
        city,
        state,
        state_code: stateCode
      }
    })
    .returning({ id: location.id });

  if (result.length > 0) {
    return result[0].id;
  }

  // If no result is returned, query the existing record
  const existing = await db.select({ id: location.id })
    .from(location)
    .where(and(
      eq(location.city, city),
      eq(location.state, state),
      eq(location.state_code, stateCode)
    ))
    .limit(1);

  return existing[0].id;
}

// Helper function to find or create a major
async function findOrCreateMajor(majorName, programLevel) {
  // Insert with onConflictDoNothing and return the ID
  const result = await db.insert(major)
    .values({
      name: majorName,
      program_level: programLevel
    })
    .onConflictDoUpdate({
      target: major.name,
      set: { 
        name: majorName,
        program_level: programLevel
      }
    })
    .returning({ id: major.id });

  if (result.length > 0) {
    return result[0].id;
  }

  // If no result is returned, query the existing record
  const existing = await db.select({ id: major.id })
    .from(major)
    .where(eq(major.name, majorName))
    .limit(1);

  return existing[0].id;
}

// Main seeding function
async function seedDatabase() {
  console.log("Starting database seeding...");

  // Clear the problematic files before starting
  writeFileSync(problematicAddressesFile, '# Problematic Addresses for Manual Review\n\n');
  writeFileSync(problematicMajorsFile, '# Problematic Majors for Manual Review\n\n');
  console.log(`Created tracking files for problematic data`);

  for (const job of jobData) {
    try {
      // 1. Find or create company
      const companyId = await findOrCreateCompany(job.Employer);
      console.log(`Company: ${job.Employer} (${companyId})`);

      // 2. Find or create position
      const positionId = await findOrCreatePosition(job.Position, companyId);
      console.log(`Position: ${job.Position} (${positionId})`);

      // 3. Get location from locationData or use Unknown
      const locationString = job.Location.Address;
      let locationId;

      if (locationData[locationString]) {
        // Location exists in the cleaned location data
        const stateCity = locationData[locationString];
        const value = stateCity in locationDataCleaned ? locationDataCleaned[stateCity] : stateCity;

        const [city, stateCode] = value.split(', ');
        const state = getStateName(stateCode);

        locationId = await findOrCreateLocation(city, state, stateCode);
        console.log(`Location from data: ${city}, ${state} (${locationId})`);
      } else {
        // Location not found in locationData, log as problematic
        logProblematicAddress(job.Employer, job.Position, locationString);

        locationId = null;
        console.log(`Location not found, using null (${locationId})`);
      }

      // 4. Create job posting
      const jobPostingResult = await db.insert(job_posting)
        .values({
          position_id: positionId,
          location_id: locationId,
          job_type: job["Job's Type"],
          job_status: job["Job's Status"],
          coop_cycle: parseCycle(job["Job's Duration"]),
          year: parseYear(job["Job's Duration"]),
          job_length: parseInt(job["Job's Length"].split(" ")[0]) || 2,
          work_hours: parseInt(job.Compensation["Hours Per Week"]) || 40,
          openings: parseInt(job["Number of Openings"]) || 1,
          division_description: job["Division/Location/Company Description"],
          position_description: job["Position Description"],
          recommended_qualifications: job.Qualifications["Recommended Qualifications"],
          minimum_gpa: job["Minimum GPA"] !== "- None -" ? parseFloat(job["Minimum GPA"]) : null,
          is_nonprofit: !!job["Non-Profit Co."],
          exposure_hazardous_materials: !!job["Exposure to hazardous materials"],
          is_research_position: !!job["Research Position"] && ["yes", "true"].includes(job["Research Position"].toLowerCase()),
          is_third_party_employer: !!job["Third-party employer"] && ["yes", "true"].includes(job["Third-party employer"].toLowerCase()),
          travel_required: !!job.Location["Travel Required"] && ["yes", "true"].includes(job.Location["Travel Required"].toLowerCase()),
          citizenship_restriction: job["Citizenship Restriction"],
          pre_employment_screening: job["Pre-Employment Screening"],
          transportation: job.Location["Transportation"],
          compensation_status: job.Compensation["Status"],
          compensation_details: job.Compensation["Details"],
          other_compensation: job.Compensation["Other"]
        })
        .returning({ id: job_posting.id }); 
      const jobPostingId = jobPostingResult[0].id;
      console.log(`Job Posting: ${jobPostingId}`);

      // 5. Add experience levels
      if (job.Qualifications["Experience Levels"]) {
        for (const [level, description] of Object.entries(job.Qualifications["Experience Levels"])) {
          await db.insert(job_experience_levels)
          .values({
            job_posting_id: jobPostingId,
            experience_level: level,
            description
          })
          .onConflictDoNothing();
        }
        console.log(`Added experience levels`);
      }

      // 6. Add majors if available - UPDATED to use cleanedMajorData
      if (job.Qualifications["Majors Sought"]) {
        const majorStrings = job.Qualifications["Majors Sought"];

        for (const majorString of majorStrings) {
          if (cleanedMajorData[majorString]) {
            const major = cleanedMajorData[majorString];

            const majorId = await findOrCreateMajor(major, "Undergraduate");

            await db.insert(job_posting_major)
            .values({
              job_posting_id: jobPostingId,
              major_id: majorId
            })
            .onConflictDoNothing();

            console.log(`Added major: ${name} (${majorId})`);
          } else {
            // Major not found in cleanedMajorData, log as problematic
            logProblematicMajor(job.Employer, job.Position, majorString);
            console.log(`Major not found in cleaned data: ${majorString}`);
          }
        }
      }

      console.log(`Successfully added job: ${job.Position} at ${job.Employer}`);
    } catch (error) {
      console.error(`Error processing job ${job.Position} at ${job.Employer}:`, error);
    }
  }

  console.log("Database seeding completed");
}

// Execute the seeding function
export default seedDatabase;
