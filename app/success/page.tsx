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

  const mode = searchParams.get("mode") || "";
  const token = searchParams.get("token") || "-";
  const date = searchParams.get("date") || "-";
  const time = searchParams.get("time") || "-";

  const isRequestMode = mode === "request";

  return (
    <main className="min-h-screen bg-[#fff8ed] px-4 py-8 text-[#2d2418]">
      <div className="mx-auto max-w-2xl">
        <div className="success-print-card rounded-3xl bg-white p-6 text-center shadow-sm md:p-10">
          <div className="success-print-logo mx-auto w-32 md:w-40">
            <Image
              src="/logo.png"
              alt="Diksha Logo"
              width={400}
              height={400}
              className="h-auto w-full"
              priority
            />
          </div>

          <div className="success-print-check mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-green-700">
            {isRequestMode
              ? "Registration Request Received"
              : "Registration Successful"}
          </h1>

          <h2 className="mt-2 text-2xl font-bold text-orange-800">
            {isRequestMode
              ? "पंजीकरण अनुरोध प्राप्त हुआ"
              : "पंजीकरण सफल हुआ"}
          </h2>

          <p className="mt-4 text-stone-600">
            {isRequestMode
              ? "Your details have been submitted for verification."
              : "Please save your registration details."}
          </p>

          <p className="text-stone-600">
            {isRequestMode
              ? "आपकी जानकारी सत्यापन के लिए भेज दी गई है।"
              : "कृपया अपनी पंजीकरण जानकारी सुरक्षित रखें।"}
          </p>

          <div className="success-print-details mt-8 overflow-hidden rounded-2xl border border-orange-100 text-left">
            {!isRequestMode && <InfoRow label="Token / टोकन" value={token} />}

            {isRequestMode && (
              <InfoRow
                label="Token Status / टोकन स्थिति"
                value="Token will be allotted after Sadhak verification"
              />
            )}

            <InfoRow
              label="Meeting Date / मीटिंग तारीख"
              value={formatDate(date)}
            />

            <InfoRow label="Meeting Time / मीटिंग समय" value={time} />
          </div>

          <div className="success-print-instructions mt-8 rounded-2xl bg-orange-50 p-5 text-left text-sm text-stone-700">
            <p className="font-bold">Important Instructions:</p>

            {isRequestMode ? (
              <>
                <p className="mt-2">
                  Please visit the Token Confirmation Desk. Your token will be
                  allotted only after verification by a Sadhak.
                </p>
                <p className="mt-1">
                  कृपया टोकन कन्फर्मेशन डेस्क पर जाएं। Sadhak द्वारा सत्यापन के
                  बाद ही आपका टोकन दिया जाएगा।
                </p>
              </>
            ) : (
              <>
                <p className="mt-2">
                  Please come on your selected date and time with your original
                  ID proof.
                </p>
                <p className="mt-1">
                  कृपया चुनी हुई तारीख और समय पर अपना असली पहचान प्रमाण साथ लेकर
                  आएं।
                </p>
              </>
            )}
          </div>

          <div className="success-print-actions mt-8 flex flex-col gap-3 md:flex-row">
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