import { expect } from 'jsr:@std/expect';
import { describe, it } from 'jsr:@std/testing/bdd';
import { api } from './index.ts';
import { AxiosError } from 'axios';

describe('POST /submissions', () => {
   const validSubmissionData = {
      company: 'Rising Sun Presents',
      position: 'Audio Engineer',
      location: 'Philadelphia, PA',
      work_hours: 40,
      compensation: 35,
      other_compensation: 'Health insurance, 401k',
      details: 'Audio engineering role',
      year: 2024,
      coop_cycle: 'Fall/Winter',
      coop_year: '2nd',
      program_level: 'Undergraduate',
      majors: ['Computer Science (BSCS)'],
      minors: ['Software Engineering'],
   };

   it('should successfully create a submission with valid data', async () => {
      try {
         const response = await api.post('/submissions', validSubmissionData);
         expect(response.status).toBe(201);
         expect(response.data).toEqual({
            message: 'Added positions successfully',
         });
      } catch (error) {
         if (error instanceof AxiosError) {
            console.log('Error response:', error.response?.data);
         }
         throw error;
      }
   });

   it('should fail with nonexistent company', async () => {
      const invalidData = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            company: 'Nonexistent Company Name LLC',
         }],
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(409);
            expect(error.response?.data).toEqual({
               message: 'Comapny or Position does not exist',
            });
            return;
         }
         throw error;
      }
   });

   it('should handle multiple valid positions in a single submission', async () => {
      const multiPositionData = {
         ...validSubmissionData,
         positions: [
            validSubmissionData.positions[0],
            {
               company: 'Rising Sun Presents',
               position: 'Booking Team',
               location: 'Philadelphia, PA',
               work_hours: 40,
               compensation: 40,
               other_compensation: 'Health insurance',
               details: 'Booking team role',
            },
         ],
      };

      const response = await api.post('/submissions', multiPositionData);
      expect(response.status).toBe(201);
      expect(response.data).toEqual({
         message: 'Added positions successfully',
      });
   });

   // Validation Tests
   it('should fail with invalid work hours', async () => {
      const invalidData = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            work_hours: 70,
         }],
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   it('should fail with invalid program level', async () => {
      const invalidData = {
         ...validSubmissionData,
         program_level: 'Super Senior Level',
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   it('should fail with empty positions array', async () => {
      const invalidData = {
         ...validSubmissionData,
         positions: [],
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   it('should fail with invalid major', async () => {
      const invalidData = {
         ...validSubmissionData,
         majors: ['Underwater Basket Weaving'],
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   it('should fail with position name < 3 characters', async () => {
      const invalidData = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            position: 'IT',
         }],
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   it('should fail with position name > 100 characters', async () => {
      const invalidData = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            position: 'A'.repeat(101),
         }],
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   // Work hours boundary tests
   it('should accept minimum work hours (5)', async () => {
      const data = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            work_hours: 5,
         }],
      };

      const response = await api.post('/submissions', data);
      expect(response.status).toBe(201);
   });

   it('should accept maximum work hours (60)', async () => {
      const data = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            work_hours: 60,
         }],
      };

      const response = await api.post('/submissions', data);
      expect(response.status).toBe(201);
   });

   it('should fail with work hours below minimum', async () => {
      const invalidData = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            work_hours: 4,
         }],
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   // Year validation tests
   it('should fail with year before 2005', async () => {
      const invalidData = {
         ...validSubmissionData,
         year: 2004,
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   it('should fail with year too far in future', async () => {
      const invalidData = {
         ...validSubmissionData,
         year: new Date().getFullYear() + 3,
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   // Compensation validation
   it('should handle zero compensation', async () => {
      const data = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            compensation: 0,
         }],
      };

      const response = await api.post('/submissions', data);
      expect(response.status).toBe(201);
   });

   it('should fail with non-integer compensation', async () => {
      const invalidData = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            compensation: 35.5,
         }],
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   // Location validation
   it('should fail with invalid state code format', async () => {
      const invalidData = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            location: 'Philadelphia, Penn',
         }],
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   it('should fail with missing comma in location', async () => {
      const invalidData = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            location: 'Philadelphia PA',
         }],
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   // Other validation tests
   it('should fail with empty majors array', async () => {
      const invalidData = {
         ...validSubmissionData,
         majors: [],
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   it('should accept submission without minors', async () => {
      const data = {
         ...validSubmissionData,
         minors: [],
      };

      const response = await api.post('/submissions', data);
      expect(response.status).toBe(201);
   });

   it('should handle maximum length other_compensation', async () => {
      const data = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            other_compensation: 'A'.repeat(255),
         }],
      };

      const response = await api.post('/submissions', data);
      expect(response.status).toBe(201);
   });

   it('should fail with too long other_compensation', async () => {
      const invalidData = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            other_compensation: 'A'.repeat(256),
         }],
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   it('should handle maximum length details', async () => {
      const data = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            details: 'A'.repeat(255),
         }],
      };

      const response = await api.post('/submissions', data);
      expect(response.status).toBe(201);
   });

   it('should fail with too long details', async () => {
      const invalidData = {
         ...validSubmissionData,
         positions: [{
            ...validSubmissionData.positions[0],
            details: 'A'.repeat(256),
         }],
      };

      try {
         await api.post('/submissions', invalidData);
      } catch (error) {
         if (error instanceof AxiosError) {
            expect(error.response?.status).toBe(400);
            expect(error.response?.data).toBeDefined();
            return;
         }
         throw error;
      }
   });

   it('should handle valid Graduate program level with graduate major', async () => {
      const data = {
         ...validSubmissionData,
         program_level: 'Graduate',
         majors: ['Computer Science (MSCS)'],
      };

      const response = await api.post('/submissions', data);
      expect(response.status).toBe(201);
   });
});
