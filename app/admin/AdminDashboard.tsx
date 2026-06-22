"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

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
  spouse_name: string | null;
  father_name: string | null;
  mother_name: string | null;
  family_name: string | null;
  family_relation: string | null;
  family_mobile: string | null;
  id_type: string | null;
  id_number: string | null;
  remarks_by: string | null;
  status: string;
  candidate_status: string | null;
  final_meeting_attendance: string | null;
  diksha_attendance: string | null;
  final_meeting_date: string | null;
  final_meeting_time: string | null;
  diksha_date: string | null;
  diksha_time: string | null;
  evaluator_name: string | null;
  evaluator_notes: string | null;
  admin_remarks: string | null;
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

type ActivityLog = {
  id: string;
  registration_id: string;
  old_status: string | null;
  new_status: string | null;
  action_type: string | null;
  attendance_type: string | null;
  attendance_value: string | null;
  notes: string | null;
  updated_by: string | null;
  created_at: string;
};

export default function AdminDashboard({
  registrations,
  slots,
  activityLogs,
}: {
  registrations: Registration[];
  slots: Slot[];
  activityLogs: ActivityLog[];
}) {
  const [search, setSearch] = useState("");
  const [slotDate, setSlotDate] = useState("all");
  const [showFullMobile, setShowFullMobile] = useState(false);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [reportFilter, setReportFilter] = useState("all");
  const [dikshaDate, setDikshaDate] = useState("");
  const [dikshaTime, setDikshaTime] = useState("3:30 PM");

  const [selectedAadhaar, setSelectedAadhaar] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const [selectedHistory, setSelectedHistory] = useState<Registration | null>(
    null
  );

  const [selectedAction, setSelectedAction] = useState<{
    registrationId: string;
    candidateName: string;
    actionType: "status" | "attendance";
    title: string;
    newStatus?: string;
    attendanceType?: string;
    attendanceValue?: string;
  } | null>(null);

  const [actionNotes, setActionNotes] = useState("");
  const [updatedBy, setUpdatedBy] = useState("Sewadar");
  const [isUpdatingAction, setIsUpdatingAction] = useState(false);

  const todayDate = getTodayDateString();

  async function handleSubmitAction(actionOverride?: {
    actionType: "status" | "attendance";
    title: string;
    newStatus?: string;
    attendanceType?: string;
    attendanceValue?: string;
  }) {
    if (!selectedAction) return;

    if (!updatedBy.trim()) {
      alert("Please enter updated by name.\nकृपया अपडेट करने वाले का नाम भरें।");
      return;
    }

    const actionToSave = actionOverride
      ? { ...selectedAction, ...actionOverride }
      : selectedAction;

    setIsUpdatingAction(true);

    if (actionToSave.actionType === "status") {
      const { error } = await supabase.rpc("update_candidate_status", {
        p_registration_id: selectedAction.registrationId,
        p_new_status: actionToSave.newStatus,
        p_action_type: actionToSave.title,
        p_notes: actionNotes.trim(),
        p_updated_by: updatedBy.trim(),
      });

      if (error) {
        alert("Status update error: " + error.message);
        setIsUpdatingAction(false);
        return;
      }
    }

    if (actionToSave.actionType === "attendance") {
      const { error } = await supabase.rpc("update_candidate_attendance", {
        p_registration_id: selectedAction.registrationId,
        p_attendance_type: actionToSave.attendanceType,
        p_attendance_value: actionToSave.attendanceValue,
        p_notes: actionNotes.trim(),
        p_updated_by: updatedBy.trim(),
      });

      if (error) {
        alert("Attendance update error: " + error.message);
        setIsUpdatingAction(false);
        return;
      }
    }

    setIsUpdatingAction(false);
    setSelectedAction(null);
    setActionNotes("");

    window.location.reload();
  }

  async function handleScheduleDiksha() {
    if (!selectedAction) return;

    if (!updatedBy.trim()) {
      alert("Please enter updated by name.\nकृपया अपडेट करने वाले का नाम भरें।");
      return;
    }

    if (!dikshaDate) {
      alert("Please select Diksha date.\nकृपया दीक्षा तारीख चुनें।");
      return;
    }

    if (!dikshaTime.trim()) {
      alert("Please enter Diksha time.\nकृपया दीक्षा समय भरें।");
      return;
    }

    setIsUpdatingAction(true);

    const { error } = await supabase.rpc("schedule_candidate_diksha", {
      p_registration_id: selectedAction.registrationId,
      p_diksha_date: dikshaDate,
      p_diksha_time: dikshaTime.trim(),
      p_notes: actionNotes.trim(),
      p_updated_by: updatedBy.trim(),
    });

    if (error) {
      alert("Diksha schedule error: " + error.message);
      setIsUpdatingAction(false);
      return;
    }

    setIsUpdatingAction(false);
    setSelectedAction(null);
    setActionNotes("");
    setDikshaDate("");
    setDikshaTime("3:30 PM");

    window.location.reload();
  }

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((person) => {
      const searchText = search.toLowerCase().trim();

      const statusValue = person.candidate_status || person.status || "";
      const finalMeetingAttendance =
        person.final_meeting_attendance || "Not Marked";
      const dikshaAttendance = person.diksha_attendance || "Not Marked";

      const matchesSearch =
        !searchText ||
        (person.full_name || "").toLowerCase().includes(searchText) ||
        (person.mobile || "").includes(searchText) ||
        (person.token || "").toLowerCase().includes(searchText) ||
        (person.city || "").toLowerCase().includes(searchText) ||
        statusValue.toLowerCase().includes(searchText);

      const matchesSlot =
        slotDate === "all" || person.slots?.slot_date === slotDate;

      let matchesReport = true;

      if (reportFilter === "scheduled_final_meetings") {
        matchesReport = statusValue === "Scheduled for Final Meeting";
      }

      if (reportFilter === "pending") {
        matchesReport = statusValue === "Pending";
      }

      if (reportFilter === "approved") {
        matchesReport = statusValue === "Approved";
      }

      if (reportFilter === "rejected") {
        matchesReport = statusValue === "Rejected";
      }

      if (reportFilter === "scheduled_diksha") {
        matchesReport = statusValue === "Scheduled for Diksha";
      }

      if (reportFilter === "diksha_completed") {
        matchesReport = statusValue === "Diksha Completed";
      }

      if (reportFilter === "no_show") {
        matchesReport =
          finalMeetingAttendance === "Absent" || dikshaAttendance === "Absent";
      }

      if (reportFilter === "today_final_meetings") {
        matchesReport = person.slots?.slot_date === todayDate;
      }

      if (reportFilter === "today_diksha") {
        matchesReport = person.diksha_date === todayDate;
      }

      return matchesSearch && matchesSlot && matchesReport;
    });
  }, [registrations, search, slotDate, reportFilter, todayDate]);

  const reportCounts = useMemo(() => {
    const scheduledFinalMeetings = registrations.filter(
      (person) =>
        (person.candidate_status || person.status) ===
        "Scheduled for Final Meeting"
    ).length;

    const pending = registrations.filter(
      (person) => (person.candidate_status || person.status) === "Pending"
    ).length;

    const approved = registrations.filter(
      (person) => (person.candidate_status || person.status) === "Approved"
    ).length;

    const rejected = registrations.filter(
      (person) => (person.candidate_status || person.status) === "Rejected"
    ).length;

    const scheduledDiksha = registrations.filter(
      (person) =>
        (person.candidate_status || person.status) === "Scheduled for Diksha"
    ).length;

    const dikshaCompleted = registrations.filter(
      (person) =>
        (person.candidate_status || person.status) === "Diksha Completed"
    ).length;

    const noShow = registrations.filter(
      (person) =>
        person.final_meeting_attendance === "Absent" ||
        person.diksha_attendance === "Absent"
    ).length;

    const todayFinalMeetings = registrations.filter(
      (person) => person.slots?.slot_date === todayDate
    ).length;

    const todayDiksha = registrations.filter(
      (person) => person.diksha_date === todayDate
    ).length;

    return {
      scheduledFinalMeetings,
      pending,
      approved,
      rejected,
      scheduledDiksha,
      dikshaCompleted,
      noShow,
      todayFinalMeetings,
      todayDiksha,
    };
  }, [registrations, todayDate]);

  const totalRegistered = registrations.length;

  const slotsFull = slots.filter(
    (slot) => slot.current_count >= slot.capacity
  ).length;

  const nextAvailableSlot = slots.find(
    (slot) => slot.current_count < slot.capacity
  );

  const tomorrowDate = getTomorrowDateString();

  const upcomingSlots = slots
    .filter((slot) => slot.status !== "full" && slot.slot_date >= tomorrowDate)
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

  function handleExportCsv() {
    if (filteredRegistrations.length === 0) {
      alert("No records to export.\nExport करने के लिए कोई रिकॉर्ड नहीं है।");
      return;
    }

    const headers = [
      "Token",
      "Name",
      "Age",
      "Gender",
      "Mobile",
      "WhatsApp",
      "City",
      "State",
      "Slot Date",
      "Slot Time",
      "Candidate Status",
      "Final Meeting Attendance",
      "Diksha Attendance",
      "Diksha Date",
      "Diksha Time",
      "Family Approval",
      "Updated By",
      "Remarks",
    ];

    const rows = filteredRegistrations.map((person) => {
      const familyApproval =
        person.marital_status === "Married"
          ? `Husband / Wife: ${person.spouse_name || "-"}`
          : `Father: ${person.father_name || "-"} | Mother: ${
              person.mother_name || "-"
            }`;

      return [
        person.token || "-",
        person.full_name || "-",
        person.age || "-",
        person.gender || "-",
        person.mobile || "-",
        person.whatsapp || "-",
        person.city || "-",
        person.state || "-",
        person.slots?.slot_date ? formatDate(person.slots.slot_date) : "-",
        person.slots?.slot_time || "-",
        person.candidate_status || person.status || "-",
        person.final_meeting_attendance || "Not Marked",
        person.diksha_attendance || "Not Marked",
        person.diksha_date ? formatDate(person.diksha_date) : "-",
        person.diksha_time || "-",
        familyApproval,
        person.evaluator_name || "-",
        person.evaluator_notes ||
          person.admin_remarks ||
          person.remarks_by ||
          "-",
      ];
    });

    const csvContent = [
      headers.map(csvEscape).join(","),
      ...rows.map((row) =>
        row.map((value) => csvEscape(String(value))).join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const fileNameParts = [
      "diksha-registrations",
      reportFilter !== "all" ? reportFilter : null,
      slotDate !== "all" ? slotDate : null,
      getTodayDateString(),
    ].filter(Boolean);

    link.href = url;
    link.download = `${fileNameParts.join("-")}.csv`;
    link.click();

    URL.revokeObjectURL(url);
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
                Manage registrations, final meetings, Diksha status, history and
                reports.
              </p>
              <p className="text-sm text-stone-600">
                पंजीकरण, फाइनल मीटिंग, दीक्षा स्थिति, इतिहास और रिपोर्ट देखें।
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

        <section className="mb-8 space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
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
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5">
              <h3 className="text-2xl font-extrabold">Reports Summary</h3>
              <h4 className="mt-1 text-xl font-bold text-orange-800">
                रिपोर्ट सारांश
              </h4>
              <p className="mt-2 text-sm text-stone-600">
                Click any report card to filter registrations.
              </p>
              <p className="text-sm text-stone-600">
                पंजीकरण फ़िल्टर करने के लिए किसी भी रिपोर्ट कार्ड पर क्लिक करें।
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
              <ReportCountCard
                title="Scheduled Final Meetings"
                titleHi="फाइनल मीटिंग शेड्यूल"
                value={reportCounts.scheduledFinalMeetings}
                active={reportFilter === "scheduled_final_meetings"}
                onClick={() => setReportFilter("scheduled_final_meetings")}
              />

              <ReportCountCard
                title="Pending"
                titleHi="लंबित"
                value={reportCounts.pending}
                active={reportFilter === "pending"}
                onClick={() => setReportFilter("pending")}
              />

              <ReportCountCard
                title="Approved"
                titleHi="स्वीकृत"
                value={reportCounts.approved}
                active={reportFilter === "approved"}
                onClick={() => setReportFilter("approved")}
              />

              <ReportCountCard
                title="Rejected"
                titleHi="अस्वीकृत"
                value={reportCounts.rejected}
                active={reportFilter === "rejected"}
                onClick={() => setReportFilter("rejected")}
              />

              <ReportCountCard
                title="Scheduled Diksha"
                titleHi="दीक्षा शेड्यूल"
                value={reportCounts.scheduledDiksha}
                active={reportFilter === "scheduled_diksha"}
                onClick={() => setReportFilter("scheduled_diksha")}
              />

              <ReportCountCard
                title="Diksha Completed"
                titleHi="दीक्षा पूर्ण"
                value={reportCounts.dikshaCompleted}
                active={reportFilter === "diksha_completed"}
                onClick={() => setReportFilter("diksha_completed")}
              />

              <ReportCountCard
                title="No Show"
                titleHi="अनुपस्थित"
                value={reportCounts.noShow}
                active={reportFilter === "no_show"}
                onClick={() => setReportFilter("no_show")}
              />

              <ReportCountCard
                title="Today Final Meetings"
                titleHi="आज फाइनल मीटिंग"
                value={reportCounts.todayFinalMeetings}
                active={reportFilter === "today_final_meetings"}
                onClick={() => setReportFilter("today_final_meetings")}
              />

              <ReportCountCard
                title="Today Diksha"
                titleHi="आज दीक्षा"
                value={reportCounts.todayDiksha}
                active={reportFilter === "today_diksha"}
                onClick={() => setReportFilter("today_diksha")}
              />

              <ReportCountCard
                title="All"
                titleHi="सभी"
                value={registrations.length}
                active={reportFilter === "all"}
                onClick={() => setReportFilter("all")}
              />
            </div>
          </div>
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
                Showing only available upcoming slots.
              </p>
              <p className="text-sm text-stone-600">
                केवल आने वाले उपलब्ध स्लॉट दिखाए जा रहे हैं।
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

            <div className="flex flex-col gap-3 md:flex-row">
              <button
                type="button"
                onClick={handleExportCsv}
                className="rounded-2xl bg-green-700 px-5 py-3 font-bold text-white"
              >
                Export Current List
                <span className="block text-sm font-normal">
                  वर्तमान सूची डाउनलोड करें
                </span>
              </button>

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
          </div>

          <div className="mb-5 rounded-2xl bg-orange-50 p-4">
            <p className="mb-3 font-extrabold">Reports / रिपोर्ट</p>

            <div className="flex flex-wrap gap-2">
              <ReportButton
                active={reportFilter === "all"}
                label="All"
                onClick={() => setReportFilter("all")}
              />

              <ReportButton
                active={reportFilter === "scheduled_final_meetings"}
                label="Scheduled Final Meetings"
                onClick={() => setReportFilter("scheduled_final_meetings")}
              />

              <ReportButton
                active={reportFilter === "pending"}
                label="Pending"
                onClick={() => setReportFilter("pending")}
              />

              <ReportButton
                active={reportFilter === "approved"}
                label="Approved"
                onClick={() => setReportFilter("approved")}
              />

              <ReportButton
                active={reportFilter === "rejected"}
                label="Rejected"
                onClick={() => setReportFilter("rejected")}
              />

              <ReportButton
                active={reportFilter === "scheduled_diksha"}
                label="Scheduled Diksha"
                onClick={() => setReportFilter("scheduled_diksha")}
              />

              <ReportButton
                active={reportFilter === "diksha_completed"}
                label="Diksha Completed"
                onClick={() => setReportFilter("diksha_completed")}
              />

              <ReportButton
                active={reportFilter === "no_show"}
                label="No Show"
                onClick={() => setReportFilter("no_show")}
              />

              <ReportButton
                active={reportFilter === "today_final_meetings"}
                label="Today Final Meetings"
                onClick={() => setReportFilter("today_final_meetings")}
              />

              <ReportButton
                active={reportFilter === "today_diksha"}
                label="Today Diksha"
                onClick={() => setReportFilter("today_diksha")}
              />
            </div>
          </div>

          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_240px_180px]">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, mobile, token, city, status"
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

          {(search || slotDate !== "all" || reportFilter !== "all") && (
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
                  setReportFilter("all");
                }}
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-orange-800"
              >
                Clear Filters / फ़िल्टर हटाएं
              </button>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-orange-100">
            <table className="w-full min-w-[1450px] border-collapse text-left">
              <thead className="bg-orange-100">
                <tr>
                  <TableHead>Token</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Slot Date</TableHead>
                  <TableHead>Slot Time</TableHead>
                  <TableHead>Actions</TableHead>
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
                  <TableHead>कार्यवाही</TableHead>
                  <TableHead>आधार</TableHead>
                  <TableHead>स्थिति</TableHead>
                </tr>
              </thead>

              <tbody>
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
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

                      <TableCell>
                        <div>
                          <p>{person.full_name || "-"}</p>
                          <p className="mt-1 text-xs text-stone-500">
                            {person.marital_status || "-"}
                          </p>
                        </div>
                      </TableCell>

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
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAction({
                                registrationId: person.id,
                                candidateName:
                                  person.full_name || person.token,
                                actionType: "status",
                                title: "Manage Candidate",
                                newStatus:
                                  person.candidate_status || person.status,
                              });
                              setDikshaDate(person.diksha_date || "");
                              setDikshaTime(person.diksha_time || "3:30 PM");
                            }}
                            className="rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-orange-800"
                          >
                            Manage
                            <span className="block text-[10px] font-normal">
                              अपडेट करें
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedHistory(person)}
                            className="rounded-full bg-stone-100 px-4 py-2 text-xs font-bold text-stone-700"
                          >
                            History
                            <span className="block text-[10px] font-normal">
                              इतिहास
                            </span>
                          </button>
                        </div>
                      </TableCell>

                      <TableCell>
                        {person.aadhaar_file_url ? (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedAadhaar({
                                url: person.aadhaar_file_url || "",
                                name:
                                  person.aadhaar_file_name ||
                                  person.full_name,
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
                        <div className="space-y-2">
                          <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            {person.candidate_status || person.status}
                          </span>

                          <div className="text-xs text-stone-600">
                            <p>
                              FM:{" "}
                              {person.final_meeting_attendance ||
                                "Not Marked"}
                            </p>
                            <p>
                              Diksha:{" "}
                              {person.diksha_attendance || "Not Marked"}
                            </p>

                            {person.diksha_date && (
                              <p>
                                Diksha Date: {formatDate(person.diksha_date)}
                                {person.diksha_time
                                  ? ` - ${person.diksha_time}`
                                  : ""}
                              </p>
                            )}
                          </div>

                          {person.evaluator_name && (
                            <p className="text-xs text-stone-500">
                              By: {person.evaluator_name}
                            </p>
                          )}
                        </div>
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
              <PrintHead>City</PrintHead>
              <PrintHead>Family Approval</PrintHead>
              <PrintHead>Status</PrintHead>
              <PrintHead>Attendance</PrintHead>
              <PrintHead>Diksha Date</PrintHead>
              <PrintHead>Remarks</PrintHead>
            </tr>
          </thead>

          <tbody>
            {filteredRegistrations.map((person, index) => (
              <tr key={person.id}>
                <PrintCell>{index + 1}</PrintCell>
                <PrintCell>{person.token}</PrintCell>
                <PrintCell>
                  <strong>{person.full_name || "-"}</strong>
                  <br />
                  Occupation: {person.occupation || "-"}
                </PrintCell>
                <PrintCell>{person.age || "-"}</PrintCell>
                <PrintCell>{person.gender || "-"}</PrintCell>
                <PrintCell>
                  Mobile: {person.mobile || "-"}
                  <br />
                  WhatsApp: {person.whatsapp || "-"}
                </PrintCell>
                <PrintCell>
                  {person.city || "-"}
                  <br />
                  {person.state || "-"}
                  <br />
                  PIN: {person.pin_code || "-"}
                </PrintCell>
                <PrintCell>
                  {person.marital_status === "Married" ? (
                    <>Husband / Wife: {person.spouse_name || "-"}</>
                  ) : (
                    <>
                      Father: {person.father_name || "-"}
                      <br />
                      Mother: {person.mother_name || "-"}
                    </>
                  )}
                </PrintCell>
                <PrintCell>{person.candidate_status || person.status}</PrintCell>
                <PrintCell>
                  FM: {person.final_meeting_attendance || "Not Marked"}
                  <br />
                  Diksha: {person.diksha_attendance || "Not Marked"}
                </PrintCell>
                <PrintCell>
                  {person.diksha_date
                    ? `${formatDate(person.diksha_date)} ${
                        person.diksha_time || ""
                      }`
                    : "-"}
                </PrintCell>
                <PrintCell>
                  {person.evaluator_notes || person.remarks_by || "-"}
                </PrintCell>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8">
          <p className="font-bold">Address Details:</p>

          {filteredRegistrations.map((person, index) => (
            <p key={person.id} className="mt-2 text-xs">
              <strong>
                {index + 1}. {person.token} - {person.full_name || "-"}:
              </strong>{" "}
              {person.address || "-"}
            </p>
          ))}
        </div>

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

      {selectedHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-extrabold">Candidate History</h3>
                <p className="mt-1 text-sm text-stone-600">
                  {selectedHistory.token} - {selectedHistory.full_name || "-"}
                </p>
                <p className="text-sm text-stone-600">
                  उम्मीदवार की पूरी कार्यवाही का इतिहास
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHistory(null)}
                className="rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-orange-800"
              >
                Close
                <span className="block text-[10px] font-normal">बंद करें</span>
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {activityLogs.filter(
                (log) => log.registration_id === selectedHistory.id
              ).length === 0 ? (
                <div className="rounded-2xl bg-orange-50 p-5 text-center font-semibold text-stone-700">
                  No history found for this candidate.
                  <span className="block text-sm font-normal">
                    इस उम्मीदवार का कोई इतिहास नहीं मिला।
                  </span>
                </div>
              ) : (
                activityLogs
                  .filter((log) => log.registration_id === selectedHistory.id)
                  .map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl border border-orange-100 bg-orange-50 p-4"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-extrabold text-orange-900">
                            {log.action_type || "Status Updated"}
                          </p>

                          <p className="mt-1 text-sm text-stone-600">
                            {formatDateTime(log.created_at)}
                          </p>
                        </div>

                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-orange-800">
                          Updated by: {log.updated_by || "-"}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs font-bold text-stone-500">
                            Old Status
                          </p>
                          <p className="font-bold text-stone-800">
                            {log.old_status || "-"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-3">
                          <p className="text-xs font-bold text-stone-500">
                            New Status
                          </p>
                          <p className="font-bold text-stone-800">
                            {log.new_status || "-"}
                          </p>
                        </div>
                      </div>

                      {(log.attendance_type || log.attendance_value) && (
                        <div className="mt-3 rounded-xl bg-white p-3">
                          <p className="text-xs font-bold text-stone-500">
                            Attendance
                          </p>
                          <p className="font-bold text-stone-800">
                            {log.attendance_type || "-"}:{" "}
                            {log.attendance_value || "-"}
                          </p>
                        </div>
                      )}

                      {log.notes && (
                        <div className="mt-3 rounded-xl bg-white p-3">
                          <p className="text-xs font-bold text-stone-500">
                            Notes / Remarks
                          </p>
                          <p className="mt-1 text-sm font-semibold text-stone-800">
                            {log.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-2xl font-extrabold">Manage Candidate</h3>
            <p className="mt-1 text-sm text-stone-600">
              Candidate: {selectedAction.candidateName}
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block font-bold">
                  Updated By / अपडेट करने वाला
                </label>
                <input
                  type="text"
                  value={updatedBy}
                  onChange={(event) => setUpdatedBy(event.target.value)}
                  className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
                  placeholder="Sewadar name"
                />
              </div>

              <div>
                <label className="mb-2 block font-bold">Notes / Remarks</label>
                <textarea
                  value={actionNotes}
                  onChange={(event) => setActionNotes(event.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
                  placeholder="Enter notes or remarks"
                />
              </div>

              <div className="rounded-2xl bg-orange-50 p-4">
                <h4 className="font-extrabold">Final Meeting Actions</h4>
                <p className="text-sm text-stone-600">फाइनल मीटिंग कार्यवाही</p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <ActionButton
                    label="Mark Present"
                    labelHi="उपस्थित"
                    className="bg-green-100 text-green-700"
                    disabled={isUpdatingAction}
                    onClick={() =>
                      handleSubmitAction({
                        actionType: "attendance",
                        title: "Final Meeting Present",
                        attendanceType: "Final Meeting",
                        attendanceValue: "Present",
                      })
                    }
                  />

                  <ActionButton
                    label="Mark Absent"
                    labelHi="अनुपस्थित"
                    className="bg-red-100 text-red-700"
                    disabled={isUpdatingAction}
                    onClick={() =>
                      handleSubmitAction({
                        actionType: "attendance",
                        title: "Final Meeting Absent",
                        attendanceType: "Final Meeting",
                        attendanceValue: "Absent",
                      })
                    }
                  />

                  <ActionButton
                    label="Approve"
                    labelHi="स्वीकृत"
                    className="bg-blue-100 text-blue-700"
                    disabled={isUpdatingAction}
                    onClick={() =>
                      handleSubmitAction({
                        actionType: "status",
                        title: "Approved for Diksha",
                        newStatus: "Approved",
                      })
                    }
                  />

                  <ActionButton
                    label="Reject"
                    labelHi="अस्वीकृत"
                    className="bg-stone-200 text-stone-700"
                    disabled={isUpdatingAction}
                    onClick={() =>
                      handleSubmitAction({
                        actionType: "status",
                        title: "Rejected",
                        newStatus: "Rejected",
                      })
                    }
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-purple-50 p-4">
                <h4 className="font-extrabold">Diksha Actions</h4>
                <p className="text-sm text-stone-600">दीक्षा कार्यवाही</p>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-purple-200 bg-white p-4 md:col-span-2">
                    <p className="font-bold">
                      {dikshaDate
                        ? "Reschedule Diksha Date"
                        : "Schedule Diksha Date"}
                    </p>
                    <p className="text-sm text-stone-600">
                      {dikshaDate ? "दीक्षा तारीख बदलें" : "दीक्षा तारीख चुनें"}
                    </p>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <input
                        type="date"
                        value={dikshaDate}
                        onChange={(event) => setDikshaDate(event.target.value)}
                        className="rounded-2xl border border-purple-200 px-4 py-3 outline-none focus:border-purple-600"
                      />

                      <input
                        type="text"
                        value={dikshaTime}
                        onChange={(event) => setDikshaTime(event.target.value)}
                        placeholder="3:30 PM"
                        className="rounded-2xl border border-purple-200 px-4 py-3 outline-none focus:border-purple-600"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleScheduleDiksha}
                      disabled={isUpdatingAction}
                      className="mt-4 w-full rounded-2xl bg-purple-100 px-4 py-3 text-sm font-bold text-purple-700 disabled:opacity-60"
                    >
                      {dikshaDate
                        ? "Save Rescheduled Diksha"
                        : "Save Diksha Schedule"}
                      <span className="block text-xs font-normal">
                        दीक्षा शेड्यूल सेव करें
                      </span>
                    </button>
                  </div>

                  <ActionButton
                    label="Diksha Present"
                    labelHi="दीक्षा उपस्थित"
                    className="bg-green-100 text-green-700"
                    disabled={isUpdatingAction}
                    onClick={() =>
                      handleSubmitAction({
                        actionType: "attendance",
                        title: "Diksha Present",
                        attendanceType: "Diksha",
                        attendanceValue: "Present",
                      })
                    }
                  />

                  <ActionButton
                    label="Diksha Absent"
                    labelHi="दीक्षा अनुपस्थित"
                    className="bg-red-100 text-red-700"
                    disabled={isUpdatingAction}
                    onClick={() =>
                      handleSubmitAction({
                        actionType: "attendance",
                        title: "Diksha Absent",
                        attendanceType: "Diksha",
                        attendanceValue: "Absent",
                      })
                    }
                  />

                  <ActionButton
                    label="Diksha Completed"
                    labelHi="दीक्षा पूर्ण"
                    className="bg-orange-100 text-orange-800 md:col-span-2"
                    disabled={isUpdatingAction}
                    onClick={() =>
                      handleSubmitAction({
                        actionType: "status",
                        title: "Diksha Completed",
                        newStatus: "Diksha Completed",
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setSelectedAction(null);
                  setActionNotes("");
                  setDikshaDate("");
                  setDikshaTime("3:30 PM");
                }}
                disabled={isUpdatingAction}
                className="w-full rounded-2xl border border-orange-300 px-5 py-3 font-bold text-orange-800 disabled:opacity-60"
              >
                {isUpdatingAction ? "Saving..." : "Close / बंद करें"}
              </button>
            </div>
          </div>
        </div>
      )}

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

function formatDateTime(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getTodayDateString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function maskMobile(mobile: string) {
  if (!mobile || mobile.length < 4) return mobile;
  return `${mobile.slice(0, 2)}xxxxxx${mobile.slice(-2)}`;
}

function csvEscape(value: string) {
  const cleanedValue = value.replace(/\n/g, " ").replace(/\r/g, " ");

  if (
    cleanedValue.includes(",") ||
    cleanedValue.includes('"') ||
    cleanedValue.includes("'")
  ) {
    return `"${cleanedValue.replace(/"/g, '""')}"`;
  }

  return cleanedValue;
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

function ReportCountCard({
  title,
  titleHi,
  value,
  active,
  onClick,
}: {
  title: string;
  titleHi: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-5 text-left shadow-sm transition hover:border-orange-500 ${
        active
          ? "border-orange-600 bg-orange-100"
          : "border-orange-100 bg-orange-50"
      }`}
    >
      <p className="text-sm font-bold text-stone-700">{title}</p>
      <p className="mt-1 text-xs font-semibold text-stone-500">{titleHi}</p>
      <p className="mt-4 text-3xl font-extrabold text-orange-800">{value}</p>
      <p className="mt-2 text-xs font-semibold text-orange-700">
        Click to view / देखने के लिए क्लिक करें
      </p>
    </button>
  );
}

function ReportButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-bold ${
        active ? "bg-orange-700 text-white" : "bg-white text-orange-800"
      }`}
    >
      {label}
    </button>
  );
}

function ActionButton({
  label,
  labelHi,
  className,
  disabled,
  onClick,
}: {
  label: string;
  labelHi: string;
  className: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-4 py-3 text-sm font-bold disabled:opacity-60 ${className}`}
    >
      {label}
      <span className="block text-xs font-normal">{labelHi}</span>
    </button>
  );
}

function TableHead({ children }: { children: ReactNode }) {
  return (
    <th className="border-b border-orange-200 px-4 py-3 text-sm font-extrabold text-stone-800">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: ReactNode }) {
  return (
    <td className="border-b border-orange-100 px-4 py-4 text-sm font-semibold text-stone-800">
      {children}
    </td>
  );
}

function PrintHead({ children }: { children: ReactNode }) {
  return (
    <th className="border border-black px-2 py-2 text-left font-bold">
      {children}
    </th>
  );
}

function PrintCell({ children }: { children: ReactNode }) {
  return <td className="border border-black px-2 py-2">{children}</td>;
}