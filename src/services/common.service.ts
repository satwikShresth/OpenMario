import { database } from '#db/index.ts';

export class Service {
   constructor(protected db: database) {}
}
