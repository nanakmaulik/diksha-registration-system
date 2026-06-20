import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fff8ed] px-4 py-10 text-[#2d2418]">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto w-44 md:w-56">
          <Image
            src="/logo.png"
            alt="Diksha Registration Logo"
            width={500}
            height={500}
            priority
            className="h-auto w-full"
          />
        </div>

        <h1 className="mt-6 text-4xl font-extrabold">
          Diksha Registration
        </h1>

        <h2 className="mt-2 text-3xl font-bold text-orange-800">
          दीक्षा पंजीकरण
        </h2>

        <p className="mt-6 text-lg">
          Please fill your details carefully.
        </p>

        <p className="mt-2 text-lg">
          कृपया अपनी जानकारी ध्यानपूर्वक भरें।
        </p>

        <Link
          href="/register"
          className="mt-8 inline-block rounded-2xl bg-orange-700 px-8 py-4 font-bold text-white"
        >
          Start Registration
          <span className="block text-sm font-normal">पंजीकरण शुरू करें</span>
        </Link>
        <Link
  href="/admin"
  className="mt-4 inline-block text-sm font-bold text-orange-800 underline"
>
  Admin Dashboard
  <span className="block text-xs font-normal">प्रशासन डैशबोर्ड</span>
</Link>
      </div>
    </main>
  );
}