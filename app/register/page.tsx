"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type FormData = {
  fullName: string;
  age: string;
  gender: string;
  occupation: string;
  maritalStatus: string;
  mobile: string;
  whatsapp: string;
  sameWhatsapp: boolean;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  guardianRelation: string;
  guardianName: string;
  guardianMobile: string;
  familyName: string;
  familyRelation: string;
  familyMobile: string;
  idType: string;
  idNumber: string;
  aadhaarFile: File | null;
  selectedSlotId: string;
  remarksBy: string;
};

type Slot = {
  id: string;
  slot_date: string;
  slot_time: string;
  capacity: number;
  current_count: number;
  status: string;
};

const initialFormData: FormData = {
  fullName: "",
  age: "",
  gender: "",
  occupation: "",
  maritalStatus: "",
  mobile: "",
  whatsapp: "",
  sameWhatsapp: false,
  address: "",
  city: "",
  state: "",
  pinCode: "",
  guardianRelation: "",
  guardianName: "",
  guardianMobile: "",
  familyName: "",
  familyRelation: "",
  familyMobile: "",
  idType: "aadhaar",
  idNumber: "",
  aadhaarFile: null,
  selectedSlotId: "",
  remarksBy: "",
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);

  const totalSteps = 6;

  useEffect(() => {
    async function loadSlots() {
      const { data, error } = await supabase
        .from("slots")
        .select("*")
        .order("slot_date", { ascending: true });

      if (error) {
        alert("Slot loading error: " + error.message);
        setIsLoadingSlots(false);
        return;
      }

      const loadedSlots = (data || []) as Slot[];
      setSlots(loadedSlots);

      const firstOpenSlot = loadedSlots.find(
        (slot) => slot.current_count < slot.capacity && slot.status !== "full"
      );

      if (firstOpenSlot) {
        setSelectedMonth(firstOpenSlot.slot_date.slice(0, 7));
      } else if (loadedSlots.length > 0) {
        setSelectedMonth(loadedSlots[0].slot_date.slice(0, 7));
      }

      setIsLoadingSlots(false);
    }

    loadSlots();
  }, []);

  const monthOptions = useMemo(() => {
    const monthMap = new Map<string, string>();

    slots.forEach((slot) => {
      const monthKey = slot.slot_date.slice(0, 7);
      monthMap.set(monthKey, formatMonth(slot.slot_date));
    });

    return Array.from(monthMap.entries());
  }, [slots]);

  const selectedSlot = slots.find((slot) => slot.id === formData.selectedSlotId);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const target = e.target;
    const { name, value } = target;

    if (target instanceof HTMLInputElement && target.type === "file") {
      const file = target.files?.[0] || null;

      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));

      return;
    }

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      const checked = target.checked;

      if (name === "sameWhatsapp") {
        setFormData((prev) => ({
          ...prev,
          sameWhatsapp: checked,
          whatsapp: checked ? prev.mobile : "",
        }));
      }

      return;
    }

    if (name === "mobile") {
      setFormData((prev) => ({
        ...prev,
        mobile: value,
        whatsapp: prev.sameWhatsapp ? value : prev.whatsapp,
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleMonthChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedMonth(event.target.value);

    setFormData((prev) => ({
      ...prev,
      selectedSlotId: "",
    }));
  }

  function selectSlot(slotId: string) {
    setFormData((prev) => ({
      ...prev,
      selectedSlotId: slotId,
    }));
  }
  function validateStep(currentStep: number) {
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        return {
          isValid: false,
          message: "Please enter full name.\nकृपया पूरा नाम भरें।",
        };
      }
  
      if (!formData.age.trim()) {
        return {
          isValid: false,
          message: "Please enter age.\nकृपया आयु भरें।",
        };
      }
  
      if (Number(formData.age) <= 0) {
        return {
          isValid: false,
          message: "Please enter a valid age.\nकृपया सही आयु भरें।",
        };
      }
  
      if (!formData.gender.trim()) {
        return {
          isValid: false,
          message: "Please select gender.\nकृपया लिंग चुनें।",
        };
      }
  
      if (!formData.occupation.trim()) {
        return {
          isValid: false,
          message: "Please enter occupation.\nकृपया व्यवसाय भरें।",
        };
      }
  
      if (!formData.maritalStatus.trim()) {
        return {
          isValid: false,
          message: "Please select marital status.\nकृपया वैवाहिक स्थिति चुनें।",
        };
      }
    }
  
    if (currentStep === 2) {
      if (!formData.mobile.trim()) {
        return {
          isValid: false,
          message: "Please enter mobile number.\nकृपया मोबाइल नंबर भरें।",
        };
      }
  
      if (formData.mobile.replace(/\D/g, "").length !== 10) {
        return {
          isValid: false,
          message:
            "Please enter a valid 10 digit mobile number.\nकृपया सही 10 अंकों का मोबाइल नंबर भरें।",
        };
      }
  
      if (!formData.whatsapp.trim()) {
        return {
          isValid: false,
          message: "Please enter WhatsApp number.\nकृपया व्हाट्सऐप नंबर भरें।",
        };
      }
  
      if (formData.whatsapp.replace(/\D/g, "").length !== 10) {
        return {
          isValid: false,
          message:
            "Please enter a valid 10 digit WhatsApp number.\nकृपया सही 10 अंकों का व्हाट्सऐप नंबर भरें।",
        };
      }
  
      if (!formData.address.trim()) {
        return {
          isValid: false,
          message: "Please enter full address.\nकृपया पूरा पता भरें।",
        };
      }
  
      if (!formData.city.trim()) {
        return {
          isValid: false,
          message: "Please enter city.\nकृपया शहर भरें।",
        };
      }
  
      if (!formData.state.trim()) {
        return {
          isValid: false,
          message: "Please enter state.\nकृपया राज्य भरें।",
        };
      }
  
      if (!formData.pinCode.trim()) {
        return {
          isValid: false,
          message: "Please enter pin code.\nकृपया पिन कोड भरें।",
        };
      }
  
      if (formData.pinCode.replace(/\D/g, "").length !== 6) {
        return {
          isValid: false,
          message:
            "Please enter a valid 6 digit pin code.\nकृपया सही 6 अंकों का पिन कोड भरें।",
        };
      }
    }
  
    if (currentStep === 3) {
      if (!formData.guardianRelation.trim()) {
        return {
          isValid: false,
          message:
            "Please select guardian relation.\nकृपया अभिभावक से संबंध चुनें।",
        };
      }
  
      if (!formData.guardianName.trim()) {
        return {
          isValid: false,
          message:
            "Please enter guardian name.\nकृपया अभिभावक का नाम भरें।",
        };
      }
  
      if (!formData.guardianMobile.trim()) {
        return {
          isValid: false,
          message:
            "Please enter guardian mobile number.\nकृपया अभिभावक का मोबाइल नंबर भरें।",
        };
      }
  
      if (formData.guardianMobile.replace(/\D/g, "").length !== 10) {
        return {
          isValid: false,
          message:
            "Please enter a valid guardian mobile number.\nकृपया सही अभिभावक मोबाइल नंबर भरें।",
        };
      }
  
      if (!formData.familyName.trim()) {
        return {
          isValid: false,
          message:
            "Please enter family member name.\nकृपया परिवार के सदस्य का नाम भरें।",
        };
      }
  
      if (!formData.familyRelation.trim()) {
        return {
          isValid: false,
          message:
            "Please select family member relation.\nकृपया परिवार के सदस्य से संबंध चुनें।",
        };
      }
  
      if (!formData.familyMobile.trim()) {
        return {
          isValid: false,
          message:
            "Please enter family member mobile number.\nकृपया परिवार के सदस्य का मोबाइल नंबर भरें।",
        };
      }
  
      if (formData.familyMobile.replace(/\D/g, "").length !== 10) {
        return {
          isValid: false,
          message:
            "Please enter a valid family member mobile number.\nकृपया सही परिवार सदस्य मोबाइल नंबर भरें।",
        };
      }
    }
  
    if (currentStep === 4) {
      if (!formData.idType.trim()) {
        return {
          isValid: false,
          message: "Please select ID type.\nकृपया पहचान प्रमाण का प्रकार चुनें।",
        };
      }
  
      if (!formData.idNumber.trim()) {
        return {
          isValid: false,
          message: "Please enter Aadhaar / ID number.\nकृपया आधार / पहचान नंबर भरें।",
        };
      }
  
      if (!formData.aadhaarFile) {
        return {
          isValid: false,
          message:
            "Please upload Aadhaar / ID proof.\nकृपया आधार / पहचान प्रमाण अपलोड करें।",
        };
      }
    }
  
    if (currentStep === 5) {
      if (!formData.selectedSlotId) {
        return {
          isValid: false,
          message:
            "Please select an appointment date.\nकृपया अपॉइंटमेंट तारीख चुनें।",
        };
      }
    }
  
    // if (currentStep === 6) {
    //   if (!formData.remarksBy.trim()) {
    //     return {
    //       isValid: false,
    //       message:
    //         "Please enter who filled this form.\nकृपया लिखें कि फॉर्म किसने भरा।",
    //     };
    //   }
    // }
  
    return {
      isValid: true,
      message: "",
    };
  }
  function nextStep() {
    const validation = validateStep(step);
  
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }
  
    setStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSubmitting) return;

    if (!formData.selectedSlotId) {
      alert("Please select an appointment date.\nकृपया अपॉइंटमेंट तारीख चुनें।");
      return;
    }
    const finalValidation = validateStep(6);

if (!finalValidation.isValid) {
  alert(finalValidation.message);
  setIsSubmitting(false);
  return;
}

    setIsSubmitting(true);

    try {
      let aadhaarFileUrl = "";
      let aadhaarFileName = "";

      if (formData.aadhaarFile) {
        const fileExt = formData.aadhaarFile.name.split(".").pop();
        const cleanMobile = formData.mobile.replace(/\D/g, "");
        const filePath = `aadhaar-${cleanMobile}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("aadhaar-documents")
          .upload(filePath, formData.aadhaarFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          alert("Aadhaar upload error: " + uploadError.message);
          setIsSubmitting(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("aadhaar-documents")
          .getPublicUrl(filePath);

        aadhaarFileUrl = publicUrlData.publicUrl;
        aadhaarFileName = formData.aadhaarFile.name;
      }

      const { data, error } = await supabase.rpc("create_registration_with_slot", {
        p_slot_id: formData.selectedSlotId,
        p_full_name: formData.fullName,
        p_age: formData.age ? Number(formData.age) : null,
        p_gender: formData.gender,
        p_occupation: formData.occupation,
        p_marital_status: formData.maritalStatus,
        p_mobile: formData.mobile,
        p_whatsapp: formData.whatsapp,
        p_address: formData.address,
        p_city: formData.city,
        p_state: formData.state,
        p_pin_code: formData.pinCode,
        p_guardian_relation: formData.guardianRelation,
        p_guardian_name: formData.guardianName,
        p_guardian_mobile: formData.guardianMobile,
        p_family_name: formData.familyName,
        p_family_relation: formData.familyRelation,
        p_family_mobile: formData.familyMobile,
        p_id_type: formData.idType,
        p_id_number: formData.idNumber,
        p_aadhaar_file_url: aadhaarFileUrl,
        p_aadhaar_file_name: aadhaarFileName,
        p_remarks_by: formData.remarksBy.trim() || "Self",
      });

      if (error) {
        const message = error.message.toLowerCase();

        if (message.includes("slot_full")) {
          alert(
            "This date is now full. Please select another date.\nयह तारीख अब भर चुकी है। कृपया दूसरी तारीख चुनें।"
          );
          setStep(5);
          setIsSubmitting(false);
          return;
        }

        if (message.includes("duplicate")) {
          alert(
            "This mobile number is already registered.\nयह मोबाइल नंबर पहले से पंजीकृत है।"
          );
          setIsSubmitting(false);
          return;
        }

        alert("Registration error: " + error.message);
        setIsSubmitting(false);
        return;
      }

      const result = data?.[0];

      if (!result) {
        alert("Registration completed, but confirmation data was not received.");
        setIsSubmitting(false);
        return;
      }

      const params = new URLSearchParams({
        token: result.token,
        date: result.slot_date,
        time: result.slot_time,
      });

      window.location.href = `/success?${params.toString()}`;
    } catch (error) {
      alert("Something went wrong. Please try again.");
      console.error(error);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff8ed] px-4 py-6 text-[#2d2418] md:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
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

          <h1 className="mt-2 text-3xl font-extrabold">
            Diksha Registration
          </h1>

          <h2 className="mt-1 text-2xl font-bold text-orange-800">
            दीक्षा पंजीकरण
          </h2>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm md:p-8">
          <StepIndicator currentStep={step} totalSteps={totalSteps} />

          <form onSubmit={handleSubmit} className="mt-8">
            {step === 1 && (
              <StepCard
                titleEn="Personal Details"
                titleHi="व्यक्तिगत जानकारी"
                subtitleEn="Please fill the basic details carefully."
                subtitleHi="कृपया मूल जानकारी ध्यानपूर्वक भरें।"
              >
                <InputField
                  labelEn="Full Name"
                  labelHi="पूरा नाम"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <InputField
                    labelEn="Age"
                    labelHi="आयु"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                    required
                  />

                  <SelectField
                    labelEn="Gender"
                    labelHi="लिंग"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    options={[
                      ["", "Select gender"],
                      ["Male", "Male / पुरुष"],
                      ["Female", "Female / महिला"],
                      ["Other", "Other / अन्य"],
                    ]}
                  />
                </div>

                <InputField
                  labelEn="Occupation"
                  labelHi="व्यवसाय"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="Enter occupation"
                  required
                />

                <SelectField
                  labelEn="Marital Status"
                  labelHi="वैवाहिक स्थिति"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  required
                  options={[
                    ["", "Select marital status"],
                    ["Single", "Single / अविवाहित"],
                    ["Married", "Married / विवाहित"],
                    ["Widowed", "Widowed / विधवा / विधुर"],
                  ]}
                />
              </StepCard>
            )}

            {step === 2 && (
              <StepCard
                titleEn="Contact & Address"
                titleHi="संपर्क और पता"
                subtitleEn="Please provide correct mobile number and address."
                subtitleHi="कृपया सही मोबाइल नंबर और पता भरें।"
              >
                <InputField
                  labelEn="Mobile Number"
                  labelHi="मोबाइल नंबर"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter 10 digit mobile number"
                  required
                />

                <label className="flex items-start gap-3 rounded-2xl bg-orange-50 p-4">
                  <input
                    type="checkbox"
                    name="sameWhatsapp"
                    checked={formData.sameWhatsapp}
                    onChange={handleChange}
                    className="mt-1 h-5 w-5 accent-orange-700"
                  />

                  <span>
                    <span className="block font-bold">
                      WhatsApp number is same as mobile number
                    </span>
                    <span className="block text-sm text-stone-600">
                      व्हाट्सऐप नंबर मोबाइल नंबर जैसा ही है
                    </span>
                  </span>
                </label>

                <InputField
                  labelEn="WhatsApp Number"
                  labelHi="व्हाट्सऐप नंबर"
                  name="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="Enter WhatsApp number"
                  required
                  disabled={formData.sameWhatsapp}
                />

                <TextAreaField
                  labelEn="Full Address"
                  labelHi="पूरा पता"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="House/flat no., street, locality, landmark"
                  required
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <InputField
                    labelEn="City"
                    labelHi="शहर"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                  />

                  <InputField
                    labelEn="State"
                    labelHi="राज्य"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    required
                  />

                  <InputField
                    labelEn="Pin Code"
                    labelHi="पिन कोड"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    placeholder="6 digits"
                    required
                  />
                </div>
              </StepCard>
            )}

            {step === 3 && (
              <StepCard
                titleEn="Guardian / Family Details"
                titleHi="अभिभावक / परिवार की जानकारी"
                subtitleEn="Please add guardian and family member details."
                subtitleHi="कृपया अभिभावक और परिवार के सदस्य की जानकारी भरें।"
              >
                <SelectField
                  labelEn="Guardian Relation"
                  labelHi="अभिभावक से संबंध"
                  name="guardianRelation"
                  value={formData.guardianRelation}
                  onChange={handleChange}
                  required
                  options={[
                    ["", "Select relation"],
                    ["Father", "Father / पिता"],
                    ["Mother", "Mother / माता"],
                    ["Husband", "Husband / पति"],
                    ["Wife", "Wife / पत्नी"],
                    ["Brother", "Brother / भाई"],
                    ["Sister", "Sister / बहन"],
                    ["Other", "Other / अन्य"],
                  ]}
                />

                <InputField
                  labelEn="Guardian Name"
                  labelHi="अभिभावक का नाम"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleChange}
                  placeholder="Enter guardian name"
                  required
                />

                <InputField
                  labelEn="Guardian Mobile Number"
                  labelHi="अभिभावक का मोबाइल नंबर"
                  name="guardianMobile"
                  type="tel"
                  value={formData.guardianMobile}
                  onChange={handleChange}
                  placeholder="Enter guardian mobile number"
                  required
                />

                <div className="border-t border-orange-100" />

                <InputField
                  labelEn="Family Member Name"
                  labelHi="परिवार के सदस्य का नाम"
                  name="familyName"
                  value={formData.familyName}
                  onChange={handleChange}
                  placeholder="Enter family member name"
                  required
                />

                <SelectField
                  labelEn="Family Member Relation"
                  labelHi="परिवार के सदस्य से संबंध"
                  name="familyRelation"
                  value={formData.familyRelation}
                  onChange={handleChange}
                  required
                  options={[
                    ["", "Select relation"],
                    ["Father", "Father / पिता"],
                    ["Mother", "Mother / माता"],
                    ["Husband", "Husband / पति"],
                    ["Wife", "Wife / पत्नी"],
                    ["Brother", "Brother / भाई"],
                    ["Sister", "Sister / बहन"],
                    ["Son", "Son / पुत्र"],
                    ["Daughter", "Daughter / पुत्री"],
                    ["Other", "Other / अन्य"],
                  ]}
                />

                <InputField
                  labelEn="Family Member Mobile"
                  labelHi="परिवार के सदस्य का मोबाइल नंबर"
                  name="familyMobile"
                  type="tel"
                  value={formData.familyMobile}
                  onChange={handleChange}
                  placeholder="Enter family member mobile number"
                  required
                />
              </StepCard>
            )}

            {step === 4 && (
              <StepCard
                titleEn="Identity Proof"
                titleHi="पहचान प्रमाण"
                subtitleEn="Please enter identity details and upload a clear document."
                subtitleHi="कृपया पहचान की जानकारी भरें और साफ दस्तावेज़ अपलोड करें।"
              >
                <div className="rounded-2xl bg-orange-50 p-4 text-sm text-stone-700">
                  <p className="font-bold">
                    Your document will be used only for registration verification.
                  </p>
                  <p className="mt-1">
                    आपका दस्तावेज़ केवल पंजीकरण सत्यापन के लिए उपयोग किया जाएगा।
                  </p>
                </div>

                <SelectField
                  labelEn="ID Type"
                  labelHi="पहचान प्रमाण का प्रकार"
                  name="idType"
                  value={formData.idType}
                  onChange={handleChange}
                  required
                  options={[
                    ["aadhaar", "Aadhaar Card / आधार कार्ड"],
                    ["passport", "Passport / पासपोर्ट"],
                    ["other", "Other / अन्य"],
                  ]}
                />

                <InputField
                  labelEn="Aadhaar / ID Number"
                  labelHi="आधार / पहचान नंबर"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  placeholder="Enter ID number"
                  required
                />

                <div>
                  <Label
                    labelEn="Upload Aadhaar / ID Proof"
                    labelHi="आधार / पहचान प्रमाण अपलोड करें"
                    required
                  />

                  <input
                    type="file"
                    name="aadhaarFile"
                    onChange={handleChange}
                    accept="image/*,.pdf"
                    required
                    className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-orange-700 file:px-4 file:py-2 file:font-bold file:text-white"
                  />

                  <p className="mt-2 text-sm text-stone-600">
                    Upload clear photo or PDF.
                  </p>
                  <p className="text-sm text-stone-600">
                    साफ फोटो या PDF अपलोड करें।
                  </p>

                  {formData.aadhaarFile && (
                    <div className="mt-3 rounded-2xl bg-green-50 p-3 text-sm font-semibold text-green-700">
                      Selected file: {formData.aadhaarFile.name}
                      <span className="block text-xs font-normal">
                        चुनी गई फाइल: {formData.aadhaarFile.name}
                      </span>
                    </div>
                  )}
                </div>
              </StepCard>
            )}

            {step === 5 && (
              <StepCard
                titleEn="Select Appointment Date"
                titleHi="अपॉइंटमेंट तारीख चुनें"
                subtitleEn="You may select any available date. Full dates cannot be selected."
                subtitleHi="आप कोई भी उपलब्ध तारीख चुन सकते हैं। भरी हुई तारीख नहीं चुनी जा सकती।"
              >
                {isLoadingSlots ? (
                  <div className="rounded-2xl bg-orange-50 p-5 text-center font-semibold">
                    Loading available dates...
                    <span className="block text-sm font-normal">
                      उपलब्ध तारीखें लोड हो रही हैं...
                    </span>
                  </div>
                ) : (
                  <CalendarSlotSelector
                    slots={slots}
                    selectedMonth={selectedMonth}
                    selectedSlotId={formData.selectedSlotId}
                    onMonthChange={handleMonthChange}
                    onSelectSlot={selectSlot}
                    monthOptions={monthOptions}
                  />
                )}
              </StepCard>
            )}

            {step === 6 && (
              <StepCard
                titleEn="Review & Submit"
                titleHi="जांच करें और जमा करें"
                subtitleEn="Please check all details before submitting."
                subtitleHi="जमा करने से पहले कृपया सभी जानकारी जांच लें।"
              >
                <ReviewBox formData={formData} selectedSlot={selectedSlot} />

                <TextAreaField
  labelEn="Remarks By"
  labelHi="फॉर्म किसने भरा"
  name="remarksBy"
  value={formData.remarksBy}
  onChange={handleChange}
  placeholder="Optional - Self / Sewadar / Family member"
/>
              </StepCard>
            )}

            <div className="mt-8 flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="w-1/2 rounded-2xl border border-orange-300 px-5 py-4 font-bold text-orange-800 disabled:opacity-60"
                >
                  Back
                  <span className="block text-sm font-normal">पीछे जाएं</span>
                </button>
              )}

              {step < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-orange-700 px-5 py-4 font-bold text-white disabled:opacity-60"
                >
                  Next
                  <span className="block text-sm font-normal">आगे बढ़ें</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-orange-700 px-5 py-4 font-bold text-white disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                  <span className="block text-sm font-normal">
                    {isSubmitting ? "जमा हो रहा है..." : "पंजीकरण जमा करें"}
                  </span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function CalendarSlotSelector({
  slots,
  selectedMonth,
  selectedSlotId,
  onMonthChange,
  onSelectSlot,
  monthOptions,
}: {
  slots: Slot[];
  selectedMonth: string;
  selectedSlotId: string;
  onMonthChange: React.ChangeEventHandler<HTMLSelectElement>;
  onSelectSlot: (slotId: string) => void;
  monthOptions: string[][];
}) {
  const slotsForMonth = slots.filter((slot) =>
    slot.slot_date.startsWith(selectedMonth)
  );

  const slotByDate = new Map(slotsForMonth.map((slot) => [slot.slot_date, slot]));

  const [year, month] = selectedMonth.split("-").map(Number);
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const blankDays = Array.from({ length: firstDayOfMonth });
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  return (
    <div>
      <Label
        labelEn="Select Month"
        labelHi="महीना चुनें"
        required
      />

      <select
        value={selectedMonth}
        onChange={onMonthChange}
        className="mb-5 w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none focus:border-orange-600"
      >
        {monthOptions.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-bold text-stone-600">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {blankDays.map((_, index) => (
          <div key={`blank-${index}`} />
        ))}

        {days.map((day) => {
          const dateString = `${selectedMonth}-${String(day).padStart(2, "0")}`;
          const slot = slotByDate.get(dateString);

          if (!slot) {
            return (
              <div
                key={dateString}
                className="min-h-20 rounded-2xl border border-stone-100 bg-stone-50 p-2 text-center text-stone-300"
              >
                <p className="font-bold">{day}</p>
              </div>
            );
          }

          const isFull = slot.current_count >= slot.capacity || slot.status === "full";
          const isSelected = selectedSlotId === slot.id;
          const seatsLeft = slot.capacity - slot.current_count;

          return (
            <button
              key={slot.id}
              type="button"
              disabled={isFull}
              onClick={() => onSelectSlot(slot.id)}
              className={`min-h-24 rounded-2xl border p-2 text-left transition ${
                isSelected
                  ? "border-orange-700 bg-orange-100"
                  : "border-orange-200 bg-white"
              } ${
                isFull
                  ? "cursor-not-allowed opacity-50"
                  : "hover:border-orange-700"
              }`}
            >
              <p className="text-lg font-extrabold">{day}</p>

              <p className="mt-1 text-[11px] font-bold text-stone-600">
                {slot.slot_time}
              </p>

              {isFull ? (
                <p className="mt-1 text-[11px] font-bold text-red-700">
                  Full
                  <span className="block">भरा</span>
                </p>
              ) : (
                <p className="mt-1 text-[11px] font-bold text-green-700">
                  {seatsLeft} left
                  <span className="block">बाकी</span>
                </p>
              )}

              {isSelected && (
                <p className="mt-1 text-[11px] font-bold text-orange-800">
                  Selected
                </p>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl bg-orange-50 p-4 text-sm text-stone-700">
        <p className="font-bold">
          Each date has a maximum capacity of 50 registrations.
        </p>
        <p className="mt-1">
          हर तारीख पर अधिकतम 50 पंजीकरण हो सकते हैं।
        </p>
      </div>
    </div>
  );
}

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-stone-700">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>
          चरण {currentStep} / {totalSteps}
        </span>
      </div>

      <div className="h-3 rounded-full bg-orange-100">
        <div
          className="h-full rounded-full bg-orange-700"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}

function StepCard({
  titleEn,
  titleHi,
  subtitleEn,
  subtitleHi,
  children,
}: {
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-6">
        <h3 className="text-2xl font-extrabold">{titleEn}</h3>
        <h4 className="mt-1 text-xl font-bold text-orange-800">{titleHi}</h4>
        <p className="mt-3 text-sm text-stone-600">{subtitleEn}</p>
        <p className="mt-1 text-sm text-stone-600">{subtitleHi}</p>
      </div>

      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Label({
  labelEn,
  labelHi,
  required,
}: {
  labelEn: string;
  labelHi: string;
  required?: boolean;
}) {
  return (
    <label className="mb-2 block">
      <span className="block font-bold">
        {labelEn} {required && <span className="text-red-600">*</span>}
      </span>
      <span className="block text-sm font-semibold text-stone-600">
        {labelHi}
      </span>
    </label>
  );
}

function InputField({
  labelEn,
  labelHi,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
}: {
  labelEn: string;
  labelHi: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label labelEn={labelEn} labelHi={labelHi} required={required} />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full rounded-2xl border border-orange-200 px-4 py-4 outline-none focus:border-orange-600 disabled:bg-stone-100"
      />
    </div>
  );
}

function TextAreaField({
  labelEn,
  labelHi,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  labelEn: string;
  labelHi: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label labelEn={labelEn} labelHi={labelHi} required={required} />
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={4}
        className="w-full rounded-2xl border border-orange-200 px-4 py-4 outline-none focus:border-orange-600"
      />
    </div>
  );
}

function SelectField({
  labelEn,
  labelHi,
  name,
  value,
  onChange,
  options,
  required = false,
}: {
  labelEn: string;
  labelHi: string;
  name: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: string[][];
  required?: boolean;
}) {
  return (
    <div>
      <Label labelEn={labelEn} labelHi={labelHi} required={required} />
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-4 outline-none focus:border-orange-600"
      >
        {options.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReviewBox({
  formData,
  selectedSlot,
}: {
  formData: FormData;
  selectedSlot?: Slot;
}) {
  const rows = [
    ["Full Name / पूरा नाम", formData.fullName],
    ["Age / आयु", formData.age],
    ["Gender / लिंग", formData.gender],
    ["Mobile / मोबाइल", formData.mobile],
    ["WhatsApp / व्हाट्सऐप", formData.whatsapp],
    ["City / शहर", formData.city],
    ["State / राज्य", formData.state],
    ["Guardian / अभिभावक", formData.guardianName],
    ["Family Member / परिवार सदस्य", formData.familyName],
    ["ID Type / पहचान प्रकार", formData.idType],
    ["ID Number / पहचान नंबर", formData.idNumber],
    ["Aadhaar File / आधार फाइल", formData.aadhaarFile?.name || "-"],
    [
      "Selected Appointment / चुनी गई तारीख",
      selectedSlot
        ? `${formatDate(selectedSlot.slot_date)} - ${selectedSlot.slot_time}`
        : "-",
    ],
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-orange-100">
      {rows.map(([label, value], index) => (
        <div
          key={label}
          className={`grid gap-2 p-4 md:grid-cols-2 ${
            index % 2 === 0 ? "bg-orange-50" : "bg-white"
          }`}
        >
          <p className="font-bold">{label}</p>
          <p className="font-semibold">{value || "-"}</p>
        </div>
      ))}
    </div>
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

function formatMonth(dateString: string) {
  const date = parseLocalDate(dateString);

  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}