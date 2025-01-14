import { BookService } from './books.service.ts';
import { db } from '#db/index.ts';

export const bookService = new BookService(db);
