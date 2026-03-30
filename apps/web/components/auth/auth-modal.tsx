"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";
import { AnonymousForm } from "./anonymous-form";

type Tab = "login" | "signup" | "quick";

export function AuthModal({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>("quick");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-6 shadow-2xl border border-gray-800">
        <div className="mb-6 flex gap-1 rounded-lg bg-gray-800 p-1">
          {(["quick", "login", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                tab === t ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {t === "quick" ? "Quick Play" : t === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        {tab === "quick" && <AnonymousForm />}
        {tab === "login" && <LoginForm />}
        {tab === "signup" && <SignupForm />}
      </div>
    </div>
  );
}
