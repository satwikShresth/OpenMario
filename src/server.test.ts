import axios from "axios";

const port = 3000;
const host = "localhost";
const protocol = "http";

const baseURL = `${protocol}://${host}:${port}`;

export const api = axios.create({ baseURL });


describe('Express Server Tests', () => {
    describe('404 Error Handler', () => {
        it('should return 404 with error message for non-existent routes', async () => {
            try {
                await api.get('/non-existent-route');
            } catch (error: any) {
                expect(error.response.status).toBe(404);
                expect(error.response.data).toHaveProperty('message');
                expect(error.response.data.message).toContain('Not Found: /non-existent-route');
            }
        });
    });
});
