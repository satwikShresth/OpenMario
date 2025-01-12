//import { Request, Response, Router, NextFunction } from 'express';
//import { z } from 'zod';
//import { AuthorCreateSchema, BookCreateSchema, BookUpdateSchema } from '../db/types.js';
//import { authorService, bookService } from '../services/index.js';
//import { formatZodError } from '../utils/formatter.js';
//
//interface RequestParamsId extends Request {
//    params: {
//        id: string;
//    };
//    validatedId?: number;
//}
//
//const paramsIdSchema = z.object({
//    id: z.preprocess(
//        (val) => Number(val),
//        z.number().positive()
//    ),
//});
//
//const validateId = async (req: RequestParamsId, res: Response, next: NextFunction) => {
//    const result = await paramsIdSchema.safeParseAsync({ id: req.params.id });
//
//    if (!result.success) {
//        return res.status(400).json(formatZodError(result.error));
//    }
//
//    req.validatedId = result.data.id;
//    next();
//};
//export default () => {
//    const router = Router();
//
//    router.route('/')
//        .get(async (_req: Request, res: Response) => {
//            const books = await bookService.getBooks();
//            res.json(books);
//        })
//        .post(async (req: Request, res: Response) => {
//            const result = await BookCreateSchema.safeParseAsync(req.body);
//
//            if (!result.success) {
//                res.status(400).send({ type: 'Body', errors: formatZodError(result.error).error });
//            }
//
//            const author = await authorService.getAuthorById(result.data.author_name as number);
//
//            if (!author) {
//                return res.status(400).json({ detail: 'Author not found' });
//            }
//
//            const newBook = await bookService.createBook(result.data);
//            res.status(201).json(newBook);
//        });
//
//    router.route('/:id')
//        .all(validateId)
//        .get(async (req: RequestParamsId, res: Response) => {
//
//        })
//        .put(async (req: RequestParamsId, res: Response) => {
//            const result = await BookUpdateSchema.safeParseAsync(req.body);
//            if (!result.success) {
//                return sendError({ type: 'Body', errors: result.error }, res);
//            }
//
//            if (result.data.author_id) {
//                const author = await authorService.getAuthorById(result.data.author_id);
//                if (!author) {
//                    return res.status(400).json({ detail: 'Author not found' });
//                }
//            }
//
//            const book = await bookService.getBookById(req.validatedId!);
//            if (!book) {
//                return res.status(404).json({ detail: 'Book not found' });
//            }
//
//            const updatedBook = await bookService.updateBook(req.validatedId!, result.data);
//            res.json(updatedBook);
//        })
//        .delete(async (req: RequestParamsId, res: Response) => {
//            const book = await bookService.getBookById(req.validatedId!);
//
//            if (!book) {
//                return res.status(404).json({
//                    error: {
//                        message: 'Book not found'
//                    }
//                });
//            }
//
//            await bookService.deleteBook(book.id);
//            res.json({ message: 'Book deleted successfully' });
//        });
//
//    return router;
//};
