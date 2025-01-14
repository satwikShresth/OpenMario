import axios from 'axios';

const port = 3000;
const host = 'localhost';
const protocol = 'http';

const baseURL = `${protocol}://${host}:${port}`;

export const api = axios.create({ baseURL });
