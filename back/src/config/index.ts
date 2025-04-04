export const JWT_MAGIC_ALGO = 'ES256';
export const JWT_MAGIC_SECRET = Deno.env.get('JWT_SECRET_MAGIC_LINK')!;
export const JWT_MAGIC_EXPIRE = Deno.env.get('JWT_EXPIRATION_MAGIC_LINK')!;
export const JWT_CLIENT_SECRET = Deno.env.get('JWT_SECRET_CLIENT')!;
export const JWT_CLIENT_EXPIRE = Deno.env.get('JWT_EXPIRATION_CLIENT')!;
export const APP_URL = Deno.env.get('APP_URL')!;
