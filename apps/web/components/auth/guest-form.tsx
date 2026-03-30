"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/use-auth";

export function GuestForm() {
  const { playAnonymous } = useAuth();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await playAnonymous(name);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Display Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={20}
          className="w-full rounded-xl bg-gray-800/80 px-4 py-3 text-white border border-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 focus:outline-none transition-all placeholder:text-gray-600"
          placeholder="Pick a name"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-500 transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20"
      >
        {loading ? "Joining..." : "Join as Guest"}
      </button>
    </form>
  );
}
