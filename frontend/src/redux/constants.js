/** Backend origin for API calls; must match Vite proxy target or production API. */
export const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";
export const USER_URL = "/api/users";
export const ARTWORK_URL = "/api/artworks";
export const UPLOAD_URL = "/api/upload";
export const CART_URL = "/api/cart";
export const ORDER_URL = "/api/orders";
export const FAVORITE_URL = "/api/favorites";
