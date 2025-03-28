import axios from 'npm:axios';
import * as cheerio from 'npm:cheerio';
import {subjects} from "./subjects.ts";

/**
 * Helper function to flatten the subject list
 */
function flattenSubjects(subjects) {
  const flattened = {};
  
  Object.keys(subjects).forEach(collegeKey => {
    const college = subjects[collegeKey];
    Object.keys(college.subjects).forEach(subjectCode => {
      flattened[subjectCode] = {
        code: subjectCode,
        name: college.subjects[subjectCode],
        college: college.title
      };
    });
  });
  
  return flattened;
}

/**
 * Create HTTP client with retries and timeouts
 */
function createAxiosInstance() {
  return axios.create({
    timeout: 30000, // 30 seconds
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });
}

/**
 * Function to sanitize text by removing excess spaces and newlines
 */
function sanitizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Simplified function to scrape and parse course info for a specific subject
 */
async function scrapeCourses(subjectCode, httpClient, baseUrl) {
  const url = `${baseUrl}/coursedescriptions/quarter/undergrad/${subjectCode.toLowerCase()}/`;
  console.log(`Scraping ${subjectCode} from ${url}`);
  
  try {
    const response = await httpClient.get(url);
    
    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Load HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Extract only the content_left div as requested
    const contentLeftHtml = $('#content_left').html();
    if (!contentLeftHtml) {
      throw new Error(`Could not find #content_left div for ${subjectCode}`);
    }
    
    // Extract just the courseblock elements
    const courses = [];
    
    $('.courseblock').each((i, element) => {
      try {
        // Extract the course block HTML
        const courseHtml = $(element).html();
        
        // Check for Writing Intensive marker
        const isWI = $(element).text().includes('[WI]');
        
        // Get just the title part
        const titleElement = $(element).find('.courseblocktitle');
        const rawTitle = titleElement.text().trim();
        
        // Extract course code and title using regex
        const titlePattern = /([A-Z]+)\s*([A-Z]?\d+[A-z]?)\s+(.*)\s+(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?)\s+Credits?/i;
        const titleMatch = rawTitle.replace('[WI]', '').match(titlePattern);
        
        if (!titleMatch) {
        console.log(titleMatch)
          console.log(`Could not parse course title: "${rawTitle}"`);
          return;
        }
        
        const subject = titleMatch[1].trim();
        const number = titleMatch[2].trim();
        const title = titleMatch[3].trim();
        const credits = titleMatch[4].trim();
        
        // Get description
        const descElement = $(element).find('.courseblockdesc');
        const description = descElement.text().trim();
        
        // Convert the rest of the course block to plain text for easier parsing
        // Remove the title and description elements first
        titleElement.remove();
        descElement.remove();
        
        // Get the remaining text
        const metadataText = $(element).text().trim();
        
        // Extract fields based on text patterns
        let college = '';
        let repeatStatus = '';
        let prerequisites = '';
        let corequisites = '';
        let restrictions = '';
        
        // College/Department
        const collegeMatch = metadataText.match(/College\/Department:\s*([^]*?)(?:Repeat Status:|Restrictions:|Prerequisites:|Corequisites?:|$)/);
        if (collegeMatch) {
          college = sanitizeText(collegeMatch[1]);
        }
        
        // Repeat Status
        const repeatMatch = metadataText.match(/Repeat Status:\s*([^]*?)(?:Restrictions:|Prerequisites:|Corequisites?:|$)/);
        if (repeatMatch) {
          repeatStatus = sanitizeText(repeatMatch[1]);
        }
        
        // Restrictions
        const restrictionsMatch = metadataText.match(/Restrictions:\s*([^]*?)(?:Prerequisites:|Corequisites?:|$)/);
        if (restrictionsMatch) {
          restrictions = sanitizeText(restrictionsMatch[1]);
        }
        
        // Prerequisites
        const prerequisitesMatch = metadataText.match(/Prerequisites:\s*([^]*?)(?:Corequisites?:|$)/);
        if (prerequisitesMatch) {
          prerequisites = sanitizeText(prerequisitesMatch[1]);
        }
        
        // Corequisites (both singular and plural forms)
        const corequisitesMatch = metadataText.match(/Corequisites?:?\s*([^]*?)$/);
        if (corequisitesMatch) {
          corequisites = sanitizeText(corequisitesMatch[1]);
        }
        
        // Create course object
        const course = {
          subject,
          number,
          title,
          credits,
          description: sanitizeText(description),
          college,
          repeatStatus,
          prerequisites,
          corequisites,
          restrictions,
          writingIntensive: isWI
        };
        
        courses.push(course);
      } catch (error) {
        console.error(`Error parsing course:`, error);
      }
    });
    
    console.log(`Found ${courses.length} courses for ${subjectCode}`);
    return courses;
  } catch (error) {
    console.error(`Error scraping ${subjectCode}:`, error);
    return [];
  }
}

/**
 * Function to scrape all subjects with concurrency control
 */
async function scrapeAllSubjects(flattenedSubjects, maxConcurrentRequests = 3) {
  const allCourses = {};
  const httpClient = createAxiosInstance();
  const baseUrl = 'https://catalog.drexel.edu';
  
  // Use a simple rate limiter to avoid overwhelming the server
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Process subjects in batches to control concurrency
  const subjectCodes = Object.keys(flattenedSubjects);
  const batches = [];
  
  for (let i = 0; i < subjectCodes.length; i += maxConcurrentRequests) {
    batches.push(subjectCodes.slice(i, i + maxConcurrentRequests));
  }
  
  console.log(`Processing ${subjectCodes.length} subjects in ${batches.length} batches`);
  
  for (let i = 0; i < batches.length; i++) {
    console.log(`Processing batch ${i+1} of ${batches.length}`);
    
    // Process each batch concurrently
    const batchPromises = batches[i].map(async (subjectCode) => {
      console.log(`Starting to process ${subjectCode} - ${flattenedSubjects[subjectCode].name}`);
      
      try {
        // Add retry logic
        let retries = 3;
        let courses = [];
        
        while (retries > 0) {
          try {
            courses = await scrapeCourses(subjectCode, httpClient, baseUrl);
            break; // Success, exit retry loop
          } catch (error) {
            retries--;
            if (retries === 0) throw error;
            
            console.log(`Retrying ${subjectCode} (${retries} attempts left)...`);
            await delay(2000);
          }
        }
        
        if (courses.length > 0) {
          return {
            subjectCode,
            data: {
              name: flattenedSubjects[subjectCode].name,
              college: flattenedSubjects[subjectCode].college,
              courses
            }
          };
        }
      } catch (error) {
        console.error(`Error processing ${subjectCode}:`, error);
      }
      
      return null;
    });
    
    // Wait for all promises in the batch to resolve
    const batchResults = await Promise.all(batchPromises);
    
    // Add successful results to allCourses
    batchResults.forEach(result => {
      if (result) {
        allCourses[result.subjectCode] = result.data;
      }
    });
    
    // Wait between batches to be nice to the server
    if (i < batches.length - 1) {
      await delay(3000);
    }
  }
  
  return allCourses;
}

/**
 * Function to save data to file with error handling
 */
function saveToFile(data, filename) {
  try {
    Deno.writeTextFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Data successfully saved to ${filename}`);
  } catch (error) {
    console.error(`Error saving data to ${filename}:`, error);
    
    // Try backup save
    try {
      const backupFilename = `backup_${filename}`;
      Deno.writeTextFileSync(backupFilename, JSON.stringify(data, null, 2));
      console.log(`Data saved to backup file: ${backupFilename}`);
    } catch (backupError) {
      console.error(`Failed to save backup file:`, backupError);
    }
  }
}

/**
 * Main execution function with error handling
 */
async function main() {
  try {
    console.log('Starting Drexel course catalog scraping...');
    
    // Flatten subjects for easier access
    const flattenedSubjects = flattenSubjects(subjects);
    console.log(`Prepared ${Object.keys(flattenedSubjects).length} subjects for scraping`);
    
    // Scrape all subjects
    const allCourses = await scrapeAllSubjects(flattenedSubjects);
    
    // Validate the data before saving
    const totalSubjects = Object.keys(allCourses).length;
    const totalCourses = Object.values(allCourses).reduce((sum, subject) => sum + subject.courses.length, 0);
    
    if (totalSubjects === 0 || totalCourses === 0) {
      console.warn("Warning: No courses or subjects were scraped. Data may be incomplete.");
    }
    
    // Save complete data
    saveToFile(allCourses, 'drexel_courses.json');
    
    // Generate summary
    const summary = {
      totalSubjects,
      totalCourses,
      subjectCounts: Object.entries(allCourses).reduce((acc, [key, value]) => {
        acc[key] = value.courses.length;
        return acc;
      }, {}),
      scrapedAt: new Date().toISOString()
    };
    
    console.log('Scraping complete!');
    console.log(`Total subjects scraped: ${summary.totalSubjects}`);
    console.log(`Total courses scraped: ${summary.totalCourses}`);
    
    // Add validation checks
    const emptySubjects = Object.entries(summary.subjectCounts)
      .filter(([_, count]) => count === 0)
      .map(([code]) => code);
    
    if (emptySubjects.length > 0) {
      console.warn(`Warning: ${emptySubjects.length} subjects had zero courses:`, emptySubjects);
    }
    
    // Save summary
    saveToFile(summary, 'drexel_courses_summary.json');
    
  } catch (error) {
    console.error('An error occurred during execution:', error);
    
    // Try to save any partial data
    if (typeof allCourses !== 'undefined' && Object.keys(allCourses).length > 0) {
      saveToFile(allCourses, 'drexel_courses_partial.json');
      console.log('Partial data saved to drexel_courses_partial.json');
    }
  }
}

// Run the script
main();
