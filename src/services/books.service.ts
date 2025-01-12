import { eq } from "drizzle-orm";
import { books } from "../db/schema.js";
import { Book, BookCreate, BookUpdate } from "../db/types.js";
import { Service } from "./common.service.js";


export class BookService extends Service {
    async getBooks(): Promise<Book[]> {
        return await this.db
            .select()
            .from(books);
    }

    async getBookById(id: number): Promise<Book | undefined> {
        const result = await this.db
            .select()
            .from(books)
            .where(eq(books.id, id))

        return result[0];
    }

    async getBooksByAuthorId(author_id: number): Promise<Book[]> {
        return await this.db
            .select()
            .from(books)
            .where(eq(books.author_id, author_id));
    }

    async createBook(data: BookCreate): Promise<Book> {
        const [newBook] = await this.db
            .insert(books)
            .values(data)
            .returning();
        if (!newBook) {
            throw new Error('Failed to create book');
        }
        return newBook;
    }

    async updateBook(id: number, data: BookUpdate): Promise<Book | undefined> {
        if (Object.keys(data).length === 0) {
            return await this.getBookById(id);
        }

        const [updatedBook] = await this.db
            .update(books)
            .set(data)
            .where(eq(books.id, id))
            .returning();

        return updatedBook;
    }

    async deleteBook(id: number): Promise<void> {
        await this.db
            .delete(books)
            .where(eq(books.id, id));
    }

    async deleteBooksByAuthorId(authorId: number): Promise<void> {
        await this.db
            .delete(books)
            .where(eq(books.author_id, authorId));
    }
}
