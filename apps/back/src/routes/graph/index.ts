import { Hono } from 'hono';
import getCourseAvailRoutes from './get.courses.availability.routes.ts';
import getReqRoutes from './get.req.routes.ts';
import getCoursesRoutes from './get.courses.routes.ts';

export default () =>
   new Hono()
      .basePath('/graph')
      .get('/req/:course_id', ...getReqRoutes)
      .get('/courses/:course_id', ...getCoursesRoutes)
      .get('/courses/availabilities/:course_id', ...getCourseAvailRoutes);
