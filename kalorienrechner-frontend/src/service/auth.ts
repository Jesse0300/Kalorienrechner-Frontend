import { api } from "./api";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  login: string; // username ODER email
  password: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  token: string;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", data);
  saveToken(res.data.token);
  return res.data;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", data);
  saveToken(res.data.token);
  return res.data;
}

export function saveToken(token: string) {
  localStorage.setItem("jwt", token);
}

export function getToken(): string | null {
  return localStorage.getItem("jwt");
}

export function logout() {
  localStorage.removeItem("jwt");
}

/** JWT Payload lesen (ohne extra Library) */
function parseJwt(token: string): any | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/** Username/Email aus Token holen (nimmt was vorhanden ist) */
export function getCurrentUserLabel(): string | null {
  const token = getToken();
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;

  return payload.username ?? payload.email ?? payload.sub ?? null;
}
