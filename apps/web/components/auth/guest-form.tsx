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
        <label className="block text-sm font-medium text-white/40 mb-1.5">Display Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={20}
          className="w-full rounded-xl glass-input px-4 py-3 text-white focus:outline-none placeholder:text-white/20"
          placeholder="Pick a name"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl btn-glow-emerald py-3 font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Joining..." : "Join as Guest"}
      </button>
    </form>
  );
}
