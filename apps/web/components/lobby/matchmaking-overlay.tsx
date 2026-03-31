"use client";

export function MatchmakingOverlay({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-lg">
      <div className="glass-strong rounded-2xl p-10 flex flex-col items-center">
        <div className="mb-6 h-14 w-14 animate-spin rounded-full border-4 border-white/10 border-t-emerald-400" />
        <p className="text-lg font-medium text-white mb-1">Finding opponent...</p>
        <p className="text-sm text-white/30 mb-6">Waiting for a match</p>
        <button
          onClick={onCancel}
          className="rounded-xl glass glass-hover px-8 py-2.5 text-sm text-white/40 hover:text-white transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
