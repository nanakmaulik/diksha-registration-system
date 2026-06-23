"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type RegistrationFormData = {
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
  country: string;
  pinCode: string;
  spouseName: string;
  fatherName: string;
  motherName: string;
  familyName: string;
  familyRelation: string;
  familyMobile: string;
  parentVideoProofStatus: string;
  parentVideoProofReason: string;
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

const initialFormData: RegistrationFormData = {
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
  country: "India",
  pinCode: "",
  spouseName: "",
  fatherName: "",
  motherName: "",
  familyName: "",
  familyRelation: "",
  familyMobile: "",
parentVideoProofStatus: "",
parentVideoProofReason: "",
idType: "aadhaar",
  idNumber: "",
  aadhaarFile: null,
  selectedSlotId: "",
  remarksBy: "",
};

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [formData, setFormData] =
    useState<RegistrationFormData>(initialFormData);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
const [pincodeMessage, setPincodeMessage] = useState("");

  const totalSteps = 6;

  useEffect(() => {
    async function loadSlots() {
      const tomorrow = getTomorrowDateString();

      const { data, error } = await supabase
        .from("slots")
        .select("*")
        .gte("slot_date", tomorrow)
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

  const visibleSlots = slots.filter(
    (slot) => !selectedMonth || slot.slot_date.startsWith(selectedMonth)
  );
  async function fetchAddressFromPincode(
    pinCode: string,
    countryValue = formData.country
  ) {
    const cleanedPin = pinCode.replace(/\D/g, "");
  
    if (countryValue !== "India") {
      setPincodeMessage("");
      return;
    }
  
    if (cleanedPin.length !== 6) {
      setPincodeMessage("");
      return;
    }
  
    try {
      setIsPincodeLoading(true);
      setPincodeMessage("Finding address from PIN code...");
  
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${cleanedPin}`
      );
  
      const data = await response.json();
      const firstResult = data?.[0];
  
      if (
        firstResult?.Status !== "Success" ||
        !firstResult?.PostOffice ||
        firstResult.PostOffice.length === 0
      ) {
        setPincodeMessage("No address found for this PIN code.");
        return;
      }
  
      const postOffice = firstResult.PostOffice[0];
  
      setFormData((prev) => ({
        ...prev,
        city: postOffice.District || prev.city,
        state: postOffice.State || prev.state,
        country: "India",
        pinCode: cleanedPin,
      }));
  
      setPincodeMessage(
        `Address found: ${postOffice.District}, ${postOffice.State}`
      );
    } catch (error) {
      setPincodeMessage("Could not fetch address. Please enter manually.");
    } finally {
      setIsPincodeLoading(false);
    }
  }

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const target = event.target;
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
    if (name === "country") {
      setFormData((prev) => ({
        ...prev,
        country: value,
      }));
    
      if (value !== "India") {
        setPincodeMessage("");
      } else {
        fetchAddressFromPincode(formData.pinCode, value);
      }
    
      return;
    }
    
    if (name === "pinCode") {
      setFormData((prev) => ({
        ...prev,
        pinCode: value,
      }));
    
      fetchAddressFromPincode(value);
    
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

  function handleMonthChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
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

      const mobileDigits = formData.mobile.replace(/\D/g, "");

      if (mobileDigits.length < 7 || mobileDigits.length > 15) {
        return {
          isValid: false,
          message:
            "Please enter a valid mobile number. If outside India, include country code.\nकृपया सही मोबाइल नंबर भरें। भारत के बाहर हैं तो country code भी डालें।",
        };
      }

      if (!formData.whatsapp.trim()) {
        return {
          isValid: false,
          message: "Please enter WhatsApp number.\nकृपया WhatsApp नंबर भरें।",
        };
      }

      const whatsappDigits = formData.whatsapp.replace(/\D/g, "");

      if (whatsappDigits.length < 7 || whatsappDigits.length > 15) {
        return {
          isValid: false,
          message:
            "Please enter a valid WhatsApp number. If outside India, include country code.\nकृपया सही WhatsApp नंबर भरें।",
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
          message:
            "Please enter state / province / region.\nकृपया राज्य / प्रांत / क्षेत्र भरें।",
        };
      }

      if (!formData.country.trim()) {
        return {
          isValid: false,
          message: "Please select country.\nकृपया देश चुनें।",
        };
      }

      if (!formData.pinCode.trim()) {
        return {
          isValid: false,
          message:
            "Please enter postal / ZIP code.\nकृपया पोस्टल / ज़िप कोड भरें।",
        };
      }

      if (formData.pinCode.trim().length < 3) {
        return {
          isValid: false,
          message:
            "Please enter a valid postal / ZIP code.\nकृपया सही पोस्टल / ज़िप कोड भरें।",
        };
      }
    }

    if (currentStep === 3) {
      if (formData.maritalStatus === "Married") {
        if (!formData.spouseName.trim()) {
          return {
            isValid: false,
            message:
  "Please enter husband / wife name.\nकृपया पति / पत्नी का नाम भरें।",
          };
        }
      } else {
        if (!formData.fatherName.trim()) {
          return {
            isValid: false,
            message: "Please enter father's name.\nकृपया पिता का नाम भरें।",
          };
        }

        if (!formData.motherName.trim()) {
          return {
            isValid: false,
            message: "Please enter mother's name.\nकृपया माता का नाम भरें।",
          };
        }
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

      const familyMobileDigits = formData.familyMobile.replace(/\D/g, "");

      if (familyMobileDigits.length < 7 || familyMobileDigits.length > 15) {
        return {
          isValid: false,
          message:
            "Please enter a valid family member mobile number. If outside India, include country code.\nकृपया सही परिवार सदस्य मोबाइल नंबर भरें।",
        };
      }
      if (!formData.parentVideoProofStatus.trim()) {
        return {
          isValid: false,
          message:
            "Please select parent video approval proof status.\nकृपया माता-पिता वीडियो सहमति प्रमाण की स्थिति चुनें।",
        };
      }
      
      if (
        formData.parentVideoProofStatus !== "Both Parents" &&
        !formData.parentVideoProofReason.trim()
      ) {
        return {
          isValid: false,
          message:
            "Please enter reason/details for missing parent video proof.\nकृपया missing parent video proof का कारण लिखें।",
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
          message: "Please enter ID number.\nकृपया पहचान नंबर भरें।",
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
  async function handleSubmit() {
    if (isSubmitting) return;
  
    const finalValidation = validateStep(5);
  
    if (!finalValidation.isValid) {
      alert(finalValidation.message);
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
          alert("Aadhaar / ID upload error: " + uploadError.message);
          setIsSubmitting(false);
          return;
        }
  
        const { data: publicUrlData } = supabase.storage
          .from("aadhaar-documents")
          .getPublicUrl(filePath);
  
        aadhaarFileUrl = publicUrlData.publicUrl;
        aadhaarFileName = formData.aadhaarFile.name;
      }
  
      const { data, error } = await supabase.rpc("submit_registration_request", {
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
        p_country: formData.country,
        p_pin_code: formData.pinCode,
        p_spouse_name:
          formData.maritalStatus === "Married" ? formData.spouseName : "",
        p_father_name:
          formData.maritalStatus !== "Married" ? formData.fatherName : "",
        p_mother_name:
          formData.maritalStatus !== "Married" ? formData.motherName : "",
        p_family_name: formData.familyName,
        p_family_relation: formData.familyRelation,
        p_family_mobile: formData.familyMobile,
p_parent_video_proof_status: formData.parentVideoProofStatus,
p_parent_video_proof_reason: formData.parentVideoProofReason,
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
  
        alert("Registration request error: " + error.message);
        setIsSubmitting(false);
        return;
      }
  
      const result = Array.isArray(data) ? data[0] : data;
  
      router.push(
        `/success?mode=request&date=${encodeURIComponent(
          result?.requested_meeting_date || selectedSlot?.slot_date || ""
        )}&time=${encodeURIComponent(
          result?.requested_meeting_time || selectedSlot?.slot_time || ""
        )}`
      );
    } catch (error) {
      alert("Unexpected error. Please try again.");
      console.error(error);
      setIsSubmitting(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#fff8ed] px-4 py-6 text-[#2d2418] md:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 rounded-3xl bg-white p-5 text-center shadow-sm md:p-8">
          <div className="mx-auto mb-4 w-24">
            <Image
              src="/logo.png"
              alt="Diksha Logo"
              width={250}
              height={250}
              className="h-auto w-full"
              priority
            />
          </div>

          <h1 className="text-3xl font-extrabold md:text-4xl">
            Diksha Registration
          </h1>
          <h2 className="mt-2 text-2xl font-bold text-orange-800">
            दीक्षा पंजीकरण
          </h2>
          <p className="mt-3 text-sm text-stone-600">
            Please fill the registration form carefully. International address
            and phone numbers are supported.
          </p>
          <p className="text-sm text-stone-600">
            कृपया फॉर्म ध्यान से भरें। भारत और विदेश दोनों के पते स्वीकार हैं।
          </p>
        </header>

        <div className="mb-6 rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-sm font-bold text-stone-600">
            <span>
              Step {step} of {totalSteps}
            </span>
            <span>{Math.round((step / totalSteps) * 100)}%</span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-orange-100">
            <div
              className="h-full rounded-full bg-orange-700 transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <form>
          {step === 1 && (
            <StepCard
              titleEn="Personal Details"
              titleHi="व्यक्तिगत जानकारी"
              subtitleEn="Please enter candidate details."
              subtitleHi="कृपया उम्मीदवार की जानकारी भरें।"
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
                  ["Divorced", "Divorced / तलाकशुदा"],
                ]}
              />
            </StepCard>
          )}

          {step === 2 && (
            <StepCard
              titleEn="Contact & International Address"
              titleHi="संपर्क और अंतरराष्ट्रीय पता"
              subtitleEn="Indian and international addresses are accepted."
              subtitleHi="भारत और विदेश दोनों के पते स्वीकार हैं।"
            >
              <InputField
                labelEn="Mobile Number"
                labelHi="मोबाइल नंबर"
                name="mobile"
                type="tel"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="+91 9876543210 / +1 2125551234"
                required
              />

              <div className="rounded-2xl bg-orange-50 p-4">
                <label className="flex items-center gap-3 text-sm font-bold text-stone-700">
                  <input
                    type="checkbox"
                    name="sameWhatsapp"
                    checked={formData.sameWhatsapp}
                    onChange={handleChange}
                    className="h-5 w-5"
                  />
                  WhatsApp same as mobile / WhatsApp मोबाइल जैसा ही है
                </label>
              </div>

              <InputField
                labelEn="WhatsApp Number"
                labelHi="WhatsApp नंबर"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+91 9876543210 / +1 2125551234"
                required
              />

              <TextareaField
                labelEn="Full Address"
                labelHi="पूरा पता"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House number, street, area"
                required
              />

              <InputField
                labelEn="City"
                labelHi="शहर"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
                required
              />

              <InputField
                labelEn="State / Province / Region"
                labelHi="राज्य / प्रांत / क्षेत्र"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Punjab, California, Ontario, etc."
                required
              />

              <SelectField
                labelEn="Country"
                labelHi="देश"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                options={[
                  ["India", "India / भारत"],
                  ["United States", "United States / अमेरिका"],
                  ["Canada", "Canada / कनाडा"],
                  ["United Kingdom", "United Kingdom / यूके"],
                  ["Australia", "Australia / ऑस्ट्रेलिया"],
                  ["New Zealand", "New Zealand / न्यूज़ीलैंड"],
                  ["Germany", "Germany / जर्मनी"],
                  ["France", "France / फ्रांस"],
                  ["Italy", "Italy / इटली"],
                  ["Spain", "Spain / स्पेन"],
                  ["United Arab Emirates", "United Arab Emirates / यूएई"],
                  ["Singapore", "Singapore / सिंगापुर"],
                  ["Malaysia", "Malaysia / मलेशिया"],
                  ["Other", "Other / अन्य"],
                ]}
              />

<div>
  <InputField
    labelEn="Postal / ZIP Code"
    labelHi="पोस्टल / ज़िप कोड"
    name="pinCode"
    value={formData.pinCode}
    onChange={handleChange}
    placeholder="143001, 10001, SW1A 1AA, etc."
    required
  />

  {formData.country === "India" &&
    (isPincodeLoading || pincodeMessage) && (
      <p className="mt-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-800">
        {isPincodeLoading ? "Fetching address..." : pincodeMessage}
      </p>
    )}
</div>
            </StepCard>
          )}

          {step === 3 && (
            <StepCard
              titleEn="Family Approval Information"
              titleHi="परिवार की स्वीकृति जानकारी"
              subtitleEn="Please provide family approval details based on marital status."
              subtitleHi="कृपया वैवाहिक स्थिति के अनुसार परिवार की स्वीकृति जानकारी भरें।"
            >
              {formData.maritalStatus === "Married" ? (
                <InputField
                  labelEn="Husband / Wife Name"
                  labelHi="पति / पत्नी का नाम"
                  name="spouseName"
                  value={formData.spouseName}
                  onChange={handleChange}
                  placeholder="Enter husband / wife name"
                  required
                />
              ) : (
                <>
                  <InputField
                    labelEn="Father's Name"
                    labelHi="पिता का नाम"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Enter father's name"
                    required
                  />

                  <InputField
                    labelEn="Mother's Name"
                    labelHi="माता का नाम"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    placeholder="Enter mother's name"
                    required
                  />
                </>
              )}

              <div className="rounded-2xl bg-orange-50 p-4 text-sm text-stone-700">
                <p className="font-bold">
                Present Family Representative Details
                </p>
                <p className="mt-1">
                उपस्थित पारिवारिक प्रतिनिधि की जानकारी
                </p>
              </div>

              <InputField
                labelEn="Present Family Representative Name"
labelHi="उपस्थित पारिवारिक प्रतिनिधि का नाम"
                name="familyName"
                value={formData.familyName}
                onChange={handleChange}
                placeholder="Enter family member name"
                required
              />

              <SelectField
                labelEn="Present Family Representative Relation"
labelHi="उपस्थित पारिवारिक प्रतिनिधि से संबंध"
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
                  ["Friend", "Friend / मित्र"],
                  ["Other", "Other / अन्य"],
                ]}
              />

              <InputField
               labelEn="Present Family Representative Mobile"
labelHi="उपस्थित पारिवारिक प्रतिनिधि का मोबाइल नंबर"
                name="familyMobile"
                type="tel"
                value={formData.familyMobile}
                onChange={handleChange}
                placeholder="+91 9876543210 / +1 2125551234"
                required
              />
              <div className="rounded-2xl bg-orange-50 p-4 text-sm text-stone-700">
  <p className="font-bold">
    Parent Video Approval Proof
  </p>
  <p className="mt-1">
    माता-पिता वीडियो सहमति प्रमाण
  </p>
</div>

<SelectField
  labelEn="Video Proof Present For"
  labelHi="वीडियो प्रमाण किसका उपलब्ध है"
  name="parentVideoProofStatus"
  value={formData.parentVideoProofStatus}
  onChange={handleChange}
  required
  options={[
    ["", "Select video proof status"],
    ["Both Parents", "Both Mother & Father / माता और पिता दोनों"],
    ["Mother Only", "Mother Only / केवल माता"],
    ["Father Only", "Father Only / केवल पिता"],
    ["None", "No Video Proof / कोई वीडियो प्रमाण नहीं"],
  ]}
/>

{formData.parentVideoProofStatus &&
  formData.parentVideoProofStatus !== "Both Parents" && (
    <TextareaField
      labelEn="Missing Video Proof Reason"
      labelHi="वीडियो प्रमाण न होने का कारण"
      name="parentVideoProofReason"
      value={formData.parentVideoProofReason}
      onChange={handleChange}
      placeholder="Example: Father is not available, mother video approval shown."
      required
    />
  )}
            </StepCard>
          )}

          {step === 4 && (
            <StepCard
              titleEn="Identity Proof"
              titleHi="पहचान प्रमाण"
              subtitleEn="Upload Aadhaar or any valid government ID."
              subtitleHi="आधार या कोई मान्य सरकारी पहचान प्रमाण अपलोड करें।"
            >
              <SelectField
                labelEn="ID Type"
                labelHi="पहचान प्रमाण का प्रकार"
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                required
                options={[
                  ["aadhaar", "Aadhaar / आधार"],
                  ["passport", "Passport / पासपोर्ट"],
                  ["driving_license", "Driving License / ड्राइविंग लाइसेंस"],
                  ["voter_id", "Voter ID / वोटर आईडी"],
                  ["other", "Other Government ID / अन्य सरकारी पहचान"],
                ]}
              />

              <InputField
                labelEn="ID Number"
                labelHi="पहचान नंबर"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder="Enter ID number"
                required
              />

              <FileField
                labelEn="Upload Aadhaar / ID Proof"
                labelHi="आधार / पहचान प्रमाण अपलोड करें"
                name="aadhaarFile"
                onChange={handleChange}
                required
              />

              {formData.aadhaarFile && (
                <div className="rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
                  Selected file: {formData.aadhaarFile.name}
                </div>
              )}
            </StepCard>
          )}

          {step === 5 && (
            <StepCard
              titleEn="Select Appointment Date"
              titleHi="अपॉइंटमेंट तारीख चुनें"
              subtitleEn="Please choose one available date for final meeting."
              subtitleHi="कृपया फाइनल मीटिंग के लिए एक उपलब्ध तारीख चुनें।"
            >
              {isLoadingSlots ? (
                <div className="rounded-2xl bg-orange-50 p-6 text-center font-bold text-stone-700">
                  Loading available dates...
                </div>
              ) : slots.length === 0 ? (
                <div className="rounded-2xl bg-red-50 p-6 text-center font-bold text-red-700">
                  No appointment dates available right now.
                </div>
              ) : (
                <>
                  <SelectField
                    labelEn="Month"
                    labelHi="महीना"
                    name="selectedMonth"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    options={monthOptions.map(([value, label]) => [
                      value,
                      label,
                    ])}
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    {visibleSlots.map((slot) => {
                      const isFull =
                        slot.current_count >= slot.capacity ||
                        slot.status === "full";
                      const isSelected = formData.selectedSlotId === slot.id;
                      const seatsLeft = slot.capacity - slot.current_count;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isFull}
                          onClick={() => selectSlot(slot.id)}
                          className={`rounded-2xl border p-5 text-left transition ${
                            isSelected
                              ? "border-orange-700 bg-orange-100"
                              : "border-orange-100 bg-white"
                          } ${
                            isFull
                              ? "cursor-not-allowed opacity-50"
                              : "hover:border-orange-400"
                          }`}
                        >
                          <p className="text-lg font-extrabold">
                            {formatDate(slot.slot_date)}
                          </p>
                          <p className="mt-1 text-sm font-bold text-stone-600">
                            {slot.slot_time}
                          </p>

                          <p
                            className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                              isFull
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {isFull ? "Full / भरा हुआ" : `${seatsLeft} seats left`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </StepCard>
          )}

          {step === 6 && (
            <StepCard
              titleEn="Review & Submit"
              titleHi="जांचें और जमा करें"
              subtitleEn="Please verify details before final submission."
              subtitleHi="जमा करने से पहले कृपया जानकारी जांच लें।"
            >
              <div className="grid gap-3">
                <ReviewRow label="Name / नाम" value={formData.fullName} />
                <ReviewRow
                  label="Age / Gender"
                  value={`${formData.age} / ${formData.gender}`}
                />
                <ReviewRow
                  label="Mobile / मोबाइल"
                  value={formData.mobile}
                />
                <ReviewRow
                  label="WhatsApp"
                  value={formData.whatsapp}
                />
                <ReviewRow
                  label="Address / पता"
                  value={`${formData.address}, ${formData.city}, ${formData.state}, ${formData.country} - ${formData.pinCode}`}
                />
                <ReviewRow
                  label="Family Approval / परिवार स्वीकृति"
                  value={
                    formData.maritalStatus === "Married"
                      ? `Husband / Wife: ${formData.spouseName}`
                      : `Father: ${formData.fatherName}, Mother: ${formData.motherName}`
                  }
                />
                <ReviewRow
                  label="Family Contact / परिवार संपर्क"
                  value={`${formData.familyName} (${formData.familyRelation}) - ${formData.familyMobile}`}
                />
                <ReviewRow
  label="Parent Video Proof / माता-पिता वीडियो प्रमाण"
  value={
    formData.parentVideoProofStatus === "Both Parents"
      ? "Both Mother & Father video proof present"
      : `${formData.parentVideoProofStatus || "-"}${
          formData.parentVideoProofReason
            ? ` - ${formData.parentVideoProofReason}`
            : ""
        }`
  }
/>
                <ReviewRow
                  label="ID Proof / पहचान प्रमाण"
                  value={`${formData.idType} - ${formData.idNumber}`}
                />
                <ReviewRow
                  label="Appointment / अपॉइंटमेंट"
                  value={
                    selectedSlot
                      ? `${formatDate(selectedSlot.slot_date)} - ${
                          selectedSlot.slot_time
                        }`
                      : "-"
                  }
                />
              </div>

              <TextareaField
                labelEn="Filled By / Remarks"
                labelHi="फॉर्म भरने वाला / टिप्पणी"
                name="remarksBy"
                value={formData.remarksBy}
                onChange={handleChange}
                placeholder="Self / Sadhak name / remarks"
              />
            </StepCard>
          )}

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={isSubmitting}
                className="rounded-2xl border border-orange-300 px-6 py-4 font-bold text-orange-800 disabled:opacity-60 md:w-1/2"
              >
                Back
                <span className="block text-sm font-normal">पीछे जाएं</span>
              </button>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="rounded-2xl bg-orange-700 px-6 py-4 font-bold text-white md:flex-1"
              >
                Continue
                <span className="block text-sm font-normal">आगे बढ़ें</span>
              </button>
            ) : (
              <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-2xl bg-orange-700 px-6 py-4 font-bold text-white disabled:opacity-60 md:flex-1"
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
    </main>
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
    <section className="rounded-3xl bg-white p-5 shadow-sm md:p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-extrabold">{titleEn}</h3>
        <h4 className="mt-1 text-xl font-bold text-orange-800">{titleHi}</h4>
        <p className="mt-2 text-sm text-stone-600">{subtitleEn}</p>
        <p className="text-sm text-stone-600">{subtitleHi}</p>
      </div>

      <div className="grid gap-5">{children}</div>
    </section>
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
}: {
  labelEn: string;
  labelHi: string;
  name: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block font-bold">
        {labelEn} {required && <span className="text-red-600">*</span>}
        <span className="block text-sm font-semibold text-orange-800">
          {labelHi}
        </span>
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
      />
    </div>
  );
}

function TextareaField({
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
  onChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block font-bold">
        {labelEn} {required && <span className="text-red-600">*</span>}
        <span className="block text-sm font-semibold text-orange-800">
          {labelHi}
        </span>
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-2xl border border-orange-200 px-4 py-3 outline-none focus:border-orange-600"
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
  onChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  options: string[][];
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block font-bold">
        {labelEn} {required && <span className="text-red-600">*</span>}
        <span className="block text-sm font-semibold text-orange-800">
          {labelHi}
        </span>
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

function FileField({
  labelEn,
  labelHi,
  name,
  onChange,
  required = false,
}: {
  labelEn: string;
  labelHi: string;
  name: string;
  onChange: (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block font-bold">
        {labelEn} {required && <span className="text-red-600">*</span>}
        <span className="block text-sm font-semibold text-orange-800">
          {labelHi}
        </span>
      </label>
      <input
        type="file"
        name={name}
        onChange={onChange}
        accept=".jpg,.jpeg,.png,.pdf"
        className="w-full rounded-2xl border border-orange-200 bg-white px-4 py-3 outline-none focus:border-orange-600"
      />
      <p className="mt-2 text-xs text-stone-500">
        Accepted: JPG, PNG, PDF
      </p>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-orange-50 p-4">
      <p className="text-sm font-bold text-stone-500">{label}</p>
      <p className="mt-1 font-bold text-stone-800">{value || "-"}</p>
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

function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}