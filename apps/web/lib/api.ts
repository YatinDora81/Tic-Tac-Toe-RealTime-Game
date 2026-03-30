"use client";

import { API_URL } from "./constants";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error ?? "Request failed");
  }

  return res.json();
}

export async function signup(name: string, email: string, password: string) {
  const data = await request<{ user: any; token: string }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  localStorage.setItem("token", data.token);
  return data;
}

export async function signin(email: string, password: string) {
  const data = await request<{ user: any; token: string }>("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("token", data.token);
  return data;
}

export async function playAnonymous(name: string) {
  const data = await request<{ user: any; token: string }>("/api/auth/anonymous", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  localStorage.setItem("token", data.token);
  return data;
}

export async function getMe() {
  return request<any>("/api/auth/me");
}

export async function signout() {
  localStorage.removeItem("token");
  return request<any>("/api/auth/signout", { method: "POST" });
}

export async function getLeaderboard(limit = 50, offset = 0) {
  return request<any[]>(`/api/leaderboard?limit=${limit}&offset=${offset}`);
}

export async function getGameHistory(limit = 20, offset = 0) {
  return request<any[]>(`/api/games/history?limit=${limit}&offset=${offset}`);
}

export async function getGameById(id: string) {
  return request<any>(`/api/games/${id}`);
}

export async function getActiveGame() {
  return request<{ id: string; roomCode: string; mode: string; status: string; createdAt: string } | null>("/api/games/active");
}

export async function createGameRoom(mode: "CLASSIC" | "TIMED") {
  return request<{ id: string; roomCode: string; mode: string; status: string }>("/api/games/create", {
    method: "POST",
    body: JSON.stringify({ mode }),
  });
}
