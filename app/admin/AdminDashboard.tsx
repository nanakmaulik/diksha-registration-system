"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Registration = {
  id: string;
  token: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  occupation: string | null;
  marital_status: string | null;
  mobile: string;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pin_code: string | null;
  guardian_relation: string | null;
  guardian_name: string | null;
  guardian_mobile: string | null;
  family_name: string | null;
  family_relation: string | null;
  family_mobile: string | null;
  id_type: string | null;
  id_number: string | null;
  remarks_by: string | null;
  status: string;
  created_at: string;
  aadhaar_file_url: string | null;
  aadhaar_file_name: string | null;
  slots: {
    slot_date: string;
    slot_time: string;
  } | null;
};

type Slot = {
  id: string;
  slot_date: string;
  slot_time: string;
  capacity: number;
  current_count: number;
  status: string;
};

export default function AdminDashboard({
  registrations,
  slots,
}: {
  registrations: Registration[];
  slots: Slot[];
}) {
  const [search, setSearch] = useState("");
  const [slotDate, setSlotDate] = useState("all");
  const [showFullMobile, setShowFullMobile] = useState(false);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [selectedAadhaar, setSelectedAadhaar] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((person) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        person.full_name.toLowerCase().includes(searchText) ||
        person.mobile.includes(searchText) ||
        person.token.toLowerCase().includes(searchText) ||
        (person.city || "").toLowerCase().includes(searchText);

      const matchesSlot =
        slotDate === "all" || person.slots?.slot_date === slotDate;

      return matchesSearch && matchesSlot;
    });
  }, [registrations, search, slotDate]);

  const totalRegistered = registrations.length;

  const slotsFull = slots.filter(
    (slot) => slot.current_count >= slot.capacity
  ).length;

  const nextAvailableSlot = slots.find(
    (slot) => slot.current_count < slot.capacity
  );

  const upcomingSlots = slots
    .filter((slot) => slot.status !== "full")
    .slice(0, showAllSlots ? slots.length : 6);

  const selectedDateLabel =
    slotDate === "all" ? "All Slots" : formatDate(slotDate);

  const selectedDateTime =
    filteredRegistrations[0]?.slots?.slot_time || "3:30 PM";

  function handlePrintSelectedDate() {
    if (slotDate === "all") {
      alert("Please select one date first.\nकृपया पहले एक तारीख चुनें।");
      return;
    }

    if (filteredRegistrations.length === 0) {
      alert(
        "No registrations found for this date.\nइस तारीख के लिए कोई पंजीकरण नहीं मिला।"
      );
      return;
    }

    window.print();
  }

  return (
    <main className="min-h-screen bg-[#fff8ed] px-4 py-6 text-[#2d2418] md:py-10">
      <div className="admin-screen mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 shrink-0">
              <Image
                src="/logo.png"
                alt="Diksha Logo"
                width={250}
                height={250}
                className="h-auto w-full"
                priority
              />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold md:text-3xl">
                Admin Dashboard
              </h1>
              <h2 className="mt-1 text-xl font-bold text-orange-800">
                प्रशासन डैशबोर्ड
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                View registrations and print date-wise registration list.
              </p>
              <p className="text-sm text-stone-600">
                पंजीकरण देखें और तारीख अनुसार सूची प्रिंट करें।
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <Link
              href="/register"
              className="rounded-2xl bg-orange-700 px-5 py-3 text-center font-bold text-white"
            >
              New Registration
              <span className="block text-sm font-normal">नया पंजीकरण</span>
            </Link>

            <Link
              href="/"
              className="rounded-2xl border border-orange-300 px-5 py-3 text-center font-bold text-orange-800"
            >
              Back to Home
              <span className="block text-sm font-normal">
                मुख्य पृष्ठ पर जाएं
              </span>
            </Link>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Total Registered"
            titleHi="कुल पंजीकरण"
            value={String(totalRegistered)}
          />

          <StatsCard
            title="Showing Now"
            titleHi="अभी दिख रहे हैं"
            value={String(filteredRegistrations.length)}
          />

          <StatsCard
            title="Slots Full"
            titleHi="भरे हुए स्लॉट"
            value={String(slotsFull)}
          />

          <StatsCard
            title="Next Available Slot"
            titleHi="अगला उपलब्ध स्लॉट"
            value={
              nextAvailableSlot
                ? formatDateShort(nextAvailableSlot.slot_date)
                : "None"
            }
          />
        </section>

        <section className="mb-8 rounded-3xl bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-extrabold">
                Upcoming Available Slots
              </h3>
              <h4 className="mt-1 text-xl font-bold text-orange-800">
                आने वाले उपलब्ध स्लॉट
              </h4>
              <p className="mt-2 text-sm text-stone-600">
                Showing only available upcoming slots to keep dashboard clean.
              </p>
              <p className="text-sm text-stone-600">
                डैशबोर्ड साफ रखने के लिए केवल आने वाले उपलब्ध स्लॉट दिखाए जा रहे हैं।
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAllSlots((prev) => !prev)}
              className="rounded-2xl border border-orange-300 px-5 py-3 font-bold text-orange-800"
            >
              {showAllSlots ? "Show Less" : "View All Slots"}
              <span className="block text-sm font-normal">
                {showAllSlots ? "कम दिखाएं" : "सभी स्लॉट देखें"}
              </span>
            </button>
          </div>

          {upcomingSlots.length === 0 ? (
            <div className="rounded-2xl bg-orange-50 p-5 text-center font-semibold text-stone-700">
              No available slots found.
              <span className="block text-sm font-normal">
                कोई उपलब्ध स्लॉट नहीं मिला।
              </span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {upcomingSlots.map((slot) => {
                const seatsLeft = slot.capacity - slot.current_count;
                const progress =
                  slot.capacity > 0
                    ? (slot.current_count / slot.capacity) * 100
                    : 0;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSlotDate(slot.slot_date)}
                    className={`rounded-2xl border p-5 text-left transition hover:border-orange-400 ${
                      slotDate === slot.slot_date
                        ? "border-orange-500 bg-orange-100"
                        : "border-orange-100 bg-orange-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-extrabold">
                          {formatDate(slot.slot_date)}
                        </p>
                        <p className="text-sm font-semibold text-stone-600">
                          {slot.slot_time}
                        </p>
                      </div>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        Open
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-sm font-bold">
                        <span>
                          {slot.current_count}/{slot.capacity}
                        </span>
                        <span>{seatsLeft} seats left</span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-orange-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <p className="mt-3 text-xs font-semibold text-orange-800">
                      Click to filter registrations / पंजीकरण देखने के लिए क्लिक करें
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-extrabold">Registrations</h3>
              <h4 className="mt-1 text-xl font-bold text-orange-800">
                पंजीकरण सूची
              </h4>

              {slotDate !== "all" && (
                <p className="mt-2 text-sm font-semibold text-stone-600">
                  Selected date: {selectedDateLabel}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handlePrintSelectedDate}
              className="rounded-2xl bg-orange-700 px-5 py-3 font-bold text-white"
            >
              Print Selected Date
              <span className="block text-sm font-normal">
                चुनी हुई तारीख प्रिंट करें
              </span>
            </button>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_240px_180px]">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, mobile, token, city"
              className="rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
            />

            <select
              value={slotDate}
              onChange={(event) => setSlotDate(event.target.value)}
              className="rounded-2xl border border-orange-200 bg-white px-4 py-3 outline-none focus:border-orange-600"
            >
              <option value="all">All Dates / सभी तारीखें</option>
              {slots.map((slot) => (
                <option key={slot.id} value={slot.slot_date}>
                  {formatDate(slot.slot_date)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowFullMobile((prev) => !prev)}
              className="rounded-2xl border border-orange-300 px-4 py-3 font-bold text-orange-800"
            >
              {showFullMobile ? "Hide Mobile" : "Show Mobile"}
              <span className="block text-xs font-normal">
                {showFullMobile ? "मोबाइल छुपाएं" : "मोबाइल दिखाएं"}
              </span>
            </button>
          </div>

          {(search || slotDate !== "all") && (
            <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-orange-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-bold">
                  Filtered results: {filteredRegistrations.length}
                </p>
                <p className="text-sm text-stone-600">
                  फ़िल्टर किए गए परिणाम: {filteredRegistrations.length}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSlotDate("all");
                }}
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-orange-800"
              >
                Clear Filters / फ़िल्टर हटाएं
              </button>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-orange-100">
            <table className="w-full min-w-[1050px] border-collapse text-left">
              <thead className="bg-orange-100">
                <tr>
                  <TableHead>Token</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Slot Date</TableHead>
                  <TableHead>Slot Time</TableHead>
                  <TableHead>Aadhaar</TableHead>
                  <TableHead>Status</TableHead>
                </tr>

                <tr className="text-sm text-stone-600">
                  <TableHead>टोकन</TableHead>
                  <TableHead>नाम</TableHead>
                  <TableHead>मोबाइल</TableHead>
                  <TableHead>शहर</TableHead>
                  <TableHead>स्लॉट दिनांक</TableHead>
                  <TableHead>स्लॉट समय</TableHead>
                  <TableHead>आधार</TableHead>
                  <TableHead>स्थिति</TableHead>
                </tr>
              </thead>

              <tbody>
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-10 text-center font-semibold text-stone-600"
                    >
                      No matching registrations / कोई मिलान पंजीकरण नहीं मिला
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((person, index) => (
                    <tr
                      key={person.id}
                      className={index % 2 === 0 ? "bg-white" : "bg-orange-50"}
                    >
                      <TableCell>{person.token}</TableCell>
                      <TableCell>{person.full_name}</TableCell>
                      <TableCell>
                        {showFullMobile
                          ? person.mobile
                          : maskMobile(person.mobile)}
                      </TableCell>
                      <TableCell>{person.city || "-"}</TableCell>
                      <TableCell>
                        {person.slots?.slot_date
                          ? formatDate(person.slots.slot_date)
                          : "-"}
                      </TableCell>
                      <TableCell>{person.slots?.slot_time || "-"}</TableCell>

                      <TableCell>
                        {person.aadhaar_file_url ? (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedAadhaar({
                                url: person.aadhaar_file_url || "",
                                name:
                                  person.aadhaar_file_name || person.full_name,
                              })
                            }
                            className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800"
                          >
                            View
                            <span className="block text-[10px] font-normal">
                              देखें
                            </span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-red-600">
                            Missing
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          {person.status}
                        </span>
                      </TableCell>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="print-area hidden">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Diksha Registration List</h1>
          <h2 className="text-xl font-bold">दीक्षा पंजीकरण सूची</h2>

          <p className="mt-3 text-sm">
            Date: <strong>{selectedDateLabel}</strong>
          </p>
          <p className="text-sm">
            Time: <strong>{selectedDateTime}</strong>
          </p>
          <p className="text-sm">
            Total Registrations:{" "}
            <strong>{filteredRegistrations.length}</strong>
          </p>
        </div>

        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <PrintHead>Sr.</PrintHead>
              <PrintHead>Token</PrintHead>
              <PrintHead>Name</PrintHead>
              <PrintHead>Age</PrintHead>
              <PrintHead>Gender</PrintHead>
              <PrintHead>Mobile</PrintHead>
              <PrintHead>WhatsApp</PrintHead>
              <PrintHead>City</PrintHead>
              <PrintHead>State</PrintHead>
              <PrintHead>Guardian</PrintHead>
              <PrintHead>Guardian Mobile</PrintHead>
              <PrintHead>Family Member</PrintHead>
              <PrintHead>ID Type</PrintHead>
              <PrintHead>ID Number</PrintHead>
              <PrintHead>Remarks</PrintHead>
            </tr>
          </thead>

          <tbody>
            {filteredRegistrations.map((person, index) => (
              <tr key={person.id}>
                <PrintCell>{index + 1}</PrintCell>
                <PrintCell>{person.token}</PrintCell>
                <PrintCell>{person.full_name}</PrintCell>
                <PrintCell>{person.age || "-"}</PrintCell>
                <PrintCell>{person.gender || "-"}</PrintCell>
                <PrintCell>{person.mobile || "-"}</PrintCell>
                <PrintCell>{person.whatsapp || "-"}</PrintCell>
                <PrintCell>{person.city || "-"}</PrintCell>
                <PrintCell>{person.state || "-"}</PrintCell>
                <PrintCell>
                  {person.guardian_name || "-"}
                  {person.guardian_relation
                    ? ` (${person.guardian_relation})`
                    : ""}
                </PrintCell>
                <PrintCell>{person.guardian_mobile || "-"}</PrintCell>
                <PrintCell>
                  {person.family_name || "-"}
                  {person.family_relation
                    ? ` (${person.family_relation})`
                    : ""}
                </PrintCell>
                <PrintCell>{person.id_type || "-"}</PrintCell>
                <PrintCell>{person.id_number || "-"}</PrintCell>
                <PrintCell>{person.remarks_by || "-"}</PrintCell>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-10 grid grid-cols-2 gap-10 text-sm">
          <div>
            <p className="border-t border-black pt-2">Sewadar Signature</p>
          </div>
          <div>
            <p className="border-t border-black pt-2">
              Verification Signature
            </p>
          </div>
        </div>
      </section>

      {selectedAadhaar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-orange-100 p-4">
              <div>
                <h3 className="text-lg font-extrabold">Aadhaar / ID Proof</h3>
                <p className="text-sm text-stone-600">आधार / पहचान प्रमाण</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAadhaar(null)}
                className="rounded-full bg-orange-100 px-4 py-2 font-bold text-orange-800"
              >
                Close
                <span className="block text-xs font-normal">बंद करें</span>
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto p-4">
              {selectedAadhaar.url.toLowerCase().includes(".pdf") ? (
                <iframe
                  src={selectedAadhaar.url}
                  className="h-[70vh] w-full rounded-2xl border border-orange-100"
                  title="Aadhaar PDF"
                />
              ) : (
                <img
                  src={selectedAadhaar.url}
                  alt={selectedAadhaar.name}
                  className="mx-auto max-h-[70vh] w-auto rounded-2xl border border-orange-100 object-contain"
                />
              )}

              <a
                href={selectedAadhaar.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block rounded-2xl bg-orange-700 px-5 py-3 font-bold text-white"
              >
                Open in New Tab
                <span className="block text-sm font-normal">
                  नई टैब में खोलें
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateString: string) {
  const date = parseLocalDate(dateString);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(dateString: string) {
  const date = parseLocalDate(dateString);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function maskMobile(mobile: string) {
  if (!mobile || mobile.length < 4) return mobile;
  return `${mobile.slice(0, 2)}xxxxxx${mobile.slice(-2)}`;
}

function StatsCard({
  title,
  titleHi,
  value,
}: {
  title: string;
  titleHi: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-stone-600">{title}</p>
      <p className="text-sm font-semibold text-stone-500">{titleHi}</p>
      <p className="mt-4 text-3xl font-extrabold text-orange-800">{value}</p>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="border-b border-orange-200 px-4 py-3 text-sm font-extrabold text-stone-800">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-b border-orange-100 px-4 py-4 text-sm font-semibold text-stone-800">
      {children}
    </td>
  );
}

function PrintHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="border border-black px-2 py-2 text-left font-bold">
      {children}
    </th>
  );
}

function PrintCell({ children }: { children: React.ReactNode }) {
  return <td className="border border-black px-2 py-2">{children}</td>;
}