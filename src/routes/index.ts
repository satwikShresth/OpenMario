import { Router } from 'express';
//import bookRoutes from './books.route.js';
import authorRoutes from './author.routes.js';

export default () => {
    const router = Router();

    //router.use("/books", bookRoutes());
    router.use("/authors", authorRoutes());

    return router;
};
