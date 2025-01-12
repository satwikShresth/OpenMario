import { database } from "../db/index.js";

export class Service {
    constructor(protected db: database) { }
}
