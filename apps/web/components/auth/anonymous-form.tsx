"use client";

import { useState } from "react";
import { useAuth } from "../../hooks/use-auth";

export function AnonymousForm() {
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
      <p className="text-sm text-gray-400">
        Jump right in! No account needed.
      </p>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Display Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={20}
          className="w-full rounded-lg bg-gray-800 px-4 py-2.5 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
          placeholder="Enter your name"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Starting..." : "Play Now"}
      </button>
    </form>
  );
}
