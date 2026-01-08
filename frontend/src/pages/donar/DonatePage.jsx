import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    UploadCloud, X as CloseIcon, Image as ImageIcon, Info, Loader2, Send, HelpCircle,
    Type, Activity, CheckCircle, AlertCircle, ArrowLeft, RefreshCw, FileText, // FileText is included
    Pill, Hash as HashIcon, CalendarClock, Box
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";


// --- Helper Components ---
const LoadingSpinner = ({ text = "Processing..." }) => (
    <div className="flex justify-center items-center text-indigo-600">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>{text}</span>
    </div>
);
const AlertMessage = ({ message, type = "error" }) => {
    const isError = type === "error";
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`p-4 mb-4 text-sm rounded-lg border ${
                isError
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-green-50 border-green-200 text-green-800"
            }`}
            role="alert"
        >
            <div className="flex items-center">
                {isError ? <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> : <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
                <span className="font-medium">{message}</span>
            </div>
        </motion.div>
    );
};
// --- End Helpers ---
// Simple Input Field component with icon (Copied from ProfilePage)
const InputField = ({ icon: Icon, label, id, name, type = "text", value, onChange, required = false, placeholder = "", maxLength, disabled = false, isOptional = false }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
      {isOptional && <span className="text-xs text-gray-500 ml-1">(Optional)</span>}
    </label>
    <div className="relative rounded-md shadow-sm">
      {Icon && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
      )}
      <input
        type={type} id={id} name={name} value={value || ""}
        onChange={onChange} required={required} placeholder={placeholder}
        maxLength={maxLength} disabled={disabled}
        className={`block w-full border border-gray-300 rounded-lg py-2.5 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out ${
          Icon ? "pl-11" : "pl-4"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      />
    </div>
  </div>
);
// --- Configuration ---
// Read API URLs using process.env for Create React App
const NODE_API_BASE_URL = "http://localhost:5001/api"; // e.g., http://localhost:5001/api
const FLASK_API_URL = import.meta.env.REACT_APP_AI_SERVICE_URL || "http://localhost:5002";

const DEVICE_TYPES = ['wheelchair', 'crutches', 'oxygen_cylinder', 'other_device'];
const CONDITIONS = ['new', 'good', 'fair', 'needs_repair'];
const DONATION_TYPES = ['device', 'medicine'];

const DonatePage = () => { // Renamed component
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // --- State Variables ---
    const [donationType, setDonationType] = useState(null); // 'device' or 'medicine'
    const [step, setStep] = useState(0); // 0: Type Select, 1: Upload, 2: Validate, 3: Details, 4: Submit
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [aiValidationResult, setAiValidationResult] = useState(null);
    const [isAiValidating, setIsAiValidating] = useState(false);
    const [aiValidationError, setAiValidationError] = useState('');
    // Device details
    const [deviceType, setDeviceType] = useState('');
    const [deviceDescription, setDeviceDescription] = useState('');
    const [deviceCondition, setDeviceCondition] = useState('');
    // Medicine details
    const [medicineName, setMedicineName] = useState('');
    const [medicineQuantity, setMedicineQuantity] = useState('');
    const [medicineStrength, setMedicineStrength] = useState('');
    // Submission state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');

    // Reset state when donation type changes
    useEffect(() => {
        // Only reset if donationType is not null (i.e., after initial selection)
        if (donationType !== null) {
            resetFormPartial(); // Reset fields but keep donationType and step 1
        }
    }, [donationType]);

    // Partial reset function (keeps donationType)
    const resetFormPartial = () => {
        setStep(1); // Go back to upload step for the selected type
        setImageFile(null); setImagePreview(null); setAiValidationResult(null);
        setIsAiValidating(false); setAiValidationError(''); setDeviceType('');
        setDeviceDescription(''); setDeviceCondition(''); setMedicineName('');
        setMedicineQuantity(''); setMedicineStrength(''); setIsSubmitting(false);
        setSubmitError(''); setSubmitSuccess('');
        if (fileInputRef.current) { fileInputRef.current.value = ""; }
    }
     // Full reset function (goes back to type selection)
     const resetFormFull = () => {
        setDonationType(null); // Go back to type selection
        setStep(0);
        resetFormPartial(); // Reset the rest of the fields
    };


    // --- Handlers ---
    const handleTypeSelect = (type) => {
        setDonationType(type);
        setStep(1); // Move to upload step
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => { setImagePreview(reader.result); };
            reader.readAsDataURL(file);
            // Clear previous results/errors, stay on upload step
            setAiValidationError(''); setAiValidationResult(null); setStep(1);
        } else {
            setImageFile(null); setImagePreview(null);
            setAiValidationError("Please select a valid image file.");
        }
    };

    const triggerFileInput = () => { fileInputRef.current?.click(); };

    // Simpler reset - just clears image and goes back to upload view
    const resetImage = () => {
        setImageFile(null); setImagePreview(null); setAiValidationResult(null);
        setAiValidationError(''); setIsAiValidating(false);
        if (fileInputRef.current) { fileInputRef.current.value = ""; }
        setStep(1); // Go back to upload step view
    };

    const handleValidateImage = async () => {
        if (!imageFile || !donationType) return;
        setIsAiValidating(true); setAiValidationError(''); setAiValidationResult(null); setStep(2);
        const formData = new FormData();
        formData.append('image', imageFile);

        const endpoint = donationType === 'device' ? `${FLASK_API_URL}/predict` : `${FLASK_API_URL}/check-expiry`;

        try {
            const res = await axios.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' },  timeout: 60000 ,});
            console.log(`AI Validation Response (${donationType}):`, res.data);

            if (donationType === 'device') {
                if (res.data.predictions && res.data.predictions.length > 0) {
                    const topPrediction = res.data.predictions.reduce((max, p) => (p.confidence > max.confidence ? p : max), res.data.predictions[0]);
                    setAiValidationResult({ predictedClass: topPrediction.class, confidence: topPrediction.confidence });
                    if (topPrediction.confidence > 0.7 && DEVICE_TYPES.includes(topPrediction.class)) { setDeviceType(topPrediction.class); } else { setDeviceType(''); }
                } else {
                    setAiValidationResult({ predictedClass: 'unknown', confidence: 0 });
                    setAiValidationError("AI couldn't detect a device. Select manually."); setDeviceType('other_device');
                }
            } else { // Medicine expiry check
                setAiValidationResult({
                    expiryText: res.data.expiry_text_detected, isValid: res.data.is_valid,
                    parsedDate: res.data.parsed_expiry_date, ocrText: res.data.full_ocr_text
                });
                if (res.data.is_valid === false) { setAiValidationError("AI detected the medicine might be expired. Please double-check."); }
                else if (res.data.is_valid === null && res.data.expiry_text_detected) { setAiValidationError("AI found expiry text but couldn't parse. Verify manually."); }
                else if (!res.data.expiry_text_detected) { setAiValidationError("AI couldn't detect expiry date. Check image or enter manually if known."); }
            }
            setStep(3); // Move to details step

        } catch (err) {
            console.error(`AI validation failed (${donationType}):`, err);
            const errorMsg = err.response?.data?.error || `AI ${donationType === 'device' ? 'prediction' : 'expiry check'} service failed/timed out.`;
            setAiValidationError(`${errorMsg} You can proceed manually.`);
            setAiValidationResult({ error: errorMsg }); setStep(3); // Allow proceeding
        } finally { setIsAiValidating(false); }
    };

    const handleSubmitDonation = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); setSubmitError(''); setSubmitSuccess(''); setStep(4);
        const formData = new FormData();
        formData.append('image', imageFile);

        let nodeApiUrl = '';
        let isValidSubmission = false;

        if (donationType === 'device') {
             if (!deviceType || !deviceDescription || !deviceCondition) {
                 setSubmitError("Missing required device details."); setIsSubmitting(false); setStep(3); return;
             }
             formData.append('itemType', 'device'); formData.append('deviceType', deviceType);
             formData.append('description', deviceDescription); formData.append('condition', deviceCondition);
             nodeApiUrl = `${NODE_API_BASE_URL}/donations/device`;
             isValidSubmission = true;
        } else if (donationType === 'medicine') {
             if (!medicineName || !medicineQuantity) {
                 setSubmitError("Missing Medicine Name or Quantity."); setIsSubmitting(false); setStep(3); return;
             }
             // Optional: Block submission based on AI expiry check
             // if (aiValidationResult?.isValid === false) {
             //    setSubmitError("Cannot submit donation: AI detected the medicine is expired.");
             //    setIsSubmitting(false); setStep(3); return;
             // }
             formData.append('itemType', 'medicine'); formData.append('medicineName', medicineName);
             formData.append('quantity', medicineQuantity);
             if (medicineStrength) formData.append('strength', medicineStrength);
             if (aiValidationResult) {
                formData.append('aiExpiryText', aiValidationResult.expiryText || '');
                formData.append('aiExpiryValid', aiValidationResult.isValid !== null ? String(aiValidationResult.isValid) : '');
                formData.append('aiParsedDate', aiValidationResult.parsedDate || '');
             }
             // Ensure this endpoint exists in Node.js
             nodeApiUrl = `${NODE_API_BASE_URL}/donations/medicine`;
             isValidSubmission = true;
        }

        if (!isValidSubmission || !nodeApiUrl) {
             setSubmitError("Invalid donation type or configuration."); setIsSubmitting(false); setStep(3); return;
        }

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
            const res = await axios.post(nodeApiUrl, formData, config);
            setSubmitSuccess("Donation submitted! Thank you. ✨ Redirecting...");
            setTimeout(() => { resetFormFull(); navigate('/donor-dashboard'); }, 3000); // Use full reset
        } catch (err) {
            console.error("Donation submission failed:", err);
            setSubmitError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || "Failed to submit donation.");
            setStep(3); // Return to details step on error
        } finally { setIsSubmitting(false); } // Stop loading indicator immediately
    };

    const stepVariants = { /* ... same animation ... */ };

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12 md:py-16">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                 <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-2"> Add New Donation </h1>
                 <p className="text-center text-gray-600 mb-8 md:mb-12"> Choose donation type and follow the steps. </p>
            </motion.div>

            {/* Main Content Area */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl border border-gray-100 overflow-hidden min-h-[450px]"> {/* Increased min-height */}
                <AnimatePresence mode="wait">

                    {/* Step 0: Type Selection */}
                    {step === 0 && (
                        <motion.div key="step0" variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }} className="text-center">
                            <h2 className="text-xl font-semibold text-gray-700 mb-6">What would you like to donate?</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Device Button */}
                                <motion.button whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => handleTypeSelect('device')} className="flex flex-col items-center justify-center p-8 border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                    <HelpCircle className="w-12 h-12 text-indigo-500 mb-3"/>
                                    <span className="font-semibold text-lg text-gray-800">Medical Device</span>
                                    <span className="text-sm text-gray-500 mt-1">(Wheelchair, Crutches, etc.)</span>
                                </motion.button>
                                {/* Medicine Button */}
                                <motion.button whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }} onClick={() => handleTypeSelect('medicine')} className="flex flex-col items-center justify-center p-8 border-2 border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                                    <Pill className="w-12 h-12 text-emerald-500 mb-3"/>
                                    <span className="font-semibold text-lg text-gray-800">Medicine</span>
                                    <span className="text-sm text-gray-500 mt-1">(Tablets, Syrups, etc.)</span>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 1: Image Upload */}
                    {step === 1 && donationType && (
                        <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                            {/* Header with back button */}
                            <div className="flex justify-between items-center mb-4">
                               <h2 className="text-xl font-semibold text-gray-700 flex items-center"> <ImageIcon className="w-5 h-5 mr-2 text-indigo-600"/> Step 1: Upload Image (<span className="capitalize">{donationType}</span>) </h2>
                               <button onClick={resetFormFull} className="text-xs text-gray-500 hover:text-indigo-600 font-medium inline-flex items-center"> <ArrowLeft className="w-3 h-3 mr-1"/> Back to Type Selection </button>
                            </div>
                            {aiValidationError && <AlertMessage message={aiValidationError} type="error" />}
                            {/* Image Preview / Dropzone */}
                            {imagePreview ? (
                                <div className="mb-4 text-center"> {/* Preview Div */}
                                    <img src={imagePreview} alt="Preview" className="max-h-60 w-auto inline-block rounded-lg border border-gray-200 shadow-sm" />
                                    <div className="mt-4 flex justify-center space-x-4"> {/* Buttons under preview */}
                                        <button onClick={resetImage} className="text-sm text-red-600 hover:text-red-800 font-medium inline-flex items-center px-3 py-1.5 rounded-md border border-red-200 hover:bg-red-50 transition"> <RefreshCw className="w-4 h-4 mr-1"/> Change </button>
                                        <button onClick={handleValidateImage} disabled={isAiValidating} className="px-5 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm disabled:opacity-50 inline-flex items-center"> <CheckCircle className="w-4 h-4 mr-1.5"/> Validate & Proceed </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition duration-150 ease-in-out" onClick={triggerFileInput} onDrop={(e) => { e.preventDefault(); handleImageChange({ target: { files: e.dataTransfer.files } }); }} onDragOver={(e) => e.preventDefault()}> {/* Dropzone Div */}
                                    <div className="space-y-1 text-center"> <UploadCloud className="mx-auto h-12 w-12 text-gray-400" /> <div className="flex text-sm text-gray-600 justify-center"> <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"> <span>Upload a file</span> <input ref={fileInputRef} id="file-upload" name="image" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" /> </label> <p className="pl-1">or drag and drop</p> </div> <p className="text-xs text-gray-500"> PNG, JPG, GIF up to 5MB </p> </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 2: AI Validating */}
                    {step === 2 && ( <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }} className="text-center py-10"> <LoadingSpinner text={`Validating ${donationType}...`} /> <p className="text-sm text-gray-500 mt-2">This may take a few seconds.</p> {imagePreview && <img src={imagePreview} alt="Validating" className="max-h-40 w-auto inline-block rounded-lg border border-gray-200 shadow-sm mt-4 opacity-50" />} </motion.div> )}

                    {/* Step 3: Fill Details */}
                    {step === 3 && donationType && (
                        <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }}>
                            {/* Header with back button */}
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-xl font-semibold text-gray-700 flex items-center"> <Info className="w-5 h-5 mr-2 text-indigo-600"/> Step 2: Provide Details (<span className="capitalize">{donationType}</span>) </h2>
                                <button onClick={resetImage} className="text-xs text-gray-500 hover:text-indigo-600 font-medium inline-flex items-center"> <ArrowLeft className="w-3 h-3 mr-1"/> Change Image </button>
                            </div>

                            {/* AI Result Display */}
                            <AnimatePresence>
                                {aiValidationError && <AlertMessage message={aiValidationError} type="error" />}
                                {aiValidationResult && donationType === 'device' && ( /* Device Result */
                                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className={`p-4 mb-5 rounded-lg border ${aiValidationResult.confidence > 0.7 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                        <p className="text-sm font-medium flex items-center ${aiValidationResult.confidence > 0.7 ? 'text-green-800' : 'text-yellow-800'}"> {aiValidationResult.confidence > 0.7 ? <CheckCircle className="w-4 h-4 mr-2"/> : <HelpCircle className="w-4 h-4 mr-2"/>} AI Prediction: <strong className="ml-1 capitalize">{aiValidationResult.predictedClass || 'Unknown'}</strong> <span className="ml-2 text-xs">({(aiValidationResult.confidence * 100).toFixed(1)}% confidence)</span> </p>
                                        {aiValidationResult.confidence <= 0.7 && <p className="text-xs mt-1 ${aiValidationResult.confidence > 0.7 ? 'text-green-700' : 'text-yellow-700'}">Confidence low. Please verify below.</p>}
                                    </motion.div>
                                )}
                                 {aiValidationResult && donationType === 'medicine' && ( /* Medicine Result */
                                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} className={`p-4 mb-5 rounded-lg border ${aiValidationResult.isValid === false ? 'bg-red-50 border-red-200' : (aiValidationResult.isValid === true ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200') }`}>
                                        <p className="text-sm font-medium flex items-center ${aiValidationResult.isValid === false ? 'text-red-800' : (aiValidationResult.isValid === true ? 'text-green-800' : 'text-yellow-800')}">
                                            {aiValidationResult.isValid === false ? <AlertCircle className="w-4 h-4 mr-2"/> : (aiValidationResult.isValid === true ? <CheckCircle className="w-4 h-4 mr-2"/> : <HelpCircle className="w-4 h-4 mr-2"/>)}
                                            Expiry Check:
                                            {aiValidationResult.expiryText ? <strong className="ml-1">{aiValidationResult.expiryText}</strong> : <span className="ml-1 italic">Not Detected</span>}
                                            {aiValidationResult.isValid === true && <span className="ml-2 text-xs">(Seems OK)</span>}
                                            {aiValidationResult.isValid === false && <span className="ml-2 text-xs font-semibold">(EXPIRED)</span>}
                                            {aiValidationResult.isValid === null && aiValidationResult.expiryText && <span className="ml-2 text-xs">(Couldn't parse)</span>}
                                        </p>
                                         {(aiValidationResult.isValid === false || aiValidationResult.isValid === null || !aiValidationResult.expiryText) && <p className="text-xs mt-1 ${aiValidationResult.isValid === false ? 'text-red-700' : 'text-yellow-700'}">Please double-check the expiry date. You can still submit the donation for review.</p>}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submission Feedback */}
                            {submitError && <AlertMessage message={submitError} type="error" />}
                            {submitSuccess && <AlertMessage message={submitSuccess} type="success" />}

                            {/* --- SUBMISSION FORM --- */}
                            <form onSubmit={handleSubmitDonation} className="space-y-5 mt-6">
                                {/* --- DEVICE FIELDS --- */}
                                {donationType === 'device' && (
                                    <>
                                        <div> <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center"> <Type className="h-5 w-5 text-gray-400 mr-2"/> Device Type <span className="text-red-500 ml-1">*</span> </label> <select id="deviceType" value={deviceType} onChange={(e) => setDeviceType(e.target.value)} required disabled={isSubmitting} className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"> <option value="" disabled>-- Select Device --</option> {DEVICE_TYPES.map((type) => ( <option key={type} value={type} className="capitalize">{type.replace('_', ' ')}</option> ))} </select> </div>
                                        <div> <label htmlFor="deviceDescription" className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center"> <FileText className="h-5 w-5 text-gray-400 mr-2" /> Description <span className="text-red-500 ml-1">*</span> </label> <textarea id="deviceDescription" name="description" rows="4" value={deviceDescription} onChange={(e) => setDeviceDescription(e.target.value)} required disabled={isSubmitting} className="block w-full border border-gray-300 rounded-lg shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition disabled:bg-gray-100 disabled:cursor-not-allowed" placeholder="Describe the item, including any minor issues or accessories." ></textarea> </div>
                                        <div> <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"> <Activity className="h-5 w-5 text-gray-400 mr-2"/> Condition <span className="text-red-500 ml-1">*</span> </label> <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"> {CONDITIONS.map((cond) => ( <div key={cond} className="relative"> <input type="radio" id={`condition-${cond}`} name="condition" value={cond} checked={deviceCondition === cond} onChange={(e) => setDeviceCondition(e.target.value)} required disabled={isSubmitting} className="sr-only peer"/> <label htmlFor={`condition-${cond}`} className="flex items-center justify-center p-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:border-indigo-600 peer-checked:ring-1 peer-checked:ring-indigo-600 peer-checked:text-indigo-600 transition duration-150 ease-in-out"> <span className="capitalize">{cond.replace('_', ' ')}</span> </label> </div> ))} </div> </div>
                                    </>
                                )}

                                {/* --- MEDICINE FIELDS --- */}
                                {donationType === 'medicine' && (
                                     <>
                                         <InputField icon={Pill} label="Medicine Name" id="medicineName" name="medicineName" value={medicineName} onChange={(e) => setMedicineName(e.target.value)} required placeholder="e.g., Paracetamol Tablets" disabled={isSubmitting} />
                                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <InputField icon={Box} label="Quantity" id="medicineQuantity" name="medicineQuantity" value={medicineQuantity} onChange={(e) => setMedicineQuantity(e.target.value)} required placeholder="e.g., 1 Strip, 1 Bottle" disabled={isSubmitting} />
                                            <InputField icon={HashIcon} label="Strength" id="medicineStrength" name="medicineStrength" value={medicineStrength} onChange={(e) => setMedicineStrength(e.target.value)} placeholder="e.g., 500mg, 10ml" disabled={isSubmitting} isOptional />
                                         </div>
                                         {/* Display detected expiry again */}
                                         {aiValidationResult?.expiryText && (
                                             <div className="text-sm p-3 bg-gray-50 rounded border border-gray-200">
                                                 <span className="font-medium text-gray-700 flex items-center"><CalendarClock className="w-4 h-4 mr-1.5 text-gray-500"/> Detected Expiry: </span>
                                                 <span className={`ml-1 ${aiValidationResult.isValid === false ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                                     {aiValidationResult.expiryText} {aiValidationResult.isValid === false ? '(Expired)' : (aiValidationResult.isValid === true ? '(OK)' : '(Unparsed)')}
                                                 </span>
                                             </div>
                                         )}
                                     </>
                                )}

                                {/* Submit Button */}
                                <div className="pt-5 border-t border-gray-200 mt-6">
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting || !imageFile /* || (donationType === 'medicine' && aiValidationResult?.isValid === false) */}
                                        className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                                    >
                                        {isSubmitting ? <LoadingSpinner text="Submitting Donation..." /> : ( <> <Send className="w-5 h-5 mr-2" /> Submit Donation </> )}
                                    </motion.button>
                                     {/* Optional message if submit is disabled due to expiry */}
                                     {/* {donationType === 'medicine' && aiValidationResult?.isValid === false && (
                                         <p className="text-xs text-red-600 text-center mt-2">Cannot submit: AI detected expired medicine.</p>
                                     )} */}
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* Step 4: Submitting */}
                    {step === 4 && ( <motion.div key="step4" variants={stepVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.3 }} className="text-center py-10"> <LoadingSpinner text="Submitting donation..." /> <p className="text-sm text-gray-500 mt-2">Please wait.</p> </motion.div> )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default DonatePage; 