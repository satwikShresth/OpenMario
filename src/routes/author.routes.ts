//TODO: adding query for selection for GET
import { NextFunction, Request, Response, Router } from 'express';
import { db } from '#db';
import { authors } from '#db/schema.js';
import { z } from 'zod';
import { AuthorCreate, AuthorCreateSchema, AuthorUpdateSchema } from '#db/types.js';
import { formatZodError } from '#utils/formatter.js';
import { eq } from 'drizzle-orm';

interface RequestParamsId extends Request {
    params: {
        id: string;
    };
    validatedId?: number;
}

const paramsIdSchema = z.object({
    id: z.preprocess(
        (val) => Number(val),
        z.number().positive()
    ),
});

const validateId = async (req: RequestParamsId, res: Response, next: NextFunction) => {
    const result = await paramsIdSchema.safeParseAsync({ id: req.params.id });
    if (!result.success) {
        res.status(400).send({ type: 'Params', errors: formatZodError(result.error).error });
    }
    req.validatedId = result?.data?.id;
    next();
};

export default () => {
    const router = Router();

    router.route('/')
        .get(async (_req: Request, res: Response) => {

            const result = await db
                .select()
                .from(authors)
                .all()

            res.json(result);
        })
        .post(async (req: Request, res: Response) => {
            const result = await AuthorCreateSchema.safeParseAsync(req.body);

            if (!result.success) {
                console.log(formatZodError(result.error).error)
                return res.status(400).send({ type: 'Body', errors: formatZodError(result.error).error });
            }

            const newAuthor = await db
                .insert(authors)
                .values(result.data as AuthorCreate)
                .returning();

            res.status(201).json(newAuthor);
        });

    router.route('/:id')
        .all(validateId)
        .get(async (req: RequestParamsId, res: Response) => {
            const result = await db
                .select()
                .from(authors)
                .where(eq(authors.id, req.validatedId!))


            if (!result) {
                return res.status(404).json({ detail: 'Author not found' });
            }

            res.json(result);
        })
        .put(async (req: RequestParamsId, res: Response) => {
            const result = await AuthorUpdateSchema.safeParseAsync(req.body);

            if (!result.success) {
                console.log(formatZodError(result.error).error)
                return res.status(400).send({ type: 'Body', errors: formatZodError(result.error).error });
            }

            const updatedAuthor = await db
                .update(authors)
                .set(result.data)
                .where(eq(authors.id, req.validatedId!))
                .returning();


            res.json(updatedAuthor);
        })
        .delete(async (req: RequestParamsId, res: Response) => {
            const result = await db
                .delete(authors)
                .where(eq(authors.id, req.validatedId!))
                .returning({ deleted_id: authors.id });

            res.json(result);
        });

    return router;
};
