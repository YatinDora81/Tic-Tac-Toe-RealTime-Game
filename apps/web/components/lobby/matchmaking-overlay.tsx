"use client";

export function MatchmakingOverlay({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="mb-8 h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-emerald-500" />
      <p className="text-lg font-medium text-white mb-2">Finding opponent...</p>
      <p className="text-sm text-gray-400 mb-6">Waiting for a match</p>
      <button
        onClick={onCancel}
        className="rounded-lg bg-gray-800 px-6 py-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
