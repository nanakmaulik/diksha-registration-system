"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";

type Registration = {
  id: string;
  token: string;
  slot_id: string | null;
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
country: string | null;
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
type RegistrationRequest = {
  id: string;
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
  country: string | null;
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
  aadhaar_file_url: string | null;
  aadhaar_file_name: string | null;
  requested_slot_id: string | null;
  requested_meeting_date: string | null;
  requested_meeting_time: string | null;
  request_status: string | null;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  created_registration_id: string | null;
  vrindavan_stay_days: string | null;
video_proof_attached: string | null;
video_proof_other: string | null;
referred_to: string | null;
  created_at: string;
};

export default function AdminDashboard({
  registrations,
  slots,
  activityLogs,
  registrationRequests,
  accessMode = "admin",
}: {
  registrations: Registration[];
  slots: Slot[];
  activityLogs: ActivityLog[];
  registrationRequests: RegistrationRequest[];
  accessMode?: "admin" | "sadhak";
}) {
  const router = useRouter();
  const isSadhakAccess = accessMode === "sadhak";

  const [search, setSearch] = useState("");
  const [slotDate, setSlotDate] = useState(() => {
  if (typeof window === "undefined") return "all";
  return localStorage.getItem("adminSlotDate") || "all";
});
  const [showFullMobile, setShowFullMobile] = useState(false);
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
const [editingSlotCapacity, setEditingSlotCapacity] = useState("");
const [isUpdatingSlotCapacity, setIsUpdatingSlotCapacity] = useState(false);
  const [reportFilter, setReportFilter] = useState("all");
  const [dikshaDate, setDikshaDate] = useState("");
  const [dikshaTime, setDikshaTime] = useState("3:30 PM");
  const [finalMeetingSlotId, setFinalMeetingSlotId] = useState("");
  const [finalMeetingMonth, setFinalMeetingMonth] = useState("");
const [isReschedulingFinalMeeting, setIsReschedulingFinalMeeting] =
  useState(false);
  const [printMode, setPrintMode] = useState<"list" | "forms">("list");
  const [isBulkScheduling, setIsBulkScheduling] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState(() => {
    if (typeof window === "undefined") return getTodayDateString();
    return localStorage.getItem("adminAttendanceDate") || getTodayDateString();
  });
  const [selectedAttendanceIds, setSelectedAttendanceIds] = useState<string[]>([]);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [attendanceUpdatedBy, setAttendanceUpdatedBy] = useState("Sadhak");
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [requestUpdatedBy, setRequestUpdatedBy] = useState("Sadhak");
const [rejectionReason, setRejectionReason] = useState("");
const [processingRequestId, setProcessingRequestId] = useState<string | null>(
  null
);
const [editingRequestSlotId, setEditingRequestSlotId] = useState<string | null>(
  null
);
const [editingRequestNewSlotId, setEditingRequestNewSlotId] = useState("");
const [isUpdatingRequestSlot, setIsUpdatingRequestSlot] = useState(false);
const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
const [pendingQuestionAnswers, setPendingQuestionAnswers] = useState<
  Record<
    string,
    {
      vrindavan_stay_days: string;
      video_proof_attached: string;
      video_proof_other: string;
      referred_to: string;
    }
  >
>({});

const [savingQuestionRequestId, setSavingQuestionRequestId] =
  useState<string | null>(null);
const [editingRequest, setEditingRequest] =
  useState<RegistrationRequest | null>(null);

const [editRequestFormData, setEditRequestFormData] = useState({
  full_name: "",
  age: "",
  gender: "",
  occupation: "",
  marital_status: "",
  mobile: "",
  whatsapp: "",
  address: "",
  city: "",
  state: "",
  country: "",
  pin_code: "",
  spouse_name: "",
  father_name: "",
  mother_name: "",
  family_name: "",
  family_relation: "",
  family_mobile: "",
  id_type: "",
  id_number: "",
});

const [isSavingRequestEdit, setIsSavingRequestEdit] = useState(false);
const [selectedRegistrationIds, setSelectedRegistrationIds] = useState<string[]>([]);
const [isConvertingGroupToken, setIsConvertingGroupToken] = useState(false);
const [isDeletingRequests, setIsDeletingRequests] = useState(false);
const [isBulkApprovingRequests, setIsBulkApprovingRequests] = useState(false);
  const [selectedAadhaar, setSelectedAadhaar] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const [selectedHistory, setSelectedHistory] = useState<Registration | null>(
    null
  );
  const [editingRegistration, setEditingRegistration] =
  useState<Registration | null>(null);

const [editFormData, setEditFormData] = useState({
  full_name: "",
  age: "",
  gender: "",
  occupation: "",
  marital_status: "",
  mobile: "",
  whatsapp: "",
  address: "",
  city: "",
  state: "",
  country: "",
  pin_code: "",
  spouse_name: "",
  father_name: "",
  mother_name: "",
  family_name: "",
  family_relation: "",
  family_mobile: "",
  id_type: "",
  id_number: "",
});

const [isSavingRegistrationEdit, setIsSavingRegistrationEdit] = useState(false);
const [isDeletingRegistrationId, setIsDeletingRegistrationId] =
  useState<string | null>(null);

  const [selectedAction, setSelectedAction] = useState<{
    registrationId: string;
    candidateName: string;
    workflow: "final_meeting" | "diksha";
    actionType: "status" | "attendance";
    title: string;
    newStatus?: string;
    attendanceType?: string;
    attendanceValue?: string;
  } | null>(null);

  const [actionNotes, setActionNotes] = useState("");
  const [updatedBy, setUpdatedBy] = useState("Sadhak");
  const [isUpdatingAction, setIsUpdatingAction] = useState(false);
  const [tokenSuccess, setTokenSuccess] = useState<{
    token: string;
    name: string;
    meetingDate?: string;
    meetingTime?: string;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem("adminSlotDate", slotDate);
  }, [slotDate]);
  
  useEffect(() => {
    localStorage.setItem("adminAttendanceDate", attendanceDate);
  }, [attendanceDate]);
  
  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
  
    function scheduleRefresh() {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
  
      refreshTimer = setTimeout(() => {
        router.refresh();
      }, 700);
    }
  
    const channel = supabase
      .channel("admin-dashboard-live-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "registration_requests",
        },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "registrations",
        },
        scheduleRefresh
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "slots",
        },
        scheduleRefresh
      )
      .subscribe();
  
    const fallbackInterval = window.setInterval(() => {
      router.refresh();
    }, 20000);
  
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
  
      window.clearInterval(fallbackInterval);
      supabase.removeChannel(channel);
    };
  }, [router]);
  

  const todayDate = getTodayDateString();
  const availableFinalMeetingSlots = slots.filter(
    (slot) => slot.slot_date >= todayDate
  );
  
  const finalMeetingMonths = Array.from(
    new Set(availableFinalMeetingSlots.map((slot) => slot.slot_date.slice(0, 7)))
  );
  
  const selectedFinalMeetingMonth =
    finalMeetingMonth || finalMeetingMonths[0] || "";
  
  const finalMeetingMonthSlots = availableFinalMeetingSlots.filter((slot) =>
    slot.slot_date.startsWith(selectedFinalMeetingMonth)
  );
  
  const finalMeetingCalendarDays = getCalendarDaysForMonth(
    selectedFinalMeetingMonth,
    finalMeetingMonthSlots
  );
  const pendingRequests = useMemo(() => {
    return registrationRequests.filter(
      (request) => request.request_status === "Pending Verification"
    );
  }, [registrationRequests]);
 

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
  async function handleRescheduleRegistrationRequest(request: RegistrationRequest) {
    if (!editingRequestNewSlotId) {
      alert("Please select new meeting date.\nकृपया नई meeting date चुनें।");
      return;
    }
  
    if (!requestUpdatedBy.trim()) {
      alert("Please enter Sadhak name.\nकृपया Sadhak का नाम भरें।");
      return;
    }
  
    const selectedSlot = slots.find((slot) => slot.id === editingRequestNewSlotId);
  
    const confirmed = window.confirm(
      `Change meeting date for ${request.full_name || "-"}?\n\nNew Date: ${
        selectedSlot ? formatDate(selectedSlot.slot_date) : "-"
      }\nTime: ${selectedSlot?.slot_time || "-"}`
    );
  
    if (!confirmed) return;
  
    setIsUpdatingRequestSlot(true);
  
    const { error } = await supabase.rpc("reschedule_registration_request", {
      p_request_id: request.id,
      p_new_slot_id: editingRequestNewSlotId,
      p_updated_by: requestUpdatedBy.trim(),
    });
  
    if (error) {
      alert("Request meeting date update error: " + error.message);
      setIsUpdatingRequestSlot(false);
      return;
    }
  
    setEditingRequestSlotId(null);
    setEditingRequestNewSlotId("");
    setIsUpdatingRequestSlot(false);
  
    window.location.reload();
  }
  function getPendingQuestionAnswers(request: RegistrationRequest) {
    return (
      pendingQuestionAnswers[request.id] || {
        vrindavan_stay_days: request.vrindavan_stay_days || "",
        video_proof_attached: request.video_proof_attached || "",
        video_proof_other: request.video_proof_other || "",
        referred_to: request.referred_to || "",
      }
    );
  }
  
  function handlePendingQuestionChange(
    request: RegistrationRequest,
    field:
      | "vrindavan_stay_days"
      | "video_proof_attached"
      | "video_proof_other"
      | "referred_to",
    value: string
  ) {
    const currentAnswers = getPendingQuestionAnswers(request);
  
    setPendingQuestionAnswers((prev) => ({
      ...prev,
      [request.id]: {
        ...currentAnswers,
        [field]: value,
        ...(field === "video_proof_attached" && value !== "Others"
          ? { video_proof_other: "" }
          : {}),
      },
    }));
  }
  
  async function savePendingQuestionAnswers(
    request: RegistrationRequest,
    showAlert = true
  ) {
    const answers = getPendingQuestionAnswers(request);
  
    if (
      answers.video_proof_attached === "Others" &&
      !answers.video_proof_other.trim()
    ) {
      alert("Please enter other video proof details.\nकृपया other video proof details भरें।");
      return false;
    }
  
    setSavingQuestionRequestId(request.id);
  
    const { error } = await supabase
      .from("registration_requests")
      .update({
        vrindavan_stay_days: answers.vrindavan_stay_days.trim() || null,
        video_proof_attached: answers.video_proof_attached || null,
        video_proof_other: answers.video_proof_other.trim() || null,
        referred_to: answers.referred_to || null,
      })
      .eq("id", request.id);
  
    if (error) {
      alert("Question answers save error: " + error.message);
      setSavingQuestionRequestId(null);
      return false;
    }
  
    setSavingQuestionRequestId(null);
  
    if (showAlert) {
      alert("Question answers saved successfully.\nप्रश्नों के उत्तर सेव हो गए।");
    }
  
    return true;
  }

  async function handleApproveRequest(request: RegistrationRequest) {
    if (!requestUpdatedBy.trim()) {
      alert("Please enter Sadhak name.\nकृपया Sadhak का नाम भरें।");
      return;
    }
  
    const confirmed = window.confirm(
      `Accept this request and generate token for ${
        request.full_name || "-"
      }?\n\nक्या आप इस request को accept करके token generate करना चाहते हैं?`
    );
  
    if (!confirmed) return;

    const answersSaved = await savePendingQuestionAnswers(request, false);
    
    if (!answersSaved) return;
    
    setProcessingRequestId(request.id);
  
    const { data, error } = await supabase.rpc("approve_registration_request", {
      p_request_id: request.id,
      p_verified_by: requestUpdatedBy.trim(),
    });
  
    if (error) {
      alert("Request approval error: " + error.message);
      setProcessingRequestId(null);
      return;
    }
  
    const generatedToken = Array.isArray(data) ? data[0]?.token : "";
  
    setTokenSuccess({
      token: generatedToken || "-",
      name: request.full_name || "-",
      meetingDate: request.requested_meeting_date || "",
      meetingTime: request.requested_meeting_time || "",
    });
    
    setProcessingRequestId(null);
  }
  async function handleBulkApproveRequests(groupType: "Couple" | "Family") {
    if (selectedRequestIds.length < 2) {
      alert("Please select at least 2 requests.\nकृपया कम से कम 2 requests select करें।");
      return;
    }
  
    if (groupType === "Couple" && selectedRequestIds.length !== 2) {
      alert("Couple token requires exactly 2 selected requests.\nCouple token के लिए exactly 2 requests select करें।");
      return;
    }
  
    if (!requestUpdatedBy.trim()) {
      alert("Please enter Sadhak name.\nकृपया Sadhak का नाम भरें।");
      return;
    }
  
    const selectedRequests = pendingRequests.filter((request) =>
      selectedRequestIds.includes(request.id)
    );
  
    const uniqueSlotIds = Array.from(
      new Set(selectedRequests.map((request) => request.requested_slot_id))
    );
  
    if (uniqueSlotIds.length > 1) {
      alert(
        "Selected requests must have the same meeting date.\nSelected requests की meeting date same होनी चाहिए।"
      );
      return;
    }
  
    const confirmed = window.confirm(
      `Generate one shared ${groupType} token for ${selectedRequestIds.length} selected request(s)?\n\nSab selected candidates ko same token milega, but forms separate rahenge.`
    );
  
    if (!confirmed) return;
  
    setIsBulkApprovingRequests(true);
  
    const { data, error } = await supabase.rpc("approve_registration_request_group", {
      p_request_ids: selectedRequestIds,
      p_verified_by: requestUpdatedBy.trim(),
      p_group_type: groupType,
    });
  
    if (error) {
      alert("Group approval error: " + error.message);
      setIsBulkApprovingRequests(false);
      return;
    }
  
    const generatedToken = Array.isArray(data) ? data[0]?.token : "";
  
    setTokenSuccess({
      token: generatedToken || "-",
      name: `${groupType} Token - ${selectedRequestIds.length} candidates`,
      meetingDate: selectedRequests[0]?.requested_meeting_date || "",
      meetingTime: selectedRequests[0]?.requested_meeting_time || "",
    });
  
    setSelectedRequestIds([]);
    setIsBulkApprovingRequests(false);
  }

  async function handleRejectRequest(request: RegistrationRequest) {
    if (!requestUpdatedBy.trim()) {
      alert("Please enter Sadhak name.\nकृपया Sadhak का नाम भरें।");
      return;
    }
  
    const reason =
      rejectionReason.trim() ||
      window.prompt("Enter deferred reason / Deferred reason लिखें") ||
      "";
  
    if (!reason.trim()) {
      alert("Please enter deferred reason.\nकृपया deferred reason लिखें।");
      return;
    }
  
    const confirmed = window.confirm(
      `Defer request for ${
  request.full_name || "-"
}?\n\nक्या आप request स्थगित करना चाहते हैं?`
    );
  
    if (!confirmed) return;
  
    setProcessingRequestId(request.id);
  
    const { error } = await supabase.rpc("reject_registration_request", {
      p_request_id: request.id,
      p_rejected_by: requestUpdatedBy.trim(),
      p_rejection_reason: reason.trim(),
    });
  
    if (error) {
      alert("Request rejection error: " + error.message);
      setProcessingRequestId(null);
      return;
    }
  
    alert("Request deferred successfully.\nRequest स्थगित हो गई।");
  
    setProcessingRequestId(null);
    setRejectionReason("");
    window.location.reload();
  }
  function openEditRequest(request: RegistrationRequest) {
    setEditingRequest(request);
  
    setEditRequestFormData({
      full_name: request.full_name || "",
      age: request.age ? String(request.age) : "",
      gender: request.gender || "",
      occupation: request.occupation || "",
      marital_status: request.marital_status || "",
      mobile: request.mobile || "",
      whatsapp: request.whatsapp || "",
      address: request.address || "",
      city: request.city || "",
      state: request.state || "",
      country: request.country || "",
      pin_code: request.pin_code || "",
      spouse_name: request.spouse_name || "",
      father_name: request.father_name || "",
      mother_name: request.mother_name || "",
      family_name: request.family_name || "",
      family_relation: request.family_relation || "",
      family_mobile: request.family_mobile || "",
      id_type: request.id_type || "",
      id_number: request.id_number || "",
    });
  }
  
  function handleEditRequestFormChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;
  
    setEditRequestFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  
  async function handleSaveRequestEdit() {
    if (!editingRequest) return;
  
    if (!editRequestFormData.full_name.trim()) {
      alert("Please enter name.\nकृपया नाम भरें।");
      return;
    }
  
    if (!editRequestFormData.mobile.trim()) {
      alert("Please enter mobile number.\nकृपया मोबाइल नंबर भरें।");
      return;
    }
  
    if (!editRequestFormData.id_number.trim()) {
      alert("Please enter ID / Aadhaar number.\nकृपया पहचान नंबर भरें।");
      return;
    }
  
    setIsSavingRequestEdit(true);
  
    const { error } = await supabase
      .from("registration_requests")
      .update({
        full_name: editRequestFormData.full_name.trim(),
        age: editRequestFormData.age ? Number(editRequestFormData.age) : null,
        gender: editRequestFormData.gender || null,
        occupation: editRequestFormData.occupation || null,
        marital_status: editRequestFormData.marital_status || null,
        mobile: editRequestFormData.mobile.trim(),
        whatsapp: editRequestFormData.whatsapp.trim() || null,
        address: editRequestFormData.address.trim() || null,
        city: editRequestFormData.city.trim() || null,
        state: editRequestFormData.state.trim() || null,
        country: editRequestFormData.country.trim() || null,
        pin_code: editRequestFormData.pin_code.trim() || null,
        spouse_name: editRequestFormData.spouse_name.trim() || null,
        father_name: editRequestFormData.father_name.trim() || null,
        mother_name: editRequestFormData.mother_name.trim() || null,
        family_name: editRequestFormData.family_name.trim() || null,
        family_relation: editRequestFormData.family_relation || null,
        family_mobile: editRequestFormData.family_mobile.trim() || null,
        id_type: editRequestFormData.id_type || null,
        id_number: editRequestFormData.id_number.trim() || null,
      })
      .eq("id", editingRequest.id);
  
    if (error) {
      alert("Pending request update error: " + error.message);
      setIsSavingRequestEdit(false);
      return;
    }
  
    setIsSavingRequestEdit(false);
    setEditingRequest(null);
    window.location.reload();
  }
  async function handleRescheduleFinalMeeting() {
    if (!selectedAction) return;
  
    if (!updatedBy.trim()) {
      alert("Please enter updated by name.\nकृपया अपडेट करने वाले का नाम भरें।");
      return;
    }
  
    if (!finalMeetingSlotId) {
      alert("Please select new Final Meeting date.\nकृपया नई Final Meeting date चुनें।");
      return;
    }
  
    const selectedSlot = slots.find((slot) => slot.id === finalMeetingSlotId);
  
    const confirmed = window.confirm(
      `Reschedule Final Meeting for ${selectedAction.candidateName}?\n\nNew Date: ${
        selectedSlot ? formatDate(selectedSlot.slot_date) : "-"
      }\nTime: ${selectedSlot?.slot_time || "-"}`
    );
  
    if (!confirmed) return;
  
    setIsReschedulingFinalMeeting(true);
  
    const { error } = await supabase.rpc("reschedule_final_meeting", {
      p_registration_id: selectedAction.registrationId,
      p_new_slot_id: finalMeetingSlotId,
      p_notes: actionNotes.trim(),
      p_updated_by: updatedBy.trim(),
    });
  
    if (error) {
      alert("Final Meeting reschedule error: " + error.message);
      setIsReschedulingFinalMeeting(false);
      return;
    }
  
    const { data: updatedRegistration, error: fetchTokenError } = await supabase
    .from("registrations")
    .select("token, full_name, final_meeting_date, final_meeting_time")
    .eq("id", selectedAction.registrationId)
    .single();
  
  if (fetchTokenError) {
    alert("Final Meeting rescheduled successfully, but token fetch error: " + fetchTokenError.message);
    window.location.reload();
    return;
  }
  
  setTokenSuccess({
    token: updatedRegistration?.token || "-",
    name: updatedRegistration?.full_name || selectedAction.candidateName || "-",
    meetingDate: updatedRegistration?.final_meeting_date || "",
    meetingTime: updatedRegistration?.final_meeting_time || "",
  });
  
  setIsReschedulingFinalMeeting(false);
  setSelectedAction(null);
  setActionNotes("");
  setFinalMeetingSlotId("");
  setFinalMeetingMonth("");
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

    

    
    setIsUpdatingAction(true);

    const { error } = await supabase.rpc("schedule_candidate_diksha", {
      p_registration_id: selectedAction.registrationId,
      p_diksha_date: dikshaDate,
      p_diksha_time: "",
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
  
  function handleToggleRegistrationSelection(registrationId: string) {
    setSelectedRegistrationIds((prev) =>
      prev.includes(registrationId)
        ? prev.filter((id) => id !== registrationId)
        : [...prev, registrationId]
    );
  }
  
  function handleToggleAllFilteredRegistrations() {
    const ids = filteredRegistrations.map((person) => person.id);
  
    if (ids.length === 0) return;
  
    const allSelected = ids.every((id) => selectedRegistrationIds.includes(id));
  
    if (allSelected) {
      setSelectedRegistrationIds([]);
      return;
    }
  
    setSelectedRegistrationIds(ids);
  }

  function handleToggleRequestSelection(requestId: string) {
    setSelectedRequestIds((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  }
  
  function handleToggleAllPendingRequests() {
    if (pendingRequests.length === 0) return;
  
    if (selectedRequestIds.length === pendingRequests.length) {
      setSelectedRequestIds([]);
      return;
    }
  
    setSelectedRequestIds(pendingRequests.map((request) => request.id));
  }
  
  async function handleDeleteSelectedRequests() {
    if (selectedRequestIds.length === 0) {
      alert("Please select requests to delete.\nकृपया delete करने के लिए requests select करें।");
      return;
    }
  
    const confirmed = window.confirm(
      `Delete ${selectedRequestIds.length} selected pending request(s)?\n\nये सिर्फ Pending Verification requests delete करेगा.`
    );
  
    if (!confirmed) return;
  
    setIsDeletingRequests(true);
  
    const { data, error } = await supabase.rpc(
      "delete_pending_registration_requests",
      {
        p_request_ids: selectedRequestIds,
      }
    );
  
    if (error) {
      alert("Delete request error: " + error.message);
      setIsDeletingRequests(false);
      return;
    }
  
    alert(
      `Deleted successfully.\nDeleted requests: ${data || 0}\n\nSelected pending requests delete हो गई।`
    );
  
    setSelectedRequestIds([]);
    setIsDeletingRequests(false);
    window.location.reload();
  }
  function handleToggleAttendanceSelection(registrationId: string) {
    setSelectedAttendanceIds((prev) =>
      prev.includes(registrationId)
        ? prev.filter((id) => id !== registrationId)
        : [...prev, registrationId]
    );
  }
  
  function handleToggleAllAttendance() {
    const notPresentIds = finalMeetingAttendanceList
      .filter((person) => person.final_meeting_attendance !== "Present")
      .map((person) => person.id);
  
    if (notPresentIds.length === 0) return;
  
    const allSelected = notPresentIds.every((id) =>
      selectedAttendanceIds.includes(id)
    );
  
    if (allSelected) {
      setSelectedAttendanceIds([]);
      return;
    }
  
    setSelectedAttendanceIds(notPresentIds);
  }
  
  async function handleMarkSingleAttendancePresent(person: Registration) {
    if (!attendanceUpdatedBy.trim()) {
      alert("Please enter Sadhak name.\nकृपया Sadhak का नाम भरें।");
      return;
    }
  
    setIsMarkingAttendance(true);
  
    const { error } = await supabase.rpc("mark_final_meeting_present", {
      p_registration_id: person.id,
      p_updated_by: attendanceUpdatedBy.trim(),
      p_notes: "Marked from attendance list",
    });
  
    if (error) {
      alert("Attendance update error: " + error.message);
      setIsMarkingAttendance(false);
      return;
    }
  
    setIsMarkingAttendance(false);
    window.location.reload();
  }
  async function handleUndoSingleAttendancePresent(person: Registration) {
    if (!attendanceUpdatedBy.trim()) {
      alert("Please enter Sadhak name.\nकृपया Sadhak का नाम भरें।");
      return;
    }
  
    const confirmed = window.confirm(
      `Undo attendance for ${person.full_name || person.token}?\n\nAttendance वापस Not Marked हो जाएगी.`
    );
  
    if (!confirmed) return;
  
    setIsMarkingAttendance(true);
  
    const { error } = await supabase.rpc("undo_final_meeting_present", {
      p_registration_id: person.id,
      p_updated_by: attendanceUpdatedBy.trim(),
      p_notes: "Undo from attendance list",
    });
  
    if (error) {
      alert("Undo attendance error: " + error.message);
      setIsMarkingAttendance(false);
      return;
    }
  
    setIsMarkingAttendance(false);
    window.location.reload();
  }
  async function handleMarkSelectedAttendancePresent() {
    if (selectedAttendanceIds.length === 0) {
      alert("Please select candidates first.\nकृपया पहले candidates select करें।");
      return;
    }
  
    if (!attendanceUpdatedBy.trim()) {
      alert("Please enter Sadhak name.\nकृपया Sadhak का नाम भरें।");
      return;
    }
  
    const confirmed = window.confirm(
      `Mark ${selectedAttendanceIds.length} selected candidate(s) as Present?\n\nSelected candidates की attendance Present mark होगी और status Final Meeting Attended हो जाएगा.`
    );
  
    if (!confirmed) return;
  
    setIsMarkingAttendance(true);
  
    for (const registrationId of selectedAttendanceIds) {
      const { error } = await supabase.rpc("mark_final_meeting_present", {
        p_registration_id: registrationId,
        p_updated_by: attendanceUpdatedBy.trim(),
        p_notes: "Marked from bulk attendance list",
      });
  
      if (error) {
        alert("Attendance update error: " + error.message);
        setIsMarkingAttendance(false);
        return;
      }
    }
  
    setSelectedAttendanceIds([]);
    setIsMarkingAttendance(false);
    window.location.reload();
  }
  async function handleUpdateSlotCapacity(slot: Slot) {
    const newCapacity = Number(editingSlotCapacity);
  
    if (!Number.isInteger(newCapacity) || newCapacity < 0) {
      alert("Please enter a valid capacity.\nकृपया सही capacity भरें।");
      return;
    }
  
    if (newCapacity < slot.current_count) {
      alert(
        `Capacity already filled count se kam nahi ho sakti.\nAlready filled: ${slot.current_count}\n\nAgar slot close karna hai aur filled 0 hai, capacity 0 kar sakte ho. Agar filled ${slot.current_count} hai, minimum capacity ${slot.current_count} rakhni padegi.`
      );
      return;
    }
    setIsUpdatingSlotCapacity(true);
  
    const { error } = await supabase.rpc("update_slot_capacity", {
      p_slot_id: slot.id,
      p_new_capacity: newCapacity,
      p_updated_by: "Admin",
    });
  
    if (error) {
      alert("Slot capacity update error: " + error.message);
      setIsUpdatingSlotCapacity(false);
      return;
    }
  
    setEditingSlotId(null);
    setEditingSlotCapacity("");
    setIsUpdatingSlotCapacity(false);
  
    window.location.reload();
  }

  async function handleBulkScheduleNextDayDiksha() {
    if (slotDate === "all") {
      alert(
        "Please select one meeting date first.\nकृपया पहले एक मीटिंग तारीख चुनें।"
      );
      return;
    }
  
    const selectedDateRegistrations = registrations.filter(
      (person) => person.slots?.slot_date === slotDate
    );
  
    if (selectedDateRegistrations.length === 0) {
      alert(
        "No registrations found for this meeting date.\nइस मीटिंग तारीख के लिए कोई पंजीकरण नहीं मिला।"
      );
      return;
    }
  
    const confirmed = window.confirm(
      `This will auto-schedule next-day Diksha for eligible candidates of ${formatDate(
        slotDate
      )}.\n\nDefault Diksha Date: ${formatDate(
        addDaysToDateString(slotDate, 1)
      )}\nContinue?`
    );
  
    if (!confirmed) return;
  
    setIsBulkScheduling(true);
  
    const { data, error } = await supabase.rpc("bulk_schedule_next_day_diksha", {
      p_meeting_date: slotDate,
      p_diksha_time: "",
      p_updated_by: "Sadhak",
    });
  
    if (error) {
      alert("Bulk Diksha schedule error: " + error.message);
      setIsBulkScheduling(false);
      return;
    }
  
    alert(
      `Next-day Diksha scheduled successfully.\nUpdated candidates: ${
        data || 0
      }\n\nअगले दिन की दीक्षा शेड्यूल हो गई।`
    );
  
    setIsBulkScheduling(false);
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
      if (reportFilter === "final_meeting_attended") {
        matchesReport = statusValue === "Final Meeting Attended";
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
      if (reportFilter === "rescheduled_diksha") {
        const defaultDikshaDate = person.slots?.slot_date
          ? addDaysToDateString(person.slots.slot_date, 1)
          : "";
      
        matchesReport =
          !!person.diksha_date &&
          !!defaultDikshaDate &&
          person.diksha_date !== defaultDikshaDate &&
          (statusValue === "Scheduled for Diksha" ||
            statusValue === "Diksha Completed");
      }

      return matchesSearch && matchesSlot && matchesReport;
})
.sort(sortByMeetingDateAndToken);
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
    const finalMeetingAttended = registrations.filter(
      (person) =>
        (person.candidate_status || person.status) === "Final Meeting Attended"
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
    const rescheduledDiksha = registrations.filter((person) => {
      const defaultDikshaDate = person.slots?.slot_date
        ? addDaysToDateString(person.slots.slot_date, 1)
        : "";
    
      const statusValue = person.candidate_status || person.status || "";
    
      return (
        !!person.diksha_date &&
        !!defaultDikshaDate &&
        person.diksha_date !== defaultDikshaDate &&
        (statusValue === "Scheduled for Diksha" ||
          statusValue === "Diksha Completed")
      );
    }).length;

    return {
      scheduledFinalMeetings,
      pending,
      approved,
      finalMeetingAttended,
      rejected,
      scheduledDiksha,
      dikshaCompleted,
      noShow,
      todayFinalMeetings,
      todayDiksha,
      rescheduledDiksha,
    };
  }, [registrations, todayDate]);

  const totalRegistered = registrations.length;

  const slotsFull = slots.filter(
    (slot) => slot.current_count >= slot.capacity
  ).length;

  const nextAvailableSlot = slots.find(
    (slot) => slot.current_count < slot.capacity
  );

  const tomorrowDate = getTodayDateString();
  const threeMonthsLaterDate = getDateAfterMonths(3);
  const finalMeetingAttendanceList = useMemo(() => {
    return registrations
      .filter((person) => {
        const meetingDate = person.slots?.slot_date || person.final_meeting_date;
        const statusValue = person.candidate_status || person.status || "";
  
        return (
          meetingDate === attendanceDate &&
          (statusValue === "Scheduled for Final Meeting" ||
            statusValue === "Pending" ||
            statusValue === "Rejected" ||
            statusValue === "Final Meeting Attended")
        );
      })
      .filter((person) => {
        const searchText = attendanceSearch.trim().toLowerCase();
  
        if (!searchText) return true;
  
        return (
          (person.full_name || "").toLowerCase().includes(searchText) ||
          (person.token || "").toLowerCase().includes(searchText) ||
          (person.mobile || "").toLowerCase().includes(searchText) ||
          (person.whatsapp || "").toLowerCase().includes(searchText) ||
          (person.city || "").toLowerCase().includes(searchText)
        );
      })
      .sort(sortByMeetingDateAndToken);
  }, [registrations, attendanceDate, attendanceSearch]);

    const upcomingSlots = slots
    .filter(
      (slot) =>
        slot.slot_date >= tomorrowDate &&
        slot.slot_date <= threeMonthsLaterDate
    )
    .sort((a, b) => a.slot_date.localeCompare(b.slot_date))
    .slice(0, showAllSlots ? 100 : 8);

  const selectedDateLabel =
    slotDate === "all" ? "All Slots" : formatDate(slotDate);

  const selectedDateTime =
    filteredRegistrations[0]?.slots?.slot_time || "3:30 PM";

    const groupedPrintRegistrations = useMemo(() => {
      const male = filteredRegistrations.filter((person) =>
        (person.token || "").toUpperCase().startsWith("M")
      );
    
      const female = filteredRegistrations.filter((person) =>
        (person.token || "").toUpperCase().startsWith("F")
      );
    
      const couple = filteredRegistrations.filter((person) =>
        (person.token || "").toUpperCase().startsWith("CP")
      );
    
      const family = filteredRegistrations.filter((person) =>
        (person.token || "").toUpperCase().startsWith("FAM")
      );
    
      return [
        { title: "MALE", titleHi: "पुरुष", records: male },
        { title: "FEMALE", titleHi: "महिला", records: female },
        { title: "COUPLE", titleHi: "जोड़ा", records: couple },
        { title: "FAMILY", titleHi: "परिवार", records: family },
      ].filter((group) => group.records.length > 0);
    }, [filteredRegistrations]);

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
    
      setPrintMode("list");
    
      setTimeout(() => {
        window.print();
      }, 100);
    }
    
    function handlePrintDevoteeForms() {
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
    
      setPrintMode("forms");
    
      setTimeout(() => {
        window.print();
      }, 100);
    }

    async function handleConvertSelectedRegistrationsToGroup(
      groupType: "Couple" | "Family"
    ) {
      if (selectedRegistrationIds.length < 2) {
        alert("Please select at least 2 registrations.");
        return;
      }
    
      if (groupType === "Couple" && selectedRegistrationIds.length !== 2) {
        alert("Couple token ke liye exactly 2 registrations select karo.");
        return;
      }
    
      const selectedPeople = filteredRegistrations.filter((person) =>
        selectedRegistrationIds.includes(person.id)
      );
    
      const uniqueSlotIds = Array.from(
        new Set(selectedPeople.map((person) => person.slot_id))
      );
    
      if (uniqueSlotIds.length !== 1) {
        alert("Selected registrations ki meeting date same honi chahiye.");
        return;
      }
    
      const confirmed = window.confirm(
        `Convert ${selectedRegistrationIds.length} selected registration(s) to one shared ${groupType} token?\n\nFresh token generate hoga. Baaki kisi aur token ko change nahi kiya jayega.`
      );
    
      if (!confirmed) return;
    
      setIsConvertingGroupToken(true);
    
      const { data, error } = await supabase.rpc(
        "convert_registrations_to_group_token",
        {
          p_registration_ids: selectedRegistrationIds,
          p_updated_by: "Sadhak",
          p_group_type: groupType,
        }
      );
    
      if (error) {
        alert("Group token conversion error: " + error.message);
        setIsConvertingGroupToken(false);
        return;
      }
    
      const result = Array.isArray(data) ? data[0] : null;
    
      setTokenSuccess({
        token: result?.token || "-",
        name: `${groupType} Token - ${selectedRegistrationIds.length} candidates`,
        meetingDate: result?.slot_date || "",
        meetingTime: result?.slot_time || "",
      });
    
      setSelectedRegistrationIds([]);
      setIsConvertingGroupToken(false);
    }
    function openEditRegistration(person: Registration) {
      setEditingRegistration(person);
    
      setEditFormData({
        full_name: person.full_name || "",
        age: person.age ? String(person.age) : "",
        gender: person.gender || "",
        occupation: person.occupation || "",
        marital_status: person.marital_status || "",
        mobile: person.mobile || "",
        whatsapp: person.whatsapp || "",
        address: person.address || "",
        city: person.city || "",
        state: person.state || "",
        country: person.country || "",
        pin_code: person.pin_code || "",
        spouse_name: person.spouse_name || "",
        father_name: person.father_name || "",
        mother_name: person.mother_name || "",
        family_name: person.family_name || "",
        family_relation: person.family_relation || "",
        family_mobile: person.family_mobile || "",
        id_type: person.id_type || "",
        id_number: person.id_number || "",
      });
    }
    
    function handleEditFormChange(
      event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) {
      const { name, value } = event.target;
    
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    async function handleSaveRegistrationEdit() {
      if (!editingRegistration) return;
    
      if (!editFormData.full_name.trim()) {
        alert("Please enter name.");
        return;
      }
    
      if (!editFormData.mobile.trim()) {
        alert("Please enter mobile number.");
        return;
      }
    
      if (!editFormData.id_number.trim()) {
        alert("Please enter ID / Aadhaar number.");
        return;
      }
    
      setIsSavingRegistrationEdit(true);
    
      const { error } = await supabase
        .from("registrations")
        .update({
          full_name: editFormData.full_name.trim(),
          age: editFormData.age ? Number(editFormData.age) : null,
          gender: editFormData.gender || null,
          occupation: editFormData.occupation || null,
          marital_status: editFormData.marital_status || null,
          mobile: editFormData.mobile.trim(),
          whatsapp: editFormData.whatsapp.trim() || null,
          address: editFormData.address.trim() || null,
          city: editFormData.city.trim() || null,
          state: editFormData.state.trim() || null,
          country: editFormData.country.trim() || null,
          pin_code: editFormData.pin_code.trim() || null,
          spouse_name: editFormData.spouse_name.trim() || null,
          father_name: editFormData.father_name.trim() || null,
          mother_name: editFormData.mother_name.trim() || null,
          family_name: editFormData.family_name.trim() || null,
          family_relation: editFormData.family_relation.trim() || null,
          family_mobile: editFormData.family_mobile.trim() || null,
          id_type: editFormData.id_type || null,
          id_number: editFormData.id_number.trim() || null,
        })
        .eq("id", editingRegistration.id);
    
      if (error) {
        alert("Registration update error: " + error.message);
        setIsSavingRegistrationEdit(false);
        return;
      }
    
      setIsSavingRegistrationEdit(false);
      setEditingRegistration(null);
      window.location.reload();
    }
    
    async function handleDeleteRegistration(person: Registration) {
      const confirmed = window.confirm(
        `Delete registration for ${person.full_name || person.token}?\n\nToken: ${
          person.token || "-"
        }\n\nThis action cannot be undone.`
      );
    
      if (!confirmed) return;
    
      const doubleConfirm = window.confirm(
        "Are you sure? This will permanently delete this registration from the dashboard."
      );
    
      if (!doubleConfirm) return;
    
      setIsDeletingRegistrationId(person.id);
    
      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("id", person.id);
    
      if (error) {
        alert("Registration delete error: " + error.message);
        setIsDeletingRegistrationId(null);
        return;
      }
    
      setIsDeletingRegistrationId(null);
      window.location.reload();
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
      "Meeting Date",
"Meeting Time",
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
        csvTextValue(person.mobile),
csvTextValue(person.whatsapp),
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
              {isSadhakAccess ? "Sadhak Dashboard" : "Admin Dashboard"}
              </h1>
              <h2 className="mt-1 text-xl font-bold text-orange-800">
              {isSadhakAccess ? "साधक डैशबोर्ड" : "प्रशासन डैशबोर्ड"}
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

        <section className="mb-8 rounded-3xl bg-white p-5 shadow-sm md:p-6">
  <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div>
      <h3 className="text-2xl font-extrabold">
        Pending Verification Requests
      </h3>
      <h4 className="mt-1 text-xl font-bold text-orange-800">
        लंबित सत्यापन अनुरोध
      </h4>
      <p className="mt-2 text-sm text-stone-600">
        Accept a request to generate token and move it to final registrations.
      </p>
      <p className="text-sm text-stone-600">
        Token केवल Sadhak verification के बाद generate होगा।
      </p>
    </div>

    <div className="rounded-2xl bg-orange-100 px-5 py-3 text-center">
      <p className="text-sm font-bold text-stone-600">Pending</p>
      <p className="text-3xl font-extrabold text-orange-800">
        {pendingRequests.length}
      </p>
    </div>
  </div>

  <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto_auto_auto]">
  <input
    type="text"
    value={requestUpdatedBy}
    onChange={(event) => setRequestUpdatedBy(event.target.value)}
    placeholder="Sadhak name"
    className="rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
  />

  <input
    type="text"
    value={rejectionReason}
    onChange={(event) => setRejectionReason(event.target.value)}
    placeholder="Deferred reason, optional"
    className="rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
  />

  <button
    type="button"
    onClick={handleToggleAllPendingRequests}
    className="rounded-2xl border border-orange-300 px-4 py-3 text-sm font-bold text-orange-800"
  >
    {selectedRequestIds.length === pendingRequests.length &&
    pendingRequests.length > 0
      ? "Unselect All"
      : "Select All"}
    <span className="block text-xs font-normal">सभी select करें</span>
  </button>

  <button
    type="button"
    onClick={() => handleBulkApproveRequests("Couple")}
    disabled={selectedRequestIds.length !== 2 || isBulkApprovingRequests}
    className="rounded-2xl bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
  >
    {isBulkApprovingRequests ? "Generating..." : "Accept as Couple"}
    <span className="block text-xs font-normal">Couple token बनाएं</span>
  </button>

  <button
    type="button"
    onClick={() => handleBulkApproveRequests("Family")}
    disabled={selectedRequestIds.length < 2 || isBulkApprovingRequests}
    className="rounded-2xl bg-purple-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
  >
    {isBulkApprovingRequests ? "Generating..." : "Accept as Family"}
    <span className="block text-xs font-normal">Family token बनाएं</span>
  </button>

  <button
    type="button"
    onClick={handleDeleteSelectedRequests}
    disabled={selectedRequestIds.length === 0 || isDeletingRequests}
    className="rounded-2xl bg-red-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
  >
    {isDeletingRequests
      ? "Deleting..."
      : `Delete Selected (${selectedRequestIds.length})`}
    <span className="block text-xs font-normal">
      चुनी हुई requests delete करें
    </span>
  </button>
</div>

{selectedRequestIds.length > 0 && (
  <div className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">
    Selected pending requests: {selectedRequestIds.length}
    <span className="block font-normal">
  2 selected होने पर Couple token बना सकते हैं। 2 या उससे ज्यादा selected होने पर Family token बना सकते हैं।
</span>
    <span className="block font-normal">
    Same token मिलेगा, लेकिन हर candidate का form अलग print होगा।
    </span>
  </div>
)}

  {pendingRequests.length === 0 ? (
    <div className="rounded-2xl bg-orange-50 p-5 text-center font-semibold text-stone-700">
      No pending requests found.
      <span className="block text-sm font-normal">
        कोई pending verification request नहीं है।
      </span>
    </div>
  ) : (
    <div className="max-h-[650px] space-y-4 overflow-y-auto rounded-3xl border border-orange-100 bg-white p-4 pr-3">
  {pendingRequests.map((request) => (
        <div
          key={request.id}
          className="rounded-3xl border border-orange-100 bg-orange-50 p-5 shadow-sm"
        >
        <div className="grid gap-4 md:grid-cols-[auto_1.6fr_1fr_1fr_auto] md:items-start">
  <div className="pt-1">
    <input
      type="checkbox"
      checked={selectedRequestIds.includes(request.id)}
      onChange={() => handleToggleRequestSelection(request.id)}
      className="h-5 w-5 accent-orange-700"
      aria-label={`Select request for ${request.full_name || "candidate"}`}
    />
  </div>

  <div>
    <p className="text-2xl font-extrabold text-stone-900">
      {request.full_name || "-"}
    </p>
    <p className="mt-1 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-extrabold uppercase text-orange-900">
  Ref: RQ-{request.id.slice(-6).toUpperCase()}
</p>

    <div className="mt-2 flex flex-wrap gap-2">
    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase text-orange-900">
  {request.gender || "-"}
</span>
<span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase text-orange-900">
  Age {request.age || "-"}
</span>
<span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase text-orange-900">
  {request.marital_status || "-"}
</span>
    </div>

    <div className="mt-3 grid gap-2">
    <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold uppercase text-stone-800 shadow-sm">
        Mobile: {request.mobile || "-"}
        {request.whatsapp ? (
          <span className="block text-sm font-semibold text-stone-600">
            WhatsApp: {request.whatsapp}
          </span>
        ) : null}
      </div>

      <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold uppercase text-orange-900 shadow-sm">
        ID Proof: {formatIdType(request.id_type)} - {request.id_number || "-"}
      </div>

      <div className="rounded-2xl bg-white px-4 py-3 text-sm font-bold uppercase text-stone-800 shadow-sm">
        Present Family Representative: {request.family_name || "-"}
        <span className="block text-sm font-semibold text-stone-600">
          Relation: {request.family_relation || "-"}
        </span>
      </div>
    </div>
  </div>

  <div className="space-y-3">
  <div className="rounded-2xl bg-white p-4 uppercase shadow-sm">
  <p className="text-xs font-bold text-stone-500">Requested Meeting</p>

  <p className="font-bold text-orange-800">
    {request.requested_meeting_date
      ? formatDate(request.requested_meeting_date)
      : "-"}
  </p>

  <p className="text-sm font-semibold text-stone-600">
    {request.requested_meeting_time || "-"}
  </p>

  {editingRequestSlotId === request.id ? (
    <div className="mt-3 space-y-2">
      <select
        value={editingRequestNewSlotId}
        onChange={(event) => setEditingRequestNewSlotId(event.target.value)}
        className="w-full rounded-xl border border-orange-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-orange-600"
      >
        <option value="">Select new date</option>
        {slots
          .filter((slot) => slot.slot_date >= todayDate)
          .sort((a, b) => a.slot_date.localeCompare(b.slot_date))
          .map((slot) => (
            <option key={slot.id} value={slot.id}>
              {formatDate(slot.slot_date)} - {slot.slot_time} -{" "}
              {slot.current_count}/{slot.capacity}
            </option>
          ))}
      </select>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleRescheduleRegistrationRequest(request)}
          disabled={isUpdatingRequestSlot || !editingRequestNewSlotId}
          className="flex-1 rounded-xl bg-green-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
        >
          Save
        </button>

        <button
          type="button"
          onClick={() => {
            setEditingRequestSlotId(null);
            setEditingRequestNewSlotId("");
          }}
          className="flex-1 rounded-xl bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700"
        >
          Cancel
        </button>
      </div>
    </div>
  ) : (
    <button
      type="button"
      onClick={() => {
        setEditingRequestSlotId(request.id);
        setEditingRequestNewSlotId(request.requested_slot_id || "");
      }}
      className="mt-3 rounded-xl bg-orange-100 px-3 py-2 text-xs font-bold text-orange-800"
    >
      Change Date
      <span className="block text-[10px] font-normal">
        तारीख बदलें
      </span>
    </button>
  )}
</div>

<div className="rounded-2xl bg-white p-4 uppercase shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
        Location
      </p>
      <p className="mt-1 text-sm font-bold text-stone-800">
        {request.city || "-"}, {request.state || "-"}
      </p>
      <p className="text-sm text-stone-600">
        {request.country || "-"} {request.pin_code ? `- ${request.pin_code}` : ""}
      </p>
    </div>
  </div>

  <div className="space-y-3">
  <div className="rounded-2xl bg-white p-4 uppercase shadow-sm">
  <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
  Family Approval
</p>

<p className="mt-1 text-base font-extrabold text-stone-800">
  Father: {request.father_name || "-"}
</p>

<p className="mt-1 text-base font-extrabold text-stone-800">
  Mother: {request.mother_name || "-"}
</p>

{request.marital_status === "Married" && (
  <p className="mt-1 text-base font-extrabold text-stone-800">
    Husband / Wife: {request.spouse_name || "-"}
  </p>
)}
    </div>

    <div className="rounded-2xl bg-white p-4 uppercase shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-stone-500">
        Quick Address
      </p>
      <p className="mt-1 text-sm font-semibold text-stone-700">
        {request.address || "-"}
      </p>
    </div>
  </div>

  <div className="flex flex-col gap-2">
    <button
      type="button"
      onClick={() => handleApproveRequest(request)}
      disabled={processingRequestId === request.id}
      className="rounded-2xl bg-green-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
    >
      Accept & Generate Token
      <span className="block text-xs font-normal">
        Accept करके token बनाएं
      </span>
    </button>

    <button
      type="button"
      onClick={() => handleRejectRequest(request)}
      disabled={processingRequestId === request.id}
      className="rounded-2xl bg-red-100 px-5 py-3 text-sm font-bold text-red-700 disabled:opacity-60"
    >
      Deferred
      <span className="block text-xs font-normal">
        अनुरोध Deferred करें
      </span>
    </button>

    <button
  type="button"
  onClick={() => openEditRequest(request)}
  className="rounded-2xl bg-blue-100 px-5 py-3 text-sm font-bold text-blue-700"
>
  Edit Details
  <span className="block text-xs font-normal">
    विवरण बदलें
  </span>
</button>

    {request.aadhaar_file_url && (
      <button
        type="button"
        onClick={() =>
          setSelectedAadhaar({
            url: request.aadhaar_file_url || "",
            name: request.aadhaar_file_name || request.full_name,
          })
        }
        className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-orange-800"
      >
        View ID
        <span className="block text-xs font-normal">ID देखें</span>
      </button>
    )}
  </div>
</div>

<div className="mt-4 rounded-2xl border border-orange-200 bg-white p-4">
  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-lg font-extrabold text-stone-900">
        Final Verification Questions
      </p>
      <p className="text-sm font-semibold text-orange-800">
        अंतिम सत्यापन प्रश्न
      </p>
    </div>

    <button
      type="button"
      onClick={() => savePendingQuestionAnswers(request)}
      disabled={savingQuestionRequestId === request.id}
      className="rounded-2xl bg-green-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
    >
      {savingQuestionRequestId === request.id ? "Saving..." : "Save Answers"}
      <span className="block text-xs font-normal">
        उत्तर सेव करें
      </span>
    </button>
  </div>

  <div className="grid gap-4 md:grid-cols-3">
    <div>
      <label className="mb-2 block text-sm font-bold text-stone-700">
        For how many days you are here in Vrindavan?
        <span className="block text-xs font-semibold text-orange-800">
          आप वृंदावन में कितने दिनों के लिए हैं?
        </span>
      </label>

      <input
        type="text"
        value={getPendingQuestionAnswers(request).vrindavan_stay_days}
        onChange={(event) =>
          handlePendingQuestionChange(
            request,
            "vrindavan_stay_days",
            event.target.value
          )
        }
        placeholder="Example: 3 days"
        className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-bold text-stone-700">
        Video proof attached
        <span className="block text-xs font-semibold text-orange-800">
          वीडियो प्रमाण संलग्न
        </span>
      </label>

      <select
        value={getPendingQuestionAnswers(request).video_proof_attached}
        onChange={(event) =>
          handlePendingQuestionChange(
            request,
            "video_proof_attached",
            event.target.value
          )
        }
        className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 outline-none focus:border-orange-600"
      >
       <option value="">Select video proof</option>
<option value="Father">Father / पिता</option>
<option value="Mother">Mother / माता</option>
<option value="Both">Both / दोनों</option>
<option value="Husband">Husband / पति</option>
<option value="Wife">Wife / पत्नी</option>
<option value="Not Reqd.">Not Reqd. / आवश्यक नहीं</option>
<option value="Others">Others / अन्य</option>
      </select>

      {getPendingQuestionAnswers(request).video_proof_attached ===
        "Others" && (
        <input
          type="text"
          value={getPendingQuestionAnswers(request).video_proof_other}
          onChange={(event) =>
            handlePendingQuestionChange(
              request,
              "video_proof_other",
              event.target.value
            )
          }
          placeholder="Enter other video proof details"
          className="mt-3 w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
        />
      )}
    </div>

    <div>
      <label className="mb-2 block text-sm font-bold text-stone-700">
        Referred to
        <span className="block text-xs font-semibold text-orange-800">
          किसके पास भेजा गया
        </span>
      </label>

      <select
        value={getPendingQuestionAnswers(request).referred_to}
        onChange={(event) =>
          handlePendingQuestionChange(
            request,
            "referred_to",
            event.target.value
          )
        }
        className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 outline-none focus:border-orange-600"
      >
        <option value="">Select referred to</option>
        <option value="ALB">ALB</option>
        <option value="SS">SS</option>
        <option value="SSB">SSB</option>
        <option value="PS">PS</option>
        <option value="GSB">GSB</option>
        <option value="NNB">NNB</option>
        <option value="MMB">MMB</option>
      </select>
    </div>
  </div>
</div>

<div className="mt-4 rounded-2xl bg-white p-4 text-sm uppercase text-stone-700">
            <p className="font-bold">Address:</p>
            <p>{request.address || "-"}</p>
          </div>
        </div>
      ))}
    </div>
  )}
</section>

{!isSadhakAccess && (
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
  title="Final Meeting Attended"
  titleHi="फाइनल मीटिंग उपस्थित"
  value={reportCounts.finalMeetingAttended}
  active={reportFilter === "final_meeting_attended"}
  onClick={() => setReportFilter("final_meeting_attended")}
/>
              <ReportCountCard
                title="Deferred"
titleHi="स्थगित"
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
  title="Rescheduled Diksha"
  titleHi="बदली हुई दीक्षा"
  value={reportCounts.rescheduledDiksha}
  active={reportFilter === "rescheduled_diksha"}
  onClick={() => setReportFilter("rescheduled_diksha")}
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
        )}
        <section className="mb-8 rounded-3xl bg-white p-5 shadow-sm md:p-6">
  <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div>
      <h3 className="text-2xl font-extrabold">
        Final Meeting Attendance
      </h3>
      <h4 className="mt-1 text-xl font-bold text-orange-800">
        फाइनल मीटिंग उपस्थिति
      </h4>
      <p className="mt-2 text-sm text-stone-600">
        Select a meeting date and mark candidates present as they arrive.
      </p>
      <p className="text-sm text-stone-600">
        मीटिंग तारीख चुनें और आने वाले candidates को Present mark करें।
      </p>
    </div>

    <div className="rounded-2xl bg-green-100 px-5 py-3 text-center">
      <p className="text-sm font-bold text-green-800">Present</p>
      <p className="text-3xl font-extrabold text-green-800">
        {
          finalMeetingAttendanceList.filter(
            (person) => person.final_meeting_attendance === "Present"
          ).length
        }
        /{finalMeetingAttendanceList.length}
      </p>
    </div>
  </div>

  <div className="mb-5 grid gap-3 md:grid-cols-[220px_1fr_1fr_auto_auto]">
    <select
      value={attendanceDate}
      onChange={(event) => {
        setAttendanceDate(event.target.value);
        setSelectedAttendanceIds([]);
        setAttendanceSearch("");
      }}
      className="rounded-2xl border border-orange-200 bg-white px-4 py-3 font-bold outline-none focus:border-orange-600"
    >
      {slots.map((slot) => (
        <option key={slot.id} value={slot.slot_date}>
          {formatDate(slot.slot_date)}
        </option>
      ))}
    </select>

    <input
      type="text"
      value={attendanceUpdatedBy}
      onChange={(event) => setAttendanceUpdatedBy(event.target.value)}
      placeholder="Sadhak name"
      className="rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
    />
    <input
  type="text"
  value={attendanceSearch}
  onChange={(event) => setAttendanceSearch(event.target.value)}
  placeholder="Search name, token, mobile, city"
  className="rounded-2xl border border-orange-200 px-4 py-3 font-bold outline-none focus:border-orange-600"
/>

    <button
      type="button"
      onClick={handleToggleAllAttendance}
      className="rounded-2xl border border-orange-300 px-4 py-3 text-sm font-bold text-orange-800"
    >
      Select All Pending
      <span className="block text-xs font-normal">
        pending सभी चुनें
      </span>
    </button>

    <button
      type="button"
      onClick={handleMarkSelectedAttendancePresent}
      disabled={selectedAttendanceIds.length === 0 || isMarkingAttendance}
      className="rounded-2xl bg-green-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
    >
      {isMarkingAttendance
        ? "Marking..."
        : `Mark Present (${selectedAttendanceIds.length})`}
      <span className="block text-xs font-normal">
        Present mark करें
      </span>
    </button>
  </div>

  {finalMeetingAttendanceList.length === 0 ? (
    <div className="rounded-2xl bg-orange-50 p-5 text-center font-semibold text-stone-700">
      No candidates found for this meeting date.
      <span className="block text-sm font-normal">
        इस तारीख के लिए कोई candidate नहीं मिला।
      </span>
    </div>
  ) : (
    <div className="max-h-[520px] overflow-y-auto rounded-3xl border border-orange-100 bg-white">
      <div className="grid grid-cols-[50px_1.4fr_1fr_1fr_1fr_auto] bg-orange-100 px-4 py-3 text-sm font-extrabold text-orange-900">
        <p></p>
        <p>Name</p>
        <p>Token</p>
        <p>Mobile</p>
        <p>Attendance</p>
        <p>Action</p>
      </div>

      {finalMeetingAttendanceList.map((person) => {
        const isPresent = person.final_meeting_attendance === "Present";

        return (
          <div
            key={person.id}
            className={`grid grid-cols-[50px_1.4fr_1fr_1fr_1fr_auto] items-center border-t border-orange-100 px-4 py-3 text-sm ${
              isPresent ? "bg-green-50" : "bg-white"
            }`}
          >
            <input
              type="checkbox"
              checked={
                isPresent || selectedAttendanceIds.includes(person.id)
              }
              disabled={isPresent}
              onChange={() => handleToggleAttendanceSelection(person.id)}
              className="h-5 w-5 accent-green-700 disabled:opacity-50"
            />

            <div>
              <p className="font-extrabold text-stone-900">
                {person.full_name || "-"}
              </p>
              <p className="text-xs font-semibold text-stone-500">
                {person.gender || "-"} · Age {person.age || "-"} ·{" "}
                {person.marital_status || "-"}
              </p>
            </div>

            <p className="font-extrabold text-orange-900">
              {person.token || "-"}
            </p>

            <p className="font-bold text-stone-700">
              {showFullMobile ? person.mobile : maskMobile(person.mobile)}
            </p>

            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                isPresent
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {isPresent ? "Present" : "Not Marked"}
            </span>

            {isPresent ? (
  <button
    type="button"
    disabled={isMarkingAttendance}
    onClick={() => handleUndoSingleAttendancePresent(person)}
    className="rounded-2xl bg-red-100 px-4 py-2 text-xs font-bold text-red-700 disabled:opacity-50"
  >
    Undo
    <span className="block text-[10px] font-normal">
      वापस करें
    </span>
  </button>
) : (
  <button
    type="button"
    disabled={isMarkingAttendance}
    onClick={() => handleMarkSingleAttendancePresent(person)}
    className="rounded-2xl bg-green-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
  >
    Mark Present
    <span className="block text-[10px] font-normal">
      उपस्थित
    </span>
  </button>
)}
          </div>
        );
      })}
    </div>
  )}
</section>
{!isSadhakAccess && (

        <section className="mb-8 rounded-3xl bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-2xl font-extrabold">
              Upcoming Meeting Dates
              </h3>
              <h4 className="mt-1 text-xl font-bold text-orange-800">
              आने वाली मीटिंग तारीखें
              </h4>
              <p className="mt-2 text-sm text-stone-600">
              Showing upcoming slots for the next 3 months.
              </p>
              <p className="text-sm text-stone-600">
              अगले 3 महीनों की मीटिंग तारीखें दिखाई जा रही हैं।
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAllSlots((prev) => !prev)}
              className="rounded-2xl border border-orange-300 px-5 py-3 font-bold text-orange-800"
            >
             {showAllSlots ? "Show Less" : "View Next 3 Months"}
              <span className="block text-sm font-normal">
              {showAllSlots ? "कम दिखाएं" : "अगले 3 महीने देखें"}
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
  <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white">
    <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_0.7fr_1fr] bg-orange-100 px-4 py-3 text-sm font-extrabold text-orange-900">
    <p>Date</p>
<p>Time</p>
<p>Filled</p>
<p>Left</p>
<p>Status</p>
<p>Capacity</p>
    </div>

    <div className="max-h-[420px] overflow-y-auto">
      {upcomingSlots.map((slot) => {
        const seatsLeft = slot.capacity - slot.current_count;
        const isSelected = slotDate === slot.slot_date;

        return (
          <div
          key={slot.id}
          className={`grid w-full grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_0.7fr_1fr] items-center border-t border-orange-100 px-4 py-3 text-left text-sm transition hover:bg-orange-50 ${
              isSelected ? "bg-orange-50" : "bg-white"
            }`}
          >
           <button
  type="button"
  onClick={() => setSlotDate(slot.slot_date)}
  className="text-left"
>
  <p className="font-extrabold text-stone-900">
    {formatDate(slot.slot_date)}
  </p>
              {isSelected && (
                <p className="text-xs font-bold text-orange-800">
                  Selected / चुना हुआ
                </p>
              )}
            </button>

            <p className="font-bold text-stone-700">{slot.slot_time}</p>

            <p className="font-bold text-stone-700">
              {slot.current_count}/{slot.capacity}
            </p>

            <p className="font-bold text-orange-800">{seatsLeft}</p>

            <span
  className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
    slot.current_count > slot.capacity
      ? "bg-red-100 text-red-700"
      : slot.current_count >= slot.capacity
      ? "bg-orange-100 text-orange-800"
      : "bg-green-100 text-green-700"
  }`}
>
  {slot.current_count > slot.capacity
    ? "Overbooked"
    : slot.current_count >= slot.capacity
    ? "Full"
    : "Open"}
</span>
            <div className="flex items-center gap-2">
  {editingSlotId === slot.id ? (
    <>
      <input
        type="number"
        min={0}
        value={editingSlotCapacity}
        onChange={(event) => setEditingSlotCapacity(event.target.value)}
        className="w-20 rounded-xl border border-orange-200 px-3 py-2 text-sm font-bold outline-none focus:border-orange-600"
      />

      <button
        type="button"
        onClick={() => handleUpdateSlotCapacity(slot)}
        disabled={isUpdatingSlotCapacity}
        className="rounded-xl bg-green-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
      >
        Save
      </button>

      <button
        type="button"
        onClick={() => {
          setEditingSlotId(null);
          setEditingSlotCapacity("");
        }}
        className="rounded-xl bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700"
      >
        Cancel
      </button>
    </>
  ) : (
    <>
      <span className="font-extrabold text-stone-800">
        {slot.capacity}
      </span>

      <button
        type="button"
        onClick={() => {
          setEditingSlotId(slot.id);
          setEditingSlotCapacity(String(slot.capacity));
        }}
        className="rounded-xl bg-orange-100 px-3 py-2 text-xs font-bold text-orange-800"
      >
        Edit
      </button>
    </>
  )}
</div>
            </div>
        );
      })}
    </div>
  </div>
)}
        </section>
)}
{!isSadhakAccess && (
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
  onClick={handleToggleAllFilteredRegistrations}
  className="rounded-2xl border border-orange-300 px-5 py-3 font-bold text-orange-800"
>
  {selectedRegistrationIds.length > 0 ? "Unselect All" : "Select All"}
  <span className="block text-sm font-normal">
    registrations select करें
  </span>
</button>

<button
  type="button"
  onClick={() => handleConvertSelectedRegistrationsToGroup("Couple")}
  disabled={selectedRegistrationIds.length !== 2 || isConvertingGroupToken}
  className="rounded-2xl bg-blue-700 px-5 py-3 font-bold text-white disabled:opacity-50"
>
  Convert as Couple
  <span className="block text-sm font-normal">Couple token बनाएं</span>
</button>

<button
  type="button"
  onClick={() => handleConvertSelectedRegistrationsToGroup("Family")}
  disabled={selectedRegistrationIds.length < 2 || isConvertingGroupToken}
  className="rounded-2xl bg-purple-700 px-5 py-3 font-bold text-white disabled:opacity-50"
>
  Convert as Family
  <span className="block text-sm font-normal">Family token बनाएं</span>
</button>
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

              <div className="flex flex-col gap-3 md:flex-row">
              <button
  type="button"
  onClick={handleBulkScheduleNextDayDiksha}
  disabled={isBulkScheduling}
  className="rounded-2xl bg-purple-700 px-5 py-3 font-bold text-white disabled:opacity-60"
>
  {isBulkScheduling ? "Scheduling..." : "Auto Next-Day Diksha"}
  <span className="block text-sm font-normal">
    अगले दिन की दीक्षा शेड्यूल करें
  </span>
</button>
  <button
    type="button"
    onClick={handlePrintDevoteeForms}
    className="rounded-2xl bg-green-700 px-5 py-3 font-bold text-white"
  >
    Print Devotee Forms
    <span className="block text-sm font-normal">
      सभी फॉर्म प्रिंट करें
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
                label="Final Meeting List"
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
  active={reportFilter === "final_meeting_attended"}
  label="Final Meeting Attended"
  onClick={() => setReportFilter("final_meeting_attended")}
/>

              <ReportButton
                active={reportFilter === "rejected"}
                label="Deferred"
                onClick={() => setReportFilter("rejected")}
              />

              <ReportButton
                active={reportFilter === "scheduled_diksha"}
                label="Diksha List"
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
              <ReportButton
  active={reportFilter === "rescheduled_diksha"}
  label="Rescheduled Diksha"
  onClick={() => setReportFilter("rescheduled_diksha")}
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
                <TableHead>Select</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Meeting Date</TableHead>
                  <TableHead>Meeting Time</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Aadhaar</TableHead>
                  <TableHead>Status</TableHead>
                </tr>

                <tr className="text-sm text-stone-600">
                <TableHead>चुनें</TableHead>
                  <TableHead>टोकन</TableHead>
                  <TableHead>नाम</TableHead>
                  <TableHead>मोबाइल</TableHead>
                  <TableHead>शहर</TableHead>
                  <TableHead>मीटिंग दिनांक</TableHead>
                  <TableHead>मीटिंग समय</TableHead>
                  <TableHead>कार्यवाही</TableHead>
                  <TableHead>आधार</TableHead>
                  <TableHead>स्थिति</TableHead>
                </tr>
              </thead>

              <tbody>
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
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
                      <TableCell>
  <input
    type="checkbox"
    checked={selectedRegistrationIds.includes(person.id)}
    onChange={() => handleToggleRegistrationSelection(person.id)}
    className="h-5 w-5 accent-orange-700"
  />
</TableCell>
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
                                candidateName: person.full_name || person.token,
                                workflow: isDikshaCandidate(person) ? "diksha" : "final_meeting",
                                actionType: "status",
                                title: "Manage Candidate",
                                newStatus: person.candidate_status || person.status,
                              });
                              setFinalMeetingSlotId(person.slots?.slot_date ? person.slot_id || "" : "");
                              setFinalMeetingMonth("");
                              setDikshaDate(person.diksha_date || "");
                              setDikshaTime(person.diksha_time || "3:30 PM");
                            }}
                            className="rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-orange-800"
                          >
                            {isDikshaCandidate(person) ? "Manage Diksha" : "Manage Meeting"}
                            <span className="block text-[10px] font-normal">
  {isDikshaCandidate(person) ? "दीक्षा अपडेट करें" : "मीटिंग अपडेट करें"}
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
                          <button
  type="button"
  onClick={() => openEditRegistration(person)}
  className="rounded-full bg-blue-100 px-4 py-2 text-xs font-bold text-blue-700"
>
  Edit
  <span className="block text-[10px] font-normal">
    विवरण बदलें
  </span>
</button>

<button
  type="button"
  onClick={() => handleDeleteRegistration(person)}
  disabled={isDeletingRegistrationId === person.id}
  className="rounded-full bg-red-100 px-4 py-2 text-xs font-bold text-red-700 disabled:opacity-50"
>
  {isDeletingRegistrationId === person.id ? "Deleting..." : "Delete"}
  <span className="block text-[10px] font-normal">
    हटाएं
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
  <>
    <p>
    Diksha Date: {formatDate(person.diksha_date)}
    </p>

    {person.slots?.slot_date &&
    person.diksha_date !== addDaysToDateString(person.slots.slot_date, 1) ? (
      <p className="font-bold text-purple-700">Rescheduled</p>
    ) : (
      <p className="font-bold text-green-700">Default Next-Day</p>
    )}
  </>
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
        )}
      </div>
      {!isSadhakAccess && (
      <section
  className={`print-area print-list-area ${
    printMode === "list" ? "" : "print-hidden"
  } hidden`}
>
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
<PrintHead>Number</PrintHead>
<PrintHead>City</PrintHead>
<PrintHead>Family Approval</PrintHead>
            </tr>
          </thead>

          <tbody>
  {groupedPrintRegistrations.map((group) => (
    <Fragment key={group.title}>
      <tr key={`${group.title}-heading`}>
        <td
          colSpan={8}
          className="border border-black bg-stone-100 px-2 py-2 text-center text-sm font-extrabold"
        >
          {group.title} / {group.titleHi}
        </td>
      </tr>

      {group.records.map((person, index) => {
        const familyApproval =
          person.marital_status === "Married" && person.gender === "Male"
            ? `Father: ${person.father_name || "-"}`
            : person.marital_status === "Married"
            ? `Husband: ${person.spouse_name || "-"}`
            : `Father: ${person.father_name || "-"} / Mother: ${
                person.mother_name || "-"
              }`;

        return (
          <tr key={person.id}>
            <PrintCell>{index + 1}</PrintCell>
            <PrintCell>
              <strong>{person.token || "-"}</strong>
            </PrintCell>
            <PrintCell>
              <strong>{person.full_name || "-"}</strong>
            </PrintCell>
            <PrintCell>{person.age || "-"}</PrintCell>
            <PrintCell>{person.gender || "-"}</PrintCell>
            <PrintCell>{person.mobile || "-"}</PrintCell>
            <PrintCell>{person.city || "-"}</PrintCell>
            <PrintCell>{familyApproval}</PrintCell>
          </tr>
        );
      })}
    </Fragment>
  ))}
</tbody>
        </table>

       

        <div className="mt-10 grid grid-cols-2 gap-10 text-sm">
          <div>
            <p className="border-t border-black pt-2">Sadhak Signature</p>
          </div>
          <div>
            <p className="border-t border-black pt-2">
              Verification Signature
            </p>
          </div>
        </div>
      </section>
      )}
      {editingRegistration && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold">
            Edit Registration
          </h3>
          <p className="mt-1 text-sm font-semibold text-stone-600">
            Token: {editingRegistration.token || "-"}
          </p>
          <p className="text-sm text-stone-600">
            Candidate details dashboard se update kar sakte ho.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditingRegistration(null)}
          className="rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-orange-800"
        >
          Close
          <span className="block text-[10px] font-normal">
            बंद करें
          </span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <EditInput
          label="Full Name"
          name="full_name"
          value={editFormData.full_name}
          onChange={handleEditFormChange}
          required
        />

        <EditInput
          label="Age"
          name="age"
          value={editFormData.age}
          onChange={handleEditFormChange}
          type="number"
        />

        <EditSelect
          label="Gender"
          name="gender"
          value={editFormData.gender}
          onChange={handleEditFormChange}
          options={[
            ["", "Select gender"],
            ["Male", "Male"],
            ["Female", "Female"],
            ["Other", "Other"],
          ]}
        />

        <EditSelect
          label="Occupation"
          name="occupation"
          value={editFormData.occupation}
          onChange={handleEditFormChange}
          options={[
            ["", "Select occupation"],
            ["Student", "Student"],
            ["Housewife", "Housewife"],
            ["Service", "Service"],
            ["Business", "Business"],
            ["Farmer", "Farmer"],
            ["Retired", "Retired"],
            ["Virakt", "Virakt"],
            ["Self Employed", "Self Employed"],
            ["Unemployed", "Unemployed"],
            ["Other", "Other"],
          ]}
        />

        <EditSelect
          label="Marital Status"
          name="marital_status"
          value={editFormData.marital_status}
          onChange={handleEditFormChange}
          options={[
            ["", "Select marital status"],
            ["Single", "Single"],
            ["Married", "Married"],
            ["Widowed", "Widowed"],
            ["Divorced", "Divorced"],
          ]}
        />

        <EditInput
          label="Mobile"
          name="mobile"
          value={editFormData.mobile}
          onChange={handleEditFormChange}
          required
        />

        <EditInput
          label="WhatsApp"
          name="whatsapp"
          value={editFormData.whatsapp}
          onChange={handleEditFormChange}
        />

        <EditInput
          label="City"
          name="city"
          value={editFormData.city}
          onChange={handleEditFormChange}
        />

        <EditInput
          label="State"
          name="state"
          value={editFormData.state}
          onChange={handleEditFormChange}
        />

        <EditInput
          label="Country"
          name="country"
          value={editFormData.country}
          onChange={handleEditFormChange}
        />

        <EditInput
          label="PIN Code"
          name="pin_code"
          value={editFormData.pin_code}
          onChange={handleEditFormChange}
        />

        <EditSelect
          label="ID Type"
          name="id_type"
          value={editFormData.id_type}
          onChange={handleEditFormChange}
          options={[
            ["", "Select ID type"],
            ["aadhaar", "Aadhaar Card"],
            ["passport", "Passport"],
            ["other", "Other Government ID"],
          ]}
        />

        <EditInput
          label="ID / Aadhaar Number"
          name="id_number"
          value={editFormData.id_number}
          onChange={handleEditFormChange}
          required
        />

        <EditInput
          label="Husband / Wife Name"
          name="spouse_name"
          value={editFormData.spouse_name}
          onChange={handleEditFormChange}
        />

        <EditInput
          label="Father Name"
          name="father_name"
          value={editFormData.father_name}
          onChange={handleEditFormChange}
        />

        <EditInput
          label="Mother Name"
          name="mother_name"
          value={editFormData.mother_name}
          onChange={handleEditFormChange}
        />

        <EditInput
          label="Family Representative Name"
          name="family_name"
          value={editFormData.family_name}
          onChange={handleEditFormChange}
        />

        <EditSelect
          label="Family Relation"
          name="family_relation"
          value={editFormData.family_relation}
          onChange={handleEditFormChange}
          options={[
            ["", "Select relation"],
            ["Father", "Father"],
            ["Mother", "Mother"],
            ["Husband", "Husband"],
            ["Wife", "Wife"],
            ["Son", "Son"],
            ["Daughter", "Daughter"],
            ["Brother", "Brother"],
            ["Sister", "Sister"],
            ["Other", "Other"],
          ]}
        />

        <EditInput
          label="Family Mobile"
          name="family_mobile"
          value={editFormData.family_mobile}
          onChange={handleEditFormChange}
        />

        <div className="md:col-span-3">
          <EditTextarea
            label="Address"
            name="address"
            value={editFormData.address}
            onChange={handleEditFormChange}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-end">
        <button
          type="button"
          onClick={() => setEditingRegistration(null)}
          className="rounded-2xl border border-orange-300 px-6 py-3 font-bold text-orange-800"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSaveRegistrationEdit}
          disabled={isSavingRegistrationEdit}
          className="rounded-2xl bg-green-700 px-6 py-3 font-bold text-white disabled:opacity-60"
        >
          {isSavingRegistrationEdit ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  </div>
)}
{editingRequest && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-extrabold">
            Edit Pending Request
          </h3>

          <p className="mt-1 text-sm font-semibold text-stone-600">
            Ref: RQ-{editingRequest.id.slice(-6).toUpperCase()}
          </p>

          <p className="text-sm text-stone-600">
            Token generate hone se pehle candidate details yaha se update kar sakte ho.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditingRequest(null)}
          className="rounded-full bg-orange-100 px-4 py-2 text-xs font-bold text-orange-800"
        >
          Close
          <span className="block text-[10px] font-normal">
            बंद करें
          </span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <EditInput
          label="Full Name / पूरा नाम"
          name="full_name"
          value={editRequestFormData.full_name}
          onChange={handleEditRequestFormChange}
          required
        />

        <EditInput
          label="Age / आयु"
          name="age"
          value={editRequestFormData.age}
          onChange={handleEditRequestFormChange}
          type="number"
        />

        <EditSelect
          label="Gender / लिंग"
          name="gender"
          value={editRequestFormData.gender}
          onChange={handleEditRequestFormChange}
          options={[
            ["", "Select gender / लिंग चुनें"],
            ["Male", "Male / पुरुष"],
            ["Female", "Female / महिला"],
            ["Other", "Other / अन्य"],
          ]}
        />

        <EditSelect
          label="Occupation / व्यवसाय"
          name="occupation"
          value={editRequestFormData.occupation}
          onChange={handleEditRequestFormChange}
          options={[
            ["", "Select occupation / व्यवसाय चुनें"],
            ["Student", "Student / विद्यार्थी"],
            ["Housewife", "Housewife / गृहिणी"],
            ["Service", "Service / नौकरी"],
            ["Business", "Business / व्यापार"],
            ["Farmer", "Farmer / किसान"],
            ["Retired", "Retired / सेवानिवृत्त"],
            ["Virakt", "Virakt / विरक्त"],
            ["Self Employed", "Self Employed / स्वरोजगार"],
            ["Unemployed", "Unemployed / बेरोजगार"],
            ["Other", "Other / अन्य"],
          ]}
        />

        <EditSelect
          label="Marital Status / वैवाहिक स्थिति"
          name="marital_status"
          value={editRequestFormData.marital_status}
          onChange={handleEditRequestFormChange}
          options={[
            ["", "Select marital status / वैवाहिक स्थिति चुनें"],
            ["Single", "Single / अविवाहित"],
            ["Married", "Married / विवाहित"],
            ["Widowed", "Widowed / विधवा / विधुर"],
            ["Divorced", "Divorced / तलाकशुदा"],
          ]}
        />

        <EditInput
          label="Mobile / मोबाइल"
          name="mobile"
          value={editRequestFormData.mobile}
          onChange={handleEditRequestFormChange}
          required
        />

        <EditInput
          label="WhatsApp / व्हाट्सऐप"
          name="whatsapp"
          value={editRequestFormData.whatsapp}
          onChange={handleEditRequestFormChange}
        />

        <EditInput
          label="City / शहर"
          name="city"
          value={editRequestFormData.city}
          onChange={handleEditRequestFormChange}
        />

        <EditInput
          label="State / राज्य"
          name="state"
          value={editRequestFormData.state}
          onChange={handleEditRequestFormChange}
        />

        <EditInput
          label="Country / देश"
          name="country"
          value={editRequestFormData.country}
          onChange={handleEditRequestFormChange}
        />

        <EditInput
          label="PIN Code / पिन कोड"
          name="pin_code"
          value={editRequestFormData.pin_code}
          onChange={handleEditRequestFormChange}
        />

        <EditSelect
          label="ID Type / पहचान प्रमाण"
          name="id_type"
          value={editRequestFormData.id_type}
          onChange={handleEditRequestFormChange}
          options={[
            ["", "Select ID type / पहचान प्रमाण चुनें"],
            ["aadhaar", "Aadhaar Card / आधार कार्ड"],
            ["passport", "Passport / पासपोर्ट"],
            ["other", "Other Government ID / अन्य सरकारी पहचान"],
          ]}
        />

        <EditInput
          label="ID / Aadhaar Number / पहचान नंबर"
          name="id_number"
          value={editRequestFormData.id_number}
          onChange={handleEditRequestFormChange}
          required
        />

        <EditInput
          label="Husband / Wife Name / पति या पत्नी का नाम"
          name="spouse_name"
          value={editRequestFormData.spouse_name}
          onChange={handleEditRequestFormChange}
        />

        <EditInput
          label="Father Name / पिता का नाम"
          name="father_name"
          value={editRequestFormData.father_name}
          onChange={handleEditRequestFormChange}
        />

        <EditInput
          label="Mother Name / माता का नाम"
          name="mother_name"
          value={editRequestFormData.mother_name}
          onChange={handleEditRequestFormChange}
        />

        <EditInput
          label="Family Representative Name / पारिवारिक प्रतिनिधि का नाम"
          name="family_name"
          value={editRequestFormData.family_name}
          onChange={handleEditRequestFormChange}
        />

        <EditSelect
          label="Family Relation / संबंध"
          name="family_relation"
          value={editRequestFormData.family_relation}
          onChange={handleEditRequestFormChange}
          options={[
            ["", "Select relation / संबंध चुनें"],
            ["Father", "Father / पिता"],
            ["Mother", "Mother / माता"],
            ["Husband", "Husband / पति"],
            ["Wife", "Wife / पत्नी"],
            ["Son", "Son / पुत्र"],
            ["Daughter", "Daughter / पुत्री"],
            ["Brother", "Brother / भाई"],
            ["Sister", "Sister / बहन"],
            ["Other", "Other / अन्य"],
          ]}
        />

        <EditInput
          label="Family Mobile / पारिवारिक मोबाइल"
          name="family_mobile"
          value={editRequestFormData.family_mobile}
          onChange={handleEditRequestFormChange}
        />

        <div className="md:col-span-3">
          <EditTextarea
            label="Address / पता"
            name="address"
            value={editRequestFormData.address}
            onChange={handleEditRequestFormChange}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-end">
        <button
          type="button"
          onClick={() => setEditingRequest(null)}
          className="rounded-2xl border border-orange-300 px-6 py-3 font-bold text-orange-800"
        >
          Cancel
          <span className="block text-xs font-normal">रद्द करें</span>
        </button>

        <button
          type="button"
          onClick={handleSaveRequestEdit}
          disabled={isSavingRequestEdit}
          className="rounded-2xl bg-green-700 px-6 py-3 font-bold text-white disabled:opacity-60"
        >
          {isSavingRequestEdit ? "Saving..." : "Save Changes"}
          <span className="block text-xs font-normal">
            बदलाव सेव करें
          </span>
        </button>
      </div>
    </div>
  </div>
)}

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
      {!isSadhakAccess && (
      <section
        className={`print-area devotee-forms-area ${
          printMode === "forms" ? "" : "print-hidden"
        } hidden`}
      >
        {filteredRegistrations.map((person, index) => {
          const mantraDate = person.diksha_date
            ? formatDate(person.diksha_date)
            : "____ / ____ / ______";

            const meetingDate = person.slots?.slot_date
            ? formatDate(person.slots.slot_date)
            : person.final_meeting_date
            ? formatDate(person.final_meeting_date)
            : "-";

          const guardianLabel =
            person.marital_status === "Married"
              ? "Husband / Wife Name"
              : "Father / Mother Name";

          const guardianValue =
            person.marital_status === "Married"
              ? person.spouse_name || "-"
              : `Father: ${person.father_name || "-"} / Mother: ${
                  person.mother_name || "-"
                }`;

          return (
            <div key={person.id} className="devotee-form-page">
              <div className="devotee-form-top">
                <div>
                  <p>
                    <strong>Date Of Mantra Diksha :</strong> {mantraDate}
                  </p>
                  <p>
                    <strong>Card No :</strong> {person.token || "-"}
                  </p>
                </div>

                <div>
                  <p>
                    <strong>Form No :</strong> {index + 1}
                  </p>
                </div>
              </div>

              <div className="devotee-form-title">
                <h1>DEVOTEE INFORMATION & DECLARATION FORM</h1>
                <h2>(शिष्य परिचय एवं घोषणा पत्र)</h2>
              </div>

              <div className="devotee-form-main">
                <div className="devotee-form-details">
                  <DevoteeLine label="Name" value={person.full_name || "-"} />
                  <DevoteeLine label={guardianLabel} value={guardianValue} />
                  <DevoteeLine label="Gender" value={person.gender || "-"} />
                  <DevoteeLine
                    label="Age"
                    value={person.age ? String(person.age) : "-"}
                  />
                  <DevoteeLine
                    label="Marital Status"
                    value={person.marital_status || "-"}
                  />
                  <DevoteeLine label="Address" value={person.address || "-"} />
                  <DevoteeLine label="City" value={person.city || "-"} />
                  <DevoteeLine label="State" value={person.state || "-"} />
                  <DevoteeLine label="Country" value={person.country || "-"} />
                  <DevoteeLine
  label="PIN Code"
  value={person.pin_code || "-"}
/>
                  <DevoteeLine
                    label="Occupation"
                    value={person.occupation || "-"}
                  />
                  <DevoteeLine label="Mobile No" value={person.mobile || "-"} />
                  <DevoteeLine
                    label="WhatsApp No"
                    value={person.whatsapp || "-"}
                  />
                  <DevoteeLine
                    label="ID / Aadhaar No"
                    value={person.id_number || "-"}
                  />
                </div>

                <div className="devotee-photo-box">
                  <p>Applicant Photo</p>
                </div>
              </div>

              <div className="declaration-section">
                <h3>DECLARATION</h3>

                <p>
  1.  मैं अक्सर श्रीधाम वृन्दावन में दर्शन एवं आध्यात्मिक क्रिया-कलापों में भाग लेने के लिए आता रहता / आती रहती हूँ। मैं पूर्ण रुपेण आध्यात्मिक भावनाओं से ओतप्रोत हूँ मनुष्य जीवन का परम लक्ष्य भगवत प्राप्ति करना चाहता / चाहती हूँ, इसलिए मैं स्वयं की प्रबल इच्छा व प्राथना और पारिवारिक जनों की पूर्ण सहमति से ही दीक्षा ले रहा / रही हूँ।
</p>

                <p>
                आजकल का वातावरण बहुत ही दूषित है और समाज / शहर के लोग तरह-तरह के आरोप-प्रत्यारोप लगाने से नही चूकते हैं, चूंकि दीक्षा लेना मेरा स्वयं का निर्णय है इसलिए भविष्य में यदि मेरे परिवारिकजन या समाज / शहर का कोई भी व्यक्ति मेरी दीक्षा या वृंदावन वास या मेरे किसी भी अन्य भागवतिक निर्णय में किसी भी प्रकार का भी वाद-विवाद उत्पन्न करता हैतो यह विवाद करने का उन्हे कोई अधिकार प्राप्त नहीं होगा क्यूंकि पूर्व में परिजनों की आज्ञा से ही मैने दीक्षा ली है इसलिए किसी के भी द्वारा किये गये वाद-विवाद को पूर्ण रुपेण अस्वीकार माना जाये।

</p>

                <p>
                  ☑  मेरे द्वारा ऊपर दी गई सारी जानकारी पूरी तरह से सही व प्रमाणिक है।
                </p>
              </div>

              <div className="family-details-section">
                <div className="family-photo-box">
                  <p>Family Member Photo</p>
                </div>

                <div className="family-photo-box">
                  <p>Family Member Photo</p>
                </div>

                <div className="family-info">
                  <h3>FAMILY MEMBER DETAILS</h3>
                  <DevoteeLine
                    label="Name"
                    value={person.family_name || "-"}
                  />
                  <DevoteeLine
                    label="Relation"
                    value={person.family_relation || "-"}
                  />
                  <DevoteeLine
                    label="Mobile"
                    value={person.family_mobile || "-"}
                  />
                </div>
              </div>

              <div className="signature-section">
  <div className="signature-block">
    <div className="signature-line" />
    <p>Family Member's Signature</p>
  </div>

  <div className="thumb-impression-block">
  <div className="thumb-box">
  <p>Thumb</p>
  <p className="thumb-hi">अंगूठा</p>
</div>

<div className="thumb-box">
  <p>Thumb</p>
  <p className="thumb-hi">अंगूठा</p>
</div>
</div>

  <div className="signature-block">
    <div className="signature-line" />
    <p>Applicant Signature</p>
  </div>
</div>

              <div className="form-footer">
                <p>
                <strong>Meeting Date / मीटिंग तारीख :</strong> {meetingDate}
                </p>
              </div>
            </div>
          );
        })}
      </section>
      )}
      {selectedAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-xl">
          <h3 className="text-2xl font-extrabold">
  {selectedAction.workflow === "diksha"
    ? "Manage Diksha Candidate"
    : "Manage Final Meeting Candidate"}
</h3>
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
                  placeholder="Sadhak name"
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
              {selectedAction.workflow === "final_meeting" && (
              <div className="rounded-2xl bg-orange-50 p-4">
  <h4 className="font-extrabold">Reschedule Final Meeting</h4>
  <p className="text-sm text-stone-600">फाइनल मीटिंग तारीख बदलें</p>

  <div className="mt-4">
  <select
  value={selectedFinalMeetingMonth}
  onChange={(event) => {
    setFinalMeetingMonth(event.target.value);
    setFinalMeetingSlotId("");
  }}
      className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 font-bold outline-none focus:border-orange-600"
    >
      {finalMeetingMonths.map((month) => (
        <option key={month} value={month}>
          {formatMonthLabel(month)}
        </option>
      ))}
    </select>
  </div>

  <div className="mt-4 overflow-hidden rounded-3xl border border-orange-100 bg-white">
    <div className="grid grid-cols-7 bg-orange-100 text-center text-[11px] font-extrabold text-orange-900 md:text-xs">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
        <div
          key={day}
          className="border-r border-orange-200 px-1 py-2 last:border-r-0"
        >
          {day}
        </div>
      ))}
    </div>

    <div className="grid grid-cols-7">
      {finalMeetingCalendarDays.map((calendarDay, index) => {
        if (calendarDay.isEmpty) {
          return (
            <div
              key={`empty-final-${index}`}
              className="min-h-[62px] border-r border-t border-orange-100 bg-orange-50/40 last:border-r-0"
            />
          );
        }

        const slot = calendarDay.slot;
        const seatsLeft = slot ? slot.capacity - slot.current_count : 0;
        const isFull = !slot;
const isOverCapacity = slot ? slot.current_count >= slot.capacity : false;
        const isSelected = finalMeetingSlotId === slot?.id;

        return (
          <button
            key={calendarDay.date}
            type="button"
            disabled={!slot}
            onClick={() => {
              if (!slot) return;
              setFinalMeetingSlotId(slot.id);
            }}
            className={`min-h-[62px] border-r border-t border-orange-100 p-2 text-left transition last:border-r-0 ${
              isSelected
                ? "bg-orange-700 text-white"
                : isFull
                ? "cursor-not-allowed bg-stone-100 text-stone-400"
                : "bg-white hover:bg-orange-50"
            }`}
          >
            <div className="flex h-full flex-col justify-between gap-1">
              <p className="text-base font-extrabold">{calendarDay.day}</p>

              {slot ? (
                <span
                  className={`inline-flex w-fit rounded-full px-2 py-1 text-[9px] font-extrabold ${
                    isSelected
                      ? "bg-white text-orange-800"
                      : isOverCapacity
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isOverCapacity
  ? `${slot.current_count}/${slot.capacity}`
  : `${seatsLeft} left`}
                </span>
              ) : (
                <span className="text-[9px] font-bold text-stone-400">
                  No slot
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  </div>

  {finalMeetingSlotId && (
    <div className="mt-4 rounded-2xl bg-white p-3 text-sm font-bold text-orange-900">
      Selected:{" "}
      {slots.find((slot) => slot.id === finalMeetingSlotId)?.slot_date
  ? formatDate(
      slots.find((slot) => slot.id === finalMeetingSlotId)?.slot_date || ""
    )
  : "-"}
      <span className="block text-xs font-semibold text-stone-600">
        फाइनल मीटिंग की नई तारीख चुनी गई है
      </span>
    </div>
  )}

  <button
    type="button"
    onClick={handleRescheduleFinalMeeting}
    disabled={isReschedulingFinalMeeting || !finalMeetingSlotId}
    className="mt-4 w-full rounded-2xl bg-orange-700 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
  >
    {isReschedulingFinalMeeting
      ? "Rescheduling..."
      : "Save Final Meeting Date"}
    <span className="block text-xs font-normal">
      फाइनल मीटिंग तारीख सेव करें
    </span>
  </button>
</div>
)}

  
{selectedAction.workflow === "final_meeting" && (
  <div className="rounded-2xl bg-orange-50 p-4">
    <h4 className="font-extrabold">Final Meeting Actions</h4>
    <p className="text-sm text-stone-600">फाइनल मीटिंग कार्यवाही</p>

    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <ActionButton
        label="Pending"
        labelHi="लंबित"
        className="bg-red-100 text-red-700"
        disabled={isUpdatingAction}
        onClick={() =>
          handleSubmitAction({
            actionType: "attendance",
            title: "Final Meeting Pending",
            attendanceType: "Final Meeting",
            attendanceValue: "Absent",
          })
        }
      />

      <ActionButton
        label="Deferred"
        labelHi="स्थगित"
        className="bg-stone-200 text-stone-700"
        disabled={isUpdatingAction}
        onClick={() =>
          handleSubmitAction({
            actionType: "status",
            title: "Deferred",
            newStatus: "Rejected",
          })
        }
      />

      <ActionButton
        label="Approve for Diksha"
        labelHi="दीक्षा के लिए स्वीकृत"
        className="bg-blue-100 text-blue-700 md:col-span-2"
        disabled={isUpdatingAction}
        onClick={() =>
          handleSubmitAction({
            actionType: "status",
            title: "Approved for Diksha",
            newStatus: "Approved",
          })
        }
      />
    </div>
  </div>
)}
{selectedAction.workflow === "diksha" && (
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

                    <div className="mt-4">
  <input
    type="date"
    value={dikshaDate}
    onChange={(event) => setDikshaDate(event.target.value)}
    className="w-full rounded-2xl border border-purple-200 px-4 py-3 outline-none focus:border-purple-600"
  />
</div>

                    <button
                      type="button"
                      onClick={handleScheduleDiksha}
                      disabled={isUpdatingAction}
                      className="mt-4 w-full rounded-2xl bg-purple-100 px-4 py-3 text-sm font-bold text-purple-700 disabled:opacity-60"
                    >
                      {dikshaDate
  ? "Save Rescheduled Diksha Date"
  : "Save Diksha Date"}
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
              )}
            </div>
            

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setSelectedAction(null);
                  setActionNotes("");
                  setDikshaDate("");
                  setDikshaTime("3:30 PM");
                  setFinalMeetingSlotId("");
                  setFinalMeetingMonth("");
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

{tokenSuccess && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
    <div className="w-full max-w-xl rounded-3xl bg-white p-6 text-center shadow-2xl md:p-8">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl font-extrabold text-green-700">
        ✓
      </div>

      <h3 className="mt-5 text-3xl font-extrabold text-green-700">
      Token Number Updated Successfully
      </h3>

      <p className="mt-2 text-xl font-bold text-orange-800">
      नया टोकन नंबर सफलतापूर्वक बन गया
      </p>

      <p className="mt-5 text-sm font-semibold text-stone-600">
        Candidate / उम्मीदवार
      </p>

      <p className="mt-1 text-2xl font-extrabold text-stone-900">
        {tokenSuccess.name}
      </p>

      <div className="mt-6 rounded-3xl border-2 border-orange-300 bg-orange-50 p-6">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-800">
          Token Number / टोकन नंबर
        </p>
        <p className="mt-3 text-sm font-bold uppercase tracking-wide text-stone-600">
  This is your new token number
</p>
        <p className="mt-3 text-6xl font-black text-orange-900 md:text-7xl">
          {tokenSuccess.token}
        </p>
      </div>
      <div className="mt-4 rounded-3xl border border-green-200 bg-green-50 p-5">
  <p className="text-sm font-bold uppercase tracking-wide text-green-800">
    Meeting Date / मीटिंग तारीख
  </p>

  <p className="mt-2 text-3xl font-black text-green-900">
    {tokenSuccess.meetingDate ? formatDate(tokenSuccess.meetingDate) : "-"}
  </p>

  <p className="mt-1 text-lg font-extrabold text-green-800">
    {tokenSuccess.meetingTime || "-"}
  </p>
</div>
      <p className="mt-5 text-sm font-semibold text-stone-600">
        Please note this token number and share it with the candidate.
      </p>

      <p className="text-sm font-semibold text-stone-600">
        कृपया यह token number उम्मीदवार को बता दें।
      </p>

      <button
        type="button"
        onClick={() => {
          setTokenSuccess(null);
          window.location.reload();
        }}
        className="mt-7 w-full rounded-2xl bg-orange-700 px-5 py-4 text-lg font-extrabold text-white"
      >
        Back to Admin Dashboard
        <span className="block text-sm font-normal">
          वापस admin dashboard पर जाएं
        </span>
      </button>
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
function getCalendarDaysForMonth(monthValue: string, monthSlots: Slot[]) {
  if (!monthValue) return [];

  const [year, month] = monthValue.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const startPadding = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();

  const slotMap = new Map(monthSlots.map((slot) => [slot.slot_date, slot]));

  const calendarDays: {
    date: string;
    day: number | null;
    slot: Slot | null;
    isEmpty: boolean;
  }[] = [];

  for (let i = 0; i < startPadding; i++) {
    calendarDays.push({
      date: "",
      day: null,
      slot: null,
      isEmpty: true,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    calendarDays.push({
      date,
      day,
      slot: slotMap.get(date) || null,
      isEmpty: false,
    });
  }

  return calendarDays;
}

function formatMonthLabel(monthValue: string) {
  if (!monthValue) return "Select month";

  const [year, month] = monthValue.split("-").map(Number);
  const date = new Date(year, month - 1, 1);

  return date.toLocaleDateString("en-IN", {
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
function getDateAfterMonths(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + months);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
function addDaysToDateString(dateString: string, days: number) {
  const date = parseLocalDate(dateString);
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function maskMobile(mobile: string) {
  if (!mobile || mobile.length < 4) return mobile;
  return `${mobile.slice(0, 2)}xxxxxx${mobile.slice(-2)}`;
}
function formatIdType(idType: string | null) {
  if (!idType) return "ID";

  if (idType === "aadhaar") return "Aadhaar Card";
  if (idType === "passport") return "Passport";
  if (idType === "other") return "Other Government ID";

  return idType;
}
function isFinalMeetingCandidate(person: Registration) {
  const status = person.candidate_status || person.status || "";

  return (
    status === "Scheduled for Final Meeting" ||
    status === "Pending" ||
    status === "Rejected" ||
    status === "Final Meeting Attended"
  );
}

function isDikshaCandidate(person: Registration) {
  const status = person.candidate_status || person.status || "";

  return (
    status === "Approved" ||
    status === "Scheduled for Diksha" ||
    status === "Diksha Completed"
  );
}
function getTokenParts(token: string | null) {
  const safeToken = token || "";

  const prefixMatch = safeToken.match(/^[A-Za-z]+/);
  const numberMatch = safeToken.match(/\d+$/);

  return {
    prefix: prefixMatch ? prefixMatch[0].toUpperCase() : "",
    number: numberMatch ? Number(numberMatch[0]) : 0,
  };
}

function sortByMeetingDateAndToken(a: Registration, b: Registration) {
  const dateA = a.slots?.slot_date || a.final_meeting_date || "";
  const dateB = b.slots?.slot_date || b.final_meeting_date || "";

  if (dateA !== dateB) {
    return dateA.localeCompare(dateB);
  }

  const tokenA = getTokenParts(a.token);
  const tokenB = getTokenParts(b.token);

  const prefixOrder: Record<string, number> = {
    M: 1,
    F: 2,
    DK: 3,
    CP: 4,
    FAM: 5,
  };

  const orderA = prefixOrder[tokenA.prefix] || 99;
  const orderB = prefixOrder[tokenB.prefix] || 99;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  if (tokenA.number !== tokenB.number) {
    return tokenA.number - tokenB.number;
  }

  return (a.full_name || "").localeCompare(b.full_name || "");
}
function csvTextValue(value: string | null | undefined) {
  const cleanValue = String(value || "-").trim();

  if (!cleanValue || cleanValue === "-") {
    return "-";
  }

  return `="${cleanValue}"`;
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
    <th className="border border-black px-1 py-1 text-left font-bold">
      {children}
    </th>
  );
}

function PrintCell({ children }: { children: ReactNode }) {
  return <td className="border border-black px-1 py-1">{children}</td>;
}

function EditInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-stone-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
      />
    </div>
  );
}

function EditTextarea({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-stone-700">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
      />
    </div>
  );
}

function EditSelect({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  options: string[][];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-stone-700">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 outline-none focus:border-orange-600"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function DevoteeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="devotee-line">
      <span className="devotee-label">{label}</span>
      <span className="devotee-colon">:</span>
      <span className="devotee-value">{value}</span>
    </div>
  );
}