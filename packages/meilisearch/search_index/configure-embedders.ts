/**
 * Configure Meilisearch embedders + document templates for hybrid/semantic search.
 *
 * Usage:
 *   bun run --env-file=../../.env packages/meilisearch/search_index/configure-embedders.ts
 *
 * Requires OPENAI_API_KEY in the environment (or MEILI will reject openAi source).
 * After this runs, Meilisearch embeds existing documents asynchronously — wait for tasks.
 */

import { MeiliSearch } from 'meilisearch';

const host = process.env.MEILI_HOST;
const masterKey = process.env.MEILI_MASTER_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!host || !masterKey) {
   console.error('MEILI_HOST and MEILI_MASTER_KEY are required');
   process.exit(1);
}

if (!openaiKey) {
   console.error(
      'OPENAI_API_KEY is required to configure the OpenAI embedder'
   );
   process.exit(1);
}

const client = new MeiliSearch({ host, apiKey: masterKey });

const INDEX_CONFIG: Record<
   string,
   { description: string; documentTemplate: string }
> = {
   sections: {
      description:
         'Drexel University course sections with schedule, instructors, credits, and catalog titles',
      documentTemplate:
         "Section {{doc.course}} {{doc.title}} (CRN {{doc.crn}}) in term {{doc.term}}. Subject {{doc.subject_name}}, college {{doc.college_name}}. {{doc.credits}} credits, {{doc.instruction_type}} / {{doc.instruction_method}}. Days {{doc.days}}. Instructors: {% for i in doc.instructors %}{{ i.name }} (rating {{ i.avg_rating }}){% unless forloop.last %}, {% endunless %}{% endfor %}. {{ doc.description | truncatewords: 80 }}"
   },
   professors: {
      description:
         'Drexel professors with RateMyProfessors ratings, departments, and courses taught',
      documentTemplate:
         "Professor {{doc.name}} in {{doc.department}}. Average rating {{doc.avg_rating}}, difficulty {{doc.avg_difficulty}}, {{doc.num_ratings}} ratings. Taught {{doc.total_sections_taught}} sections across subjects {{doc.subjects_taught}}. Courses: {% for c in doc.courses_taught %}{{ c.code }} {{ c.title }}{% unless forloop.last %}; {% endunless %}{% endfor %}"
   },
   companies: {
      description:
         'Co-op employers with omega scores, compensation aggregates, and review stats',
      documentTemplate:
         "Company {{doc.company_name}}. Omega score {{doc.omega_score}}, avg compensation {{doc.avg_compensation}}, {{doc.pct_would_recommend}}% would recommend, {{doc.total_reviews}} reviews. Positions: {{doc.positions}}"
   },
   submissions: {
      description:
         'Anonymized co-op salary submissions with company, position, location, and pay',
      documentTemplate:
         "{{doc.company_name}} {{doc.position_name}} in {{doc.city}}, {{doc.state_code}}. {{doc.compensation}}/hr for {{doc.work_hours}} hours. {{doc.coop_year}} co-op {{doc.coop_cycle}} {{doc.year}} {{doc.program_level}}. {{doc.other_compensation}} {{doc.details}}"
   }
};

async function waitTask(uid: number) {
   let task = await client.getTask(uid);
   while (task.status === 'enqueued' || task.status === 'processing') {
      await Bun.sleep(500);
      task = await client.getTask(uid);
   }
   if (task.status === 'failed') {
      throw new Error(
         `Task ${uid} failed: ${JSON.stringify(task.error ?? task)}`
      );
   }
   return task;
}

for (const [indexUid, meta] of Object.entries(INDEX_CONFIG)) {
   console.log(`Configuring embedder for ${indexUid}…`);
   const index = client.index(indexUid);

   const embedderTask = await index.updateEmbedders({
      default: {
         source: 'openAi',
         apiKey: openaiKey,
         model: 'text-embedding-3-small',
         documentTemplate: meta.documentTemplate
      }
   });
   await waitTask(embedderTask.taskUid);

   // Optional chat settings help future conversational UI; harmless for hybrid search.
   try {
      const chatTask = await index.updateSettings({
         // @ts-expect-error chat settings are experimental on some Meili versions
         chat: {
            description: meta.description,
            documentTemplate: meta.documentTemplate,
            documentTemplateMaxBytes: 400
         }
      });
      await waitTask(chatTask.taskUid);
   } catch (e) {
      console.warn(
         `[${indexUid}] chat settings skipped:`,
         e instanceof Error ? e.message : e
      );
   }

   console.log(`✓ ${indexUid}`);
}

console.log('Done. Embeddings will generate asynchronously for existing docs.');
