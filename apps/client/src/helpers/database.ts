import { db } from '@/db/dexie';
import JSZip from 'jszip';

function arrayToCSV(data: any[], headers: string[]): string {
   if (data.length === 0) return headers.join(',') + '\n';
   const escape = (v: any): string => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return s.includes(',') || s.includes('"') || s.includes('\n')
         ? `"${s.replace(/"/g, '""')}"` : s;
   };
   return [headers.join(','), ...data.map(row => headers.map(h => escape(row[h])).join(','))].join('\n');
}

function downloadZip(filename: string, blob: Blob): void {
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

export async function exportDatabaseAsCSV(): Promise<{
   success: boolean; message: string; filesExported: number;
}> {
   try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const zip = new JSZip();
      let filesExported = 0;

      const tables: Array<{ name: string; file: string; rows: () => Promise<any[]> }> = [
         { name: 'submissions',    file: 'submissions.csv',       rows: () => db.submissions.toArray() },
         { name: 'terms',          file: 'terms.csv',             rows: () => db.terms.toArray() },
         { name: 'courses',        file: 'courses.csv',           rows: () => db.courses.toArray() },
         { name: 'sections',       file: 'sections.csv',          rows: () => db.sections.toArray() },
         { name: 'plan_events',    file: 'plan-events.csv',       rows: () => db.plan_events.toArray() },
      ];

      for (const { file, rows } of tables) {
         const data = await rows();
         if (data.length > 0) {
            zip.file(file, arrayToCSV(data, Object.keys(data[0]!)));
            filesExported++;
         }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      downloadZip(`openmario-database-export-${timestamp}.zip`, blob);
      return { success: true, message: `Successfully exported ${filesExported} file${filesExported !== 1 ? 's' : ''} in a ZIP archive`, filesExported };
   } catch (error) {
      console.error('[Database Export] Failed to export database:', error);
      return { success: false, message: `Failed to export database: ${error instanceof Error ? error.message : 'Unknown error'}`, filesExported: 0 };
   }
}

export async function clearDatabaseAndReload(): Promise<void> {
   try {
      await db.delete();
      window.location.reload();
   } catch (error) {
      console.error('[Database] Failed to clear database:', error);
      throw error;
   }
}
