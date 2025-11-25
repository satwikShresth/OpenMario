import { db } from '@/db';
import * as schema from '@/db/schema';

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[], headers: string[]): string {
   if (data.length === 0) return headers.join(',') + '\n';

   const escapeCSVValue = (value: any): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
         return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
   };

   const rows = data.map(row =>
      headers.map(header => escapeCSVValue(row[header])).join(',')
   );

   return [headers.join(','), ...rows].join('\n');
}

/**
 * Download a CSV file
 */
function downloadCSV(filename: string, csvContent: string): void {
   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
   const link = document.createElement('a');
   const url = URL.createObjectURL(blob);
   
   link.setAttribute('href', url);
   link.setAttribute('download', filename);
   link.style.visibility = 'hidden';
   
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   
   URL.revokeObjectURL(url);
}

/**
 * Export all database tables as CSV files
 */
export async function exportDatabaseAsCSV(): Promise<{
   success: boolean;
   message: string;
   filesExported: number;
}> {
   try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      let filesExported = 0;

      // Export submissions
      const submissions = await db.select().from(schema.submissions);
      if (submissions.length > 0) {
         const headers = Object.keys(submissions[0]);
         const csv = arrayToCSV(submissions, headers);
         downloadCSV(`openmario-submissions-${timestamp}.csv`, csv);
         filesExported++;
      }

      // Export company positions
      const companyPositions = await db.select().from(schema.companyPositions);
      if (companyPositions.length > 0) {
         const headers = Object.keys(companyPositions[0]);
         const csv = arrayToCSV(companyPositions, headers);
         downloadCSV(`openmario-company-positions-${timestamp}.csv`, csv);
         filesExported++;
      }

      // Export terms
      const terms = await db.select().from(schema.terms);
      if (terms.length > 0) {
         const headers = Object.keys(terms[0]);
         const csv = arrayToCSV(terms, headers);
         downloadCSV(`openmario-terms-${timestamp}.csv`, csv);
         filesExported++;
      }

      // Export courses
      const courses = await db.select().from(schema.courses);
      if (courses.length > 0) {
         const headers = Object.keys(courses[0]);
         const csv = arrayToCSV(courses, headers);
         downloadCSV(`openmario-courses-${timestamp}.csv`, csv);
         filesExported++;
      }

      // Export sections
      const sections = await db.select().from(schema.sections);
      if (sections.length > 0) {
         const headers = Object.keys(sections[0]);
         const csv = arrayToCSV(sections, headers);
         downloadCSV(`openmario-sections-${timestamp}.csv`, csv);
         filesExported++;
      }

      // Export favorites
      const favorites = await db.select().from(schema.favorites);
      if (favorites.length > 0) {
         const headers = Object.keys(favorites[0]);
         const csv = arrayToCSV(favorites, headers);
         downloadCSV(`openmario-favorites-${timestamp}.csv`, csv);
         filesExported++;
      }

      // Export plan events
      const planEvents = await db.select().from(schema.planEvents);
      if (planEvents.length > 0) {
         const headers = Object.keys(planEvents[0]);
         const csv = arrayToCSV(planEvents, headers);
         downloadCSV(`openmario-plan-events-${timestamp}.csv`, csv);
         filesExported++;
      }

      return {
         success: true,
         message: `Successfully exported ${filesExported} file${filesExported !== 1 ? 's' : ''}`,
         filesExported
      };
   } catch (error) {
      console.error('[Database Export] Failed to export database:', error);
      return {
         success: false,
         message: `Failed to export database: ${error instanceof Error ? error.message : 'Unknown error'}`,
         filesExported: 0
      };
   }
}

/**
 * Clear the database and reload the page
 */
export async function clearDatabaseAndReload(): Promise<void> {
   try {
      const dbName = 'openmario-data';
      const deleteRequest = indexedDB.deleteDatabase(dbName);

      await new Promise<void>((resolve, reject) => {
         deleteRequest.onsuccess = () => {
            console.log('[Database] Database cleared successfully');
            resolve();
         };
         deleteRequest.onerror = () => {
            reject(new Error('Failed to clear database'));
         };
         deleteRequest.onblocked = () => {
            console.warn('[Database] Database deletion blocked, forcing reload...');
            window.location.reload();
         };
      });

      // Reload the page to reinitialize with fresh database
      window.location.reload();
   } catch (error) {
      console.error('[Database] Failed to clear database:', error);
      throw error;
   }
}

