import { BookService } from "./books.service.js";
import { db } from "../db/index.js";

export const bookService = new BookService(db) 
