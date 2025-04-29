import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  AlertCircle,
  Upload,
  Camera,
  X,
  Loader2,
  CreditCard,
 
  User,
} from "lucide-react";

import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const BecomeHostForm = () => {
  const [formData, setFormData] = useState({
    profileImage: null,
    govtId: {
      type: "",
      front: null,
      back: null,
    },
    phoneNumber: "",
  });
  const [user, setUser] = useState({ profilePicture: null, phoneNumber: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState({
    profile: null,
    front: null,
    back: null,
  });
  const [errors, setErrors] = useState({});
  const userdata = useSelector((state) => state.user.user);
  const navigate = useNavigate(); 
  useEffect(() => {
    setUser({
      profilePicture: userdata.profileImage || "",
      phoneNumber: userdata.phoneNumber || "",
    });
  }, []);

  const handleInputChange = (field, value) => {
    setMessage("");
    setError("");
    setErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "govtId_type") {
      setFormData((prev) => ({
        ...prev,
        govtId: { ...prev.govtId, type: value },
      }));
      setSelectedImages((prev) => ({ ...prev, front: null, back: null }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleImageChange = (side, file) => {
    if (file) {
      const preview = URL.createObjectURL(file);
      setSelectedImages((prev) => ({ ...prev, [side]: { file, preview } }));
      if (side === "profile") {
        setFormData((prev) => ({ ...prev, profileImage: file }));
      } else {
        setFormData((prev) => ({
          ...prev,
          govtId: { ...prev.govtId, [side]: file },
        }));
      }
      setErrors((prev) => ({ ...prev, [`govtId_${side}`]: "" }));
    }
  };

  const removeImage = (side) => {
    if (selectedImages[side]) {
      URL.revokeObjectURL(selectedImages[side].preview);
    }
    setSelectedImages((prev) => ({ ...prev, [side]: null }));
    if (side === "profile") {
      setFormData((prev) => ({ ...prev, profileImage: null }));
    } else {
      setFormData((prev) => ({
        ...prev,
        govtId: { ...prev.govtId, [side]: null },
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Check if either an existing profile picture or a newly uploaded one exists
    if (!user.profilePicture && !formData.profileImage) {
      newErrors.profileImage = "Profile image is required";
    }
    if (!formData.govtId.type) {
      newErrors.govtId_type = "Government ID type is required";
    }
    if (!formData.govtId.front) {
      newErrors.govtId_front = "Government ID front image is required";
    }
    if (formData.govtId.type === "national_id" && !formData.govtId.back) {
      newErrors.govtId_back =
        "Government ID back image is required for National ID";
    }
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token missing");
      }

      const formDataToSend = new FormData();
      if (formData.profileImage) {
        formDataToSend.append("profileImage", formData.profileImage);
      }
      formDataToSend.append("govtId_front", formData.govtId.front);
      if (formData.govtId.back) {
        formDataToSend.append("govtId_back", formData.govtId.back);
      }
      formDataToSend.append("govtId_type", formData.govtId.type);
      formDataToSend.append("phoneNumber", formData.phoneNumber || user.phoneNumber);

      const response = await axios.post(
        "http://localhost:8000/api/become-a-host",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        // Navigate to /hosting
        navigate("/hosting");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "An error occurred during submission");
    } finally {
      setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Become a Host
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join our community and start hosting today!
          </p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className="mb-8 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg shadow-sm">
            <p>{message}</p>
          </div>
        )}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-6">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              Profile Information
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Profile Image Section */}
            <div className="space-y-4">
              <Label htmlFor="profileImage" className="text-base">
                Profile Photo{" "}
                {user.profilePicture ? "(Optional)" : "(Required)"}
              </Label>

              {user.profilePicture ? (
                <div className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg">
                  <img
                    src={
                      `http://localhost:8000/${user.profilePicture}` ||
                      "/placeholder.svg?height=64&width=64"
                    }
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                  />
                  <span className="text-gray-600">
                    Profile image already uploaded
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    {selectedImages.profile ? (
                      <div className="relative">
                        <img
                          src={
                            selectedImages.profile.preview ||
                            "/placeholder.svg?height=128&width=128"
                          }
                          className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md"
                          alt="Profile Preview"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage("profile")}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 shadow-sm transition-colors"
                          aria-label="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-100 shadow-sm">
                        <Camera className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <input
                      type="file"
                      accept="image/*"
                      id="profileImage"
                      onChange={(e) =>
                        handleImageChange("profile", e.target.files[0])
                      }
                      className="hidden"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                      onClick={() =>
                        document.getElementById("profileImage").click()
                      }
                    >
                      <Camera className="mr-2 h-5 w-5 text-blue-600" />
                      {selectedImages.profile
                        ? "Change Photo"
                        : "Upload Profile Photo"}
                    </Button>

                    <div className="text-sm text-gray-500 text-center mt-3">
                      <p>PNG, JPG, JPEG up to 10MB</p>
                      <p>Recommended: Square image, 300×300px</p>
                    </div>

                    {errors.profileImage && (
                      <p className="text-sm text-red-600 flex items-center gap-2 mt-3 justify-center">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {errors.profileImage}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4 flex flex-col">
              <div className="mb-4">
                <Label htmlFor="phoneNumber" className="text-base">
                  Phone Number 
                </Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    id="phoneNumber"
                    value={userdata.phoneNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phoneNumber: e.target.value,
                      }))
                    }
                    className="bg-gray-100"
                    placeholder="Enter phone number "
                  />
                  {formData.phoneNumber && (
                    <Button variant="outline" size="icon" disabled>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ID Verification Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 p-6 mb-6">
          <div className="flex items-center mb-6">
            <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">
              Identity Verification
            </h3>
          </div>

          <div className="space-y-6">
            <div className="max-w-xl">
              <Label htmlFor="idType" className="text-base">
                Select ID Type
              </Label>
              <select
                id="idType"
                value={formData.govtId.type}
                onChange={(e) =>
                  handleInputChange("govtId_type", e.target.value)
                }
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2 ${
                  errors.govtId_type ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Choose an ID type</option>
                <option value="passport">Passport</option>
                <option value="driver_license">Driver's License</option>
                <option value="national_id">National ID</option>
              </select>
              {errors.govtId_type && (
                <p className="text-sm text-red-600 flex items-center gap-2 mt-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.govtId_type}
                </p>
              )}
            </div>

            {formData.govtId.type && (
              <div className="space-y-4">
                {/* For Passport or Driver's License (single upload) */}
                {(formData.govtId.type === "passport" ||
                  formData.govtId.type === "driver_license") && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="front-upload" className="text-base">
                        Upload{" "}
                        {formData.govtId.type === "passport"
                          ? "Passport"
                          : "Driver's License"}
                      </Label>
                      <input
                        type="file"
                        accept="image/*"
                        id="front-upload"
                        onChange={(e) =>
                          handleImageChange("front", e.target.files[0])
                        }
                        className="hidden"
                      />

                      <div className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="w-full md:w-auto"
                          onClick={() =>
                            document.getElementById("front-upload").click()
                          }
                        >
                          <Upload className="mr-2 h-5 w-5" />
                          Upload{" "}
                          {formData.govtId.type === "passport"
                            ? "Passport"
                            : "Driver's License"}
                        </Button>
                        <span className="text-sm text-gray-500">
                          PNG, JPG, JPEG up to 10MB
                        </span>
                      </div>

                      {errors.govtId_front && (
                        <p className="text-sm text-red-600 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errors.govtId_front}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-center">
                      {selectedImages.front ? (
                        <div className="relative w-full max-w-sm aspect-[3/2]">
                          <img
                            src={
                              selectedImages.front.preview ||
                              "/placeholder.svg?height=300&width=500"
                            }
                            className="w-full  max-w-sm h-auto rounded-lg shadow-md mx-auto"
                            alt="ID Front Preview"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage("front")}
                            className="absolute -top-2 -right-4 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 shadow-md"
                            aria-label="Remove image"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full max-w-sm aspect-[3/2] bg-gray-200 rounded-lg flex flex-col items-center justify-center p-6 text-center">
                          <CreditCard className="h-12 w-12 text-gray-400 mb-3" />
                          <p className="text-gray-500">
                            ID preview will appear here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* For National ID (requires both Front & Back uploads) */}
                {formData.govtId.type === "national_id" && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Front Side */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <Label
                        htmlFor="front-upload"
                        className="text-base font-medium mb-3 block"
                      >
                        Front Side
                      </Label>
                      <input
                        type="file"
                        accept="image/*"
                        id="front-upload"
                        onChange={(e) =>
                          handleImageChange("front", e.target.files[0])
                        }
                        className="hidden"
                      />

                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                              document.getElementById("front-upload").click()
                            }
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Front Side
                          </Button>
                          <span className="text-xs text-gray-500">
                            PNG, JPG, JPEG up to 10MB
                          </span>
                        </div>

                        {errors.govtId_front && (
                          <p className="text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {errors.govtId_front}
                          </p>
                        )}
                      </div>

                      {selectedImages.front ? (
                        <div className="mt-4 relative w-full max-w-xs mx-auto ">
                          <img
                            src={
                              selectedImages.front.preview ||
                              "/placeholder.svg?height=200&width=300"
                            }
                            className="w-full max-w-xs h-auto rounded-lg shadow-md mx-auto"
                            alt="ID Front Preview"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage("front")}
                            className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 shadow-sm"
                            aria-label="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 w-full max-w-xs mx-auto aspect-[3/2] bg-gray-200 rounded-lg flex items-center justify-center">
                          <p className="text-gray-500 text-sm">Front preview</p>
                        </div>
                      )}
                    </div>

                    {/* Back Side */}
                    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                      <Label
                        htmlFor="back-upload"
                        className="text-base font-medium mb-3 block"
                      >
                        Back Side
                      </Label>
                      <input
                        type="file"
                        accept="image/*"
                        id="back-upload"
                        onChange={(e) =>
                          handleImageChange("back", e.target.files[0])
                        }
                        className="hidden"
                      />

                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() =>
                              document.getElementById("back-upload").click()
                            }
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Back Side
                          </Button>
                          <span className="text-xs text-gray-500">
                            PNG, JPG, JPEG up to 10MB
                          </span>
                        </div>

                        {errors.govtId_back && (
                          <p className="text-sm text-red-600 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {errors.govtId_back}
                          </p>
                        )}
                      </div>

                      {selectedImages.back ? (
                        <div className=" i mt-4 relative w-full max-w-xs  mx-auto">
                          <img
                            src={
                              selectedImages.back.preview ||
                              "/placeholder.svg?height=200&width=300"
                            }
                            className="w-full max-w-xs h-auto rounded-lg shadow-md mx-auto"
                            alt="ID Back Preview"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage("back")}
                            className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 shadow-sm"
                            aria-label="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 w-full max-w-xs mx-auto aspect-[3/2] bg-gray-200 rounded-lg flex items-center justify-center">
                          <p className="text-gray-500 text-sm">Back preview</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className=" mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 p-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Terms & Conditions
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  By submitting this application, you agree to our{" "}
                  <a href="#" className="text-blue-600 underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 underline">
                    Privacy Policy
                  </a>
                  . We take your privacy seriously and will only use your
                  information for verification purposes.
                </p>
              </div>
            </div>

            <div className="rounded-xl shadow-md overflow-hidden p-6 md:col-span-1 flex items-center justify-center">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-700 text-white hover:bg-blue-800 border-2 border-white"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeHostForm;
