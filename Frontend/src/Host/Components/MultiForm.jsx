import React, { useState } from "react";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6"; // Now Government ID
import Step7 from "./Step7"; // New Amenities step
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

const MultiForm = () => {
  const [searchParams] = useSearchParams();
  const formType = searchParams.get("type");
  const isBecomeAHost = formType === "become-a-host";
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [direction, setDirection] = useState("next");
  const totalSteps = isBecomeAHost ? 7 : 6; // Updated to 7 for become-a-host
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    street: "",
    city: "",
    province_id: "",
    zipCode: "",
    maxGuest: 1,
    bedrooms: 0,
    bathrooms: 0,
    kitchen: 0,
    images: [],
    latitude: 0,
    longitude: 0,
    amenities: [],
    govtId: { type: "", front: null, back: null },
  });

  const validateStep = (currentStep) => {
    let newErrors = {};

    switch (currentStep) {
      case 1: // Step 1: Basic Info (Property Details)
        if (!formData.title.trim()) {
          newErrors.title = "Title is required";
        } else if (formData.title.length < 3) {
          newErrors.title = "Title must be at least 3 characters";
        }
        if (!formData.description.trim()) {
          newErrors.description = "Description is required";
        } else if (formData.description.length < 10) {
          newErrors.description = "Description must be at least 10 characters";
        }
        if (!formData.price || formData.price <= 0) {
          newErrors.price = "Price must be greater than 0";
        }
        break;

      case 2: // Step 2: Location (address)
        if (!formData.street.trim()) {
          newErrors.street = "Street address is required";
        }
        if (!formData.city.trim()) {
          newErrors.city = "City is required";
        }
        if (!formData.province_id) {
          newErrors.province_id = "Please select a province";
        }
        if (!formData.zipCode.trim()) {
          newErrors.zipCode = "ZIP/Postal Code is required";
        } else if (!/^\d{5}$/.test(formData.zipCode)) {
          newErrors.zipCode = "ZIP/Postal Code must be 5 digits";
        }
        break;

      case 3: // Step 3: Property Features
        if (!formData.maxGuest || formData.maxGuest < 1) {
          newErrors.maxGuest = "Maximum guests must be at least 1";
        }
        if (formData.bedrooms < 0) {
          newErrors.bedrooms = "Bedrooms cannot be negative";
        }
        if (formData.bathrooms < 0) {
          newErrors.bathrooms = "Bathrooms cannot be negative";
        }
        if (formData.kitchen < 0) {
          newErrors.kitchen = "Kitchen count cannot be negative";
        }
        break;

      case 4: // Step 4: Location (map coordinates)
        if (!formData.latitude || formData.latitude === 0) {
          newErrors.latitude = "Please set a valid latitude";
        } else if (formData.latitude < -90 || formData.latitude > 90) {
          newErrors.latitude = "Latitude must be between -90 and 90";
        }
        if (!formData.longitude || formData.longitude === 0) {
          newErrors.longitude = "Please set a valid longitude";
        } else if (formData.longitude < -180 || formData.longitude > 180) {
          newErrors.longitude = "Longitude must be between -180 and 180";
        }
        break;

      case 5: // Step 5: Images
        if (formData.images.length === 0) {
          newErrors.images = "At least one image is required";
        } else if (formData.images.length < 5) {
          newErrors.images = "Please upload at least 5 images";
        }
        break;

      case 6: // Step 6: Amenities (new step)
        if (formData.amenities.length === 0) {
          newErrors.amenities = "Please select at least one amenity";
        }
        break;

      case 7: // Step 7: Government ID (only for become-a-host, shifted from Step 6)
        if (isBecomeAHost) {
          if (!formData.govtId.type) {
            newErrors.govtId_type = "Please select an ID type";
          }
          if (!formData.govtId.front) {
            newErrors.govtId_front = "Front image of ID is required";
          }
          if (formData.govtId.type === "citizenship" && !formData.govtId.back) {
            newErrors.govtId_back = "Back image of citizenship card is required";
          }
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    for (let i = 1; i <= totalSteps; i++) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("street", formData.street);
    data.append("city", formData.city);
    data.append("province_id", formData.province_id);
    data.append("zipCode", formData.zipCode);
    data.append("maxGuest", formData.maxGuest);
    data.append("bedrooms", formData.bedrooms);
    data.append("bathrooms", formData.bathrooms);
    data.append("kitchen", formData.kitchen);
    data.append("latitude", formData.latitude);
    data.append("longitude", formData.longitude);
    formData.amenities.forEach((amenity) => data.append("amenities[]", amenity));
    formData.images.forEach((image) => data.append("images", image));
    data.append("govtId_type", formData.govtId.type);
    if (formData.govtId.front) {
      data.append("govtId_front", formData.govtId.front);
    }
    if (formData.govtId.back) {
      data.append("govtId_back", formData.govtId.back);
    }

    const apiEndpoint = isBecomeAHost
      ? "http://localhost:8000/api/become-a-host"
      : "http://localhost:8000/api/properties";

    try {
      const response = await axios.post(apiEndpoint, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.status === 201) {
        if (isBecomeAHost) {
          navigate("/");
          alert("Success! Wait for approval");
        } else {
          alert("Success!");
          navigate("/hosting/property");
        }
      } else {
        alert("There was an error while adding product");
        console.log(response);
      }
    } catch (error) {
      console.error("Error during form submission:", error.response?.data || error.message);
      alert("Submission failed. Please check your input and try again.");
    }
  };

  const handleChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setDirection("next");
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setDirection("prev");
    setStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="max-h-full pb-20">
      <form onSubmit={handleSubmit}>
        <div className="max-w-3xl mx-auto pt-4 px-4 sm:px-6 lg:px-8">
          <div className={`transition-transform duration-300 ease-in-out`}>
            {step === 1 && (
              <Step1 formData={formData} handleChange={handleChange} errors={errors} />
            )}
            {step === 2 && (
              <Step2 formData={formData} handleChange={handleChange} errors={errors} />
            )}
            {step === 3 && (
              <Step3 formData={formData} handleChange={handleChange} errors={errors} />
            )}
            {step === 4 && (
              <Step4 formData={formData} handleChange={handleChange} errors={errors} />
            )}
            {step === 5 && (
              <Step5 formData={formData} handleChange={handleChange} errors={errors} />
            )}
            {step === 6 && (
              <Step6 formData={formData} handleChange={handleChange} errors={errors} />
            )}
            {isBecomeAHost && step === 7 && (
              <Step7 formData={formData} handleChange={handleChange} errors={errors} />
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 shadow-lg">
          <div className="w-full h-2 bg-gray-200">
            <div
              className="bg-blue-600 h-2 transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                step === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Back
            </button>

            <span className="text-sm text-gray-500">
              Step {step} of {totalSteps}
            </span>

            <button
              type={step === totalSteps ? "submit" : "button"}
              onClick={step === totalSteps ? undefined : nextStep}
              className={`px-6 py-3 rounded-lg font-medium text-white transition-all ${
                step === totalSteps
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {step === totalSteps ? "Submit Listing" : "Next"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MultiForm;