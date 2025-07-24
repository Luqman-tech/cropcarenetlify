import deploymentConfig from "../../deploy.config.js";

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  role?: string;
}

const API_BASE = deploymentConfig.getApiUrl() + "/api/auth";

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  if (!validateEmail(email)) return { success: false, message: "Invalid email format" };
  if (!password) return { success: false, message: "Password is required" };
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      return { success: true, token: data.token, role: data.role };
    } else {
      return { success: false, message: data.message || "Login failed" };
    }
  } catch (e) {
    return { success: false, message: "Network error" };
  }
}

export async function signUp(name: string, email: string, password: string, confirmPassword: string): Promise<AuthResponse> {
  if (!name) return { success: false, message: "Name is required" };
  if (!validateEmail(email)) return { success: false, message: "Invalid email format" };
  if (!password) return { success: false, message: "Password is required" };
  if (password.length < 6) return { success: false, message: "Password must be at least 6 characters" };
  if (password !== confirmPassword) return { success: false, message: "Passwords do not match" };
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      return { success: true, token: data.token, role: data.role };
    } else {
      return { success: false, message: data.message || "Registration failed" };
    }
  } catch (e) {
    return { success: false, message: "Network error" };
  }
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Utility to decode JWT and get user role
export function getUserRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch {
    return null;
  }
} 