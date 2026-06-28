import { LOCATIONS } from '../lib/locations';
import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify(LOCATIONS), {
    headers: { 'Content-Type': 'application/json' },
  });
};
