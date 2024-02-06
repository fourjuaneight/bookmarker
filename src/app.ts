import { Hono } from 'hono';

import { handleGet, handlePost } from './handler';

const app = new Hono();

app.get('/', async ctx => handleGet(ctx));

app.post('/', async ctx => handlePost(ctx));

export default app;
