import axios from "axios";

export const api = axios.create({
  // Fallback ist wichtig, damit es auch ohne env funktioniert (z.B. Vite Proxy auf /api)
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});
