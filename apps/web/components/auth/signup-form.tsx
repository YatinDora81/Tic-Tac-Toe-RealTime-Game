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
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={20}
          className="w-full rounded-xl bg-gray-800/80 px-4 py-3 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-gray-600"
          placeholder="Your name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl bg-gray-800/80 px-4 py-3 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-gray-600"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-xl bg-gray-800/80 px-4 py-3 text-white border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-gray-600"
          placeholder="Min 6 characters"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
