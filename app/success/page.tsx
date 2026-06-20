"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "-";
  const date = searchParams.get("date") || "-";
  const time = searchParams.get("time") || "-";

  return (
    <main className="min-h-screen bg-[#fff8ed] px-4 py-8 text-[#2d2418]">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm md:p-10">
          <div className="mx-auto w-32 md:w-40">
            <Image
              src="/logo.png"
              alt="Diksha Logo"
              width={400}
              height={400}
              className="h-auto w-full"
              priority
            />
          </div>

          <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-green-700">
            Registration Successful
          </h1>

          <h2 className="mt-2 text-2xl font-bold text-orange-800">
            पंजीकरण सफल हुआ
          </h2>

          <p className="mt-4 text-stone-600">
            Please save your registration details.
          </p>

          <p className="text-stone-600">
            कृपया अपनी पंजीकरण जानकारी सुरक्षित रखें।
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-orange-100 text-left">
            <InfoRow label="Token / टोकन" value={token} />
            <InfoRow label="Appointment Date / अपॉइंटमेंट तारीख" value={formatDate(date)} />
            <InfoRow label="Appointment Time / अपॉइंटमेंट समय" value={time} />
          </div>

          <div className="mt-8 rounded-2xl bg-orange-50 p-5 text-left text-sm text-stone-700">
            <p className="font-bold">Important Instructions:</p>
            <p className="mt-2">
              Please come on your selected date and time with your original ID proof.
            </p>
            <p className="mt-1">
              कृपया चुनी हुई तारीख और समय पर अपना असली पहचान प्रमाण साथ लेकर आएं।
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full rounded-2xl bg-orange-700 px-5 py-4 font-bold text-white"
            >
              Print Confirmation
              <span className="block text-sm font-normal">
                पुष्टि प्रिंट करें
              </span>
            </button>

            <Link
              href="/"
              className="w-full rounded-2xl border border-orange-300 px-5 py-4 text-center font-bold text-orange-800"
            >
              Back to Home
              <span className="block text-sm font-normal">
                मुख्य पृष्ठ पर जाएं
              </span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function SuccessLoading() {
  return (
    <main className="min-h-screen bg-[#fff8ed] px-4 py-8 text-[#2d2418]">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="font-bold">Loading confirmation...</p>
        <p className="text-sm text-stone-600">पुष्टि लोड हो रही है...</p>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-2 border-b border-orange-100 p-4 last:border-b-0 md:grid-cols-2">
      <p className="font-bold">{label}</p>
      <p className="font-semibold text-orange-800">{value || "-"}</p>
    </div>
  );
}

function formatDate(dateString: string) {
  if (!dateString || dateString === "-") return "-";

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}