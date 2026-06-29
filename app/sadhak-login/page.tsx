"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SadhakLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");

    if (!password.trim()) {
      setErrorMessage("Please enter password.");
      return;
    }

    setIsLoggingIn(true);

    const response = await fetch("/api/sadhak-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setErrorMessage(data.error || "Login failed.");
      setIsLoggingIn(false);
      return;
    }

    router.push("/sadhak-dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff8ed] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-stone-900">
            Sadhak Login
          </h1>
          <h2 className="mt-1 text-xl font-bold text-orange-800">
            साधक लॉगिन
          </h2>
          <p className="mt-3 text-sm text-stone-600">
            Please enter password to access Sadhak dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block font-bold text-stone-700">
              Password / पासवर्ड
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
              placeholder="Enter password"
            />
          </div>

          {errorMessage && (
            <div className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full rounded-2xl bg-orange-700 px-5 py-3 font-extrabold text-white disabled:opacity-60"
          >
            {isLoggingIn ? "Logging in..." : "Login"}
            <span className="block text-sm font-normal">
              लॉगिन करें
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}