"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/use-auth";

export function SignupForm() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/40 mb-1.5">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={20}
          className="w-full rounded-xl glass-input px-4 py-3 text-white focus:outline-none placeholder:text-white/20"
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/40 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl glass-input px-4 py-3 text-white focus:outline-none placeholder:text-white/20"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/40 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-xl glass-input px-4 py-3 text-white focus:outline-none placeholder:text-white/20"
          placeholder="Min 6 characters"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl btn-glow-blue py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
