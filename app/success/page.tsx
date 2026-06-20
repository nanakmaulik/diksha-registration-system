"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SuccessPage() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "DK-0001";
  const date = searchParams.get("date") || "2026-07-02";
  const time = searchParams.get("time") || "3:30 PM";

  return (
    <main className="min-h-screen bg-[#fff8ed] px-4 py-10 text-[#2d2418]">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto w-36">
          <Image
            src="/logo.png"
            alt="Diksha Logo"
            width={400}
            height={400}
            className="h-auto w-full"
            priority
          />
        </div>

        <h1 className="mt-6 text-3xl font-extrabold">
          Registration Successful
        </h1>

        <h2 className="mt-2 text-2xl font-bold text-green-700">
          पंजीकरण सफल हुआ
        </h2>

        <p className="mt-5 text-stone-700">
          Your slot has been allotted automatically.
        </p>

        <p className="mt-1 text-stone-700">
          आपका स्लॉट अपने आप निर्धारित कर दिया गया है।
        </p>

        <div className="mt-8 rounded-2xl bg-orange-50 p-5 text-left">
          <InfoRow label="Token / टोकन" value={token} />
          <InfoRow label="Date / दिनांक" value={formatDate(date)} />
          <InfoRow label="Time / समय" value={time} />
        </div>

        <div className="mt-8 rounded-2xl border border-orange-100 p-5 text-left text-sm leading-6 text-stone-700">
          <p className="font-bold text-stone-900">
            Please come with your guardian/family and original ID proof.
          </p>
          <p className="mt-1">
            कृपया अपने अभिभावक/परिवार और मूल पहचान प्रमाण के साथ आएं।
          </p>
        </div>

        <Link
          href="/"
          className="mt-8 inline-block rounded-2xl border border-orange-300 px-6 py-3 font-bold text-orange-800"
        >
          Back to Home
          <span className="block text-sm font-normal">मुख्य पृष्ठ पर जाएं</span>
        </Link>
      </div>
    </main>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-orange-100 py-3 last:border-b-0">
      <span className="font-bold text-stone-700">{label}</span>
      <span className="font-semibold text-stone-900">{value}</span>
    </div>
  );
}