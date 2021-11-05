/* eslint-disable no-restricted-globals */
import { handleRequest } from './handler.ts';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
