# @openmario/scraper

RMP (Rate My Professor) scraper for updating professor ratings in OpenMario.

## Usage

### Update instructor RMP data

```bash
cd packages/scraper
bun run update-rmp
```

Or from repo root:

```bash
bun run --cwd packages/scraper update-rmp
```

### Environment variables

| Variable        | Description                          | Default              |
| --------------- | ------------------------------------ | -------------------- |
| `DATABASE_URL`  | PostgreSQL connection string (required) | -                    |
| `RMP_SCHOOL_NAME` | School name to search on RMP       | `Drexel University`  |
| `RMP_DELAY_MS`  | Delay between API calls (rate limiting) | `500`              |

### Programmatic API

```ts
import {
  searchSchools,
  searchProfessorsAtSchool,
  getProfessorRating,
} from '@openmario/scraper';

// Find school ID
const schools = await searchSchools('Drexel University');
const schoolId = schools?.[0]?.node.id;

// Get professor rating
const rating = await getProfessorRating('Dimitri Papadopoulos', schoolId!);
// => { avgRating, avgDifficulty, numRatings, rmpId, rmpLegacyId, ... }
```
