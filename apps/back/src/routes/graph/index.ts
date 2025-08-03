import { Hono } from 'hono';
import getCourseAvailRoutes from './get.courses.availability.routes.ts';
import getPrereqRoutes from './get.prereq.routes.ts';
import getCoursesRoutes from './get.courses.routes.ts';

export default () =>
   new Hono()
      .basePath('/graph')
      .get('/prereq/:course_id', ...getPrereqRoutes)
      .get('/courses/:course_id', ...getCoursesRoutes)
      .get('/courses/availabilities/:course_id', ...getCourseAvailRoutes);
