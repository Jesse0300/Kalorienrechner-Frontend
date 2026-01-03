import { api } from "./api";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  login: string;   // username ODER email
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
