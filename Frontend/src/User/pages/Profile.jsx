import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, X } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/features/user/userSlice";
import toast, { Toaster } from "react-hot-toast";
import Footer from "../Components/Footer";

const Profile = () => {
  const [userData, setUserData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    phoneNumber: "",
    profileImage: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [govtIdData, setGovtIdData] = useState({
    type: "",
    front: null,
    back: null,
  });
  const [errors, setErrors] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    phoneNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    govtIdType: "",
    govtIdFront: "",
    govtIdBack: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [govtIdFrontPreview, setGovtIdFrontPreview] = useState(null);
  const [govtIdBackPreview, setGovtIdBackPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPersonalEditing, setIsPersonalEditing] = useState(false);
  const [isContactEditing, setIsContactEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [isGovtIdEditing, setIsGovtIdEditing] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  // Validation functions
  const validateNotEmpty = (value, fieldName) => {
    if (!value) return `${fieldName} is required`;
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Invalid email format";
    return "";
  };

  // Fetch user data on mount and store in local state
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          toast.error("Please log in to view your profile");
          return;
        }

        const decoded = jwtDecode(token);
        const userId = decoded._id;

        const response = await axios.get(
          `http://localhost:8000/api/users-info/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userInfo = {
          FirstName: response.data.FirstName || "",
          LastName: response.data.LastName || "",
          Email: response.data.Email || "",
          phoneNumber: response.data.phoneNumber || "",
          profileImage: response.data.profileImage || "",
          role: response.data.role || "",
          govtId: response.data.govtId || { type: "", front: "", back: "" },
          IdVerfication: response.data.IdVerfication || "",
        };

        setUserData({
          FirstName: userInfo.FirstName,
          LastName: userInfo.LastName,
          Email: userInfo.Email,
          phoneNumber: userInfo.phoneNumber,
          profileImage: userInfo.profileImage,
        });
        setGovtIdData({
          type: userInfo.govtId.type || "",
          front: null,
          back: null,
        });
        dispatch(setUser(userInfo));
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to fetch user data";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Fetch user error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleGovtIdChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setGovtIdData((prev) => ({
        ...prev,
        [name]: file,
      }));
      if (name === "front") {
        setGovtIdFrontPreview(URL.createObjectURL(file));
      } else if (name === "back") {
        setGovtIdBackPreview(URL.createObjectURL(file));
      }
      setErrors((prev) => ({
        ...prev,
        [name === "front" ? "govtIdFront" : "govtIdBack"]: "",
      }));
    }
  };

  const handleGovtIdTypeChange = (e) => {
    const value = e.target.value;
    setGovtIdData((prev) => ({
      ...prev,
      type: value,
    }));
  };

  const handleCancelGovtId = () => {
    setGovtIdData({
      type: user.govtId?.type || "",
      front: null,
      back: null,
    });
    setErrors((prev) => ({
      ...prev,
      govtIdType: "",
      govtIdFront: "",
      govtIdBack: "",
    }));
    if (govtIdFrontPreview) {
      URL.revokeObjectURL(govtIdFrontPreview);
      setGovtIdFrontPreview(null);
    }
    if (govtIdBackPreview) {
      URL.revokeObjectURL(govtIdBackPreview);
      setGovtIdBackPreview(null);
    }
    setIsGovtIdEditing(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCancelImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleImageSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      const response = await axios.put(
        "http://localhost:8000/api/profile/image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Update Redux store
      dispatch(
        setUser({
          ...user,
          profileImage: response.data.profileImage,
        })
      );

      // Update local userData state with the new profile image
      setUserData((prevData) => ({
        ...prevData,
        profileImage: response.data.profileImage,
      }));

      const newToken = response.data.token;
      if (newToken) {
        localStorage.setItem("token", newToken);
      }

      // Clear preview and selected file
      setSelectedFile(null);
      setPreviewUrl(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      toast.success("Profile image updated successfully");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update profile image";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Image upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update getImageSource to add cache-busting query parameter
  const getImageSource = () => {
    if (previewUrl) {
      return { type: "image", src: previewUrl };
    }
    if (userData.profileImage) {
      // Add a cache-busting query parameter to the image URL
      return {
        type: "image",
        src: `http://localhost:8000/${
          userData.profileImage
        }?t=${new Date().getTime()}`,
      };
    }
    const initial = userData.FirstName
      ? userData.FirstName.charAt(0).toUpperCase()
      : "G";
    return { type: "initial", src: initial };
  };

  const handleGovtIdSubmit = async (e) => {
    e.preventDefault();

    // Validate government ID fields
    const newErrors = {
      govtIdType: validateNotEmpty(govtIdData.type, "Government ID Type"),
      govtIdFront: validateNotEmpty(
        govtIdData.front,
        "Government ID Front Image"
      ),
      govtIdBack:
        govtIdData.type === "citizenship"
          ? validateNotEmpty(govtIdData.back, "Government ID Back Image")
          : "",
    };

    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (Object.values(newErrors).some((error) => error)) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("govtId_front", govtIdData.front);
      if (govtIdData.back) {
        formData.append("govtId_back", govtIdData.back);
      }
      formData.append("govtId_type", govtIdData.type);

      const response = await axios.patch(
        "http://localhost:8000/api/update-govt-ids",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      dispatch(
        setUser({
          ...user,
          govtId: response.data.user.govtId,
          IdVerfication: response.data.user.IdVerfication,
        })
      );

      setGovtIdData({
        type: response.data.user.govtId.type,
        front: null,
        back: null,
      });
      if (govtIdFrontPreview) {
        URL.revokeObjectURL(govtIdFrontPreview);
        setGovtIdFrontPreview(null);
      }
      if (govtIdBackPreview) {
        URL.revokeObjectURL(govtIdBackPreview);
        setGovtIdBackPreview(null);
      }
      setIsGovtIdEditing(false);

      toast.success(
        "Government ID updated successfully. Verification pending."
      );
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update government ID";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Government ID update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, section) => {
    e.preventDefault();

    // Validate all fields for the section
    const newErrors = {};
    if (section === "personal") {
      newErrors.FirstName = validateNotEmpty(userData.FirstName, "First Name");
      newErrors.LastName = validateNotEmpty(userData.LastName, "Last Name");
    } else if (section === "contact") {
      newErrors.Email = validateEmail(userData.Email);
      newErrors.phoneNumber = validateNotEmpty(
        userData.phoneNumber,
        "Phone Number"
      );
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));

    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error)) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:8000/api/update/user",
        {
          FirstName: userData.FirstName,
          LastName: userData.LastName,
          Email: userData.Email,
          phoneNumber: userData.phoneNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      const newToken = jwtDecode(response.data.token);
      dispatch(setUser(newToken));

      if (section === "personal") setIsPersonalEditing(false);
      if (section === "contact") setIsContactEditing(false);

      toast.success("Profile updated successfully");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validate password fields
    const newErrors = {
      currentPassword: validateNotEmpty(
        passwordData.currentPassword,
        "Current Password"
      ),
      newPassword: validateNotEmpty(passwordData.newPassword, "New Password"),
      confirmNewPassword:
        passwordData.newPassword === passwordData.confirmNewPassword
          ? ""
          : "Passwords do not match",
    };

    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (Object.values(newErrors).some((error) => error)) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        "http://localhost:8000/api/change-password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setErrors({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setIsPasswordEditing(false);
      toast.success("Password updated successfully");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update password";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Password update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const imageData = getImageSource();

  return (
    <div className="w-full">
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            theme: {
              primary: "#4aed88",
            },
          },
        }}
      />

      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Profile Settings
      </h2>

      {error && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-600">Loading profile...</div>
      )}

      {!loading && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  {imageData.type === "image" ? (
                    <img
                      src={imageData.src}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg -z-50"
                      onError={(e) => {
                        console.error("Image load failed:", e.target.src);
                        e.target.src = "default-profile-image.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg flex items-center justify-center text-4xl font-bold text-gray-600">
                      {imageData.src}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full shadow-sm hover:bg-blue-600 transition-colors cursor-pointer">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="hidden"
                    />
                    {loading ? (
                      <span className="w-5 h-5 text-white animate-spin">
                        ⌛
                      </span>
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                  </label>
                </div>
                {selectedFile && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleImageSubmit}
                      disabled={loading}
                      className="mt-2"
                    >
                      {loading ? "Uploading..." : "Upload Image"}
                    </Button>
                    <Button
                      onClick={handleCancelImage}
                      disabled={loading}
                      variant="outline"
                      className="mt-2"
                    >
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500 text-center">
                  Allowed formats: JPEG, PNG up to 5MB
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Change Password
                </h3>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPasswordEditing(!isPasswordEditing);
                    if (isPasswordEditing) {
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmNewPassword: "",
                      });
                      setErrors({
                        currentPassword: "",
                        newPassword: "",
                        confirmNewPassword: "",
                      });
                    }
                  }}
                  disabled={loading}
                >
                  {isPasswordEditing ? "Cancel" : "Change Password"}
                </Button>
              </div>
              {isPasswordEditing && (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`w-full ${
                          errors.currentPassword ? "border-red-500" : ""
                        }`}
                      />
                      {errors.currentPassword && (
                        <p className="text-red-500 text-sm">
                          {errors.currentPassword}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`w-full ${
                          errors.newPassword ? "border-red-500" : ""
                        }`}
                      />
                      {errors.newPassword && (
                        <p className="text-red-500 text-sm">
                          {errors.newPassword}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        type="password"
                        value={passwordData.confirmNewPassword}
                        onChange={handlePasswordChange}
                        className={`w-full ${
                          errors.confirmNewPassword ? "border-red-500" : ""
                        }`}
                      />
                      {errors.confirmNewPassword && (
                        <p className="text-red-500 text-sm">
                          {errors.confirmNewPassword}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-auto px-3 py-1"
                    >
                      {loading ? "Updating..." : "Change Password"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Personal Information
                </h3>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPersonalEditing(!isPersonalEditing);
                    if (isPersonalEditing && user) {
                      setUserData({
                        FirstName: user.FirstName || userData.FirstName,
                        LastName: user.LastName || userData.LastName,
                        Email: user.Email || userData.Email,
                        phoneNumber: user.phoneNumber || userData.phoneNumber,
                        profileImage:
                          user.profileImage || userData.profileImage,
                      });
                      setErrors({
                        FirstName: "",
                        LastName: "",
                        Email: "",
                        phoneNumber: "",
                      });
                    }
                  }}
                  disabled={loading}
                >
                  {isPersonalEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
              <form onSubmit={(e) => handleSubmit(e, "personal")}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="FirstName">First Name</Label>
                    {isPersonalEditing ? (
                      <>
                        <Input
                          id="FirstName"
                          name="FirstName"
                          value={userData.FirstName}
                          onChange={handleInputChange}
                          className={`w-full ${
                            errors.FirstName ? "border-red-500" : ""
                          }`}
                        />
                        {errors.FirstName && (
                          <p className="text-red-500 text-sm">
                            {errors.FirstName}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-600">
                        {userData.FirstName || "Not set"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="LastName">Last Name</Label>
                    {isPersonalEditing ? (
                      <>
                        <Input
                          id="LastName"
                          name="LastName"
                          value={userData.LastName}
                          onChange={handleInputChange}
                          className={`w-full ${
                            errors.LastName ? "border-red-500" : ""
                          }`}
                        />
                        {errors.LastName && (
                          <p className="text-red-500 text-sm">
                            {errors.LastName}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-600">
                        {userData.LastName || "Not set"}
                      </p>
                    )}
                  </div>
                  {isPersonalEditing && (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-auto px-3 py-1"
                    >
                      {loading ? "Updating..." : "Save Changes"}
                    </Button>
                  )}
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Contact Information
                </h3>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsContactEditing(!isContactEditing);
                    if (isContactEditing && user) {
                      setUserData({
                        FirstName: user.FirstName || userData.FirstName,
                        LastName: user.LastName || userData.LastName,
                        Email: user.Email || userData.Email,
                        phoneNumber: user.phoneNumber || userData.phoneNumber,
                        profileImage:
                          user.profileImage || userData.profileImage,
                      });
                      setErrors({
                        FirstName: "",
                        LastName: "",
                        Email: "",
                        phoneNumber: "",
                      });
                    }
                  }}
                  disabled={loading}
                >
                  {isContactEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
              <form onSubmit={(e) => handleSubmit(e, "contact")}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="Email">Email Address</Label>
                    {isContactEditing ? (
                      <>
                        <Input
                          id="Email"
                          name="Email"
                          type="email"
                          value={userData.Email}
                          onChange={handleInputChange}
                          className={`w-full ${
                            errors.Email ? "border-red-500" : ""
                          }`}
                        />
                        {errors.Email && (
                          <p className="text-red-500 text-sm">{errors.Email}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-600">
                        {userData.Email || "Not set"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    {isContactEditing ? (
                      <>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          value={userData.phoneNumber}
                          onChange={handleInputChange}
                          className={`w-full ${
                            errors.phoneNumber ? "border-red-500" : ""
                          }`}
                        />
                        {errors.phoneNumber && (
                          <p className="text-red-500 text-sm">
                            {errors.phoneNumber}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-600">
                        {userData.phoneNumber || "Not set"}
                      </p>
                    )}
                  </div>
                  {isContactEditing && (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-auto px-3 py-1"
                    >
                      {loading ? "Updating..." : "Save Changes"}
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {user?.role === "host" && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Government ID
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsGovtIdEditing(!isGovtIdEditing);
                      if (isGovtIdEditing) {
                        handleCancelGovtId();
                      }
                    }}
                    disabled={loading}
                  >
                    {isGovtIdEditing ? "Cancel" : "Update ID"}
                  </Button>
                </div>
                {isGovtIdEditing ? (
                  <form onSubmit={handleGovtIdSubmit}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="govtIdType">ID Type</Label>
                        <select
                          id="govtIdType"
                          name="govtIdType"
                          value={govtIdData.type}
                          onChange={handleGovtIdTypeChange}
                          className={`w-full border rounded-md p-2 ${
                            errors.govtIdType
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select ID type</option>
                          <option value="driverLicense">
                            Driver's License
                          </option>
                          <option value="passport">Passport</option>
                          <option value="citizenship">Citizenship</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.govtIdType && (
                          <p className="text-red-500 text-sm">
                            {errors.govtIdType}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="front">Front Image</Label>
                        <Input
                          id="front"
                          name="front"
                          type="file"
                          accept="image/*"
                          onChange={handleGovtIdChange}
                          disabled={loading}
                          className={`w-full ${
                            errors.govtIdFront ? "border-red-500" : ""
                          }`}
                        />
                        {govtIdFrontPreview && (
                          <div className="mt-2">
                            <img
                              src={govtIdFrontPreview}
                              alt="Front ID Preview"
                              className="w-48 h-auto rounded-md border"
                            />
                          </div>
                        )}
                        {errors.govtIdFront && (
                          <p className="text-red-500 text-sm">
                            {errors.govtIdFront}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        {govtIdData.type === "citizenship" && (
                          <div>
                            <Label htmlFor="back">Back Image</Label>
                            <Input
                              id="back"
                              name="back"
                              type="file"
                              accept="image/*"
                              onChange={handleGovtIdChange}
                              disabled={loading}
                              className={`w-full ${
                                errors.govtIdBack ? "border-red-500" : ""
                              }`}
                            />
                          </div>
                        )}

                        {govtIdBackPreview && (
                          <div className="mt-2">
                            <img
                              src={govtIdBackPreview}
                              alt="Back ID Preview"
                              className="w-48 h-auto rounded-md border"
                            />
                          </div>
                        )}
                        {errors.govtIdBack && (
                          <p className="text-red-500 text-sm">
                            {errors.govtIdBack}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-auto px-3 py-1"
                        >
                          {loading ? "Updating..." : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelGovtId}
                          disabled={loading}
                          className="w-auto px-3 py-1"
                        >
                          <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Allowed formats: JPEG, PNG up to 5MB
                    </p>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>ID Type</Label>
                      <p className="text-gray-600">
                        {user.govtId?.type
                          ? user.govtId.type.charAt(0).toUpperCase() +
                            user.govtId.type.slice(1)
                          : "Not set"}
                      </p>
                    </div>
                    <div>
                      <Label>Front Image</Label>
                      {user.govtId?.front ? (
                        <img
                          src={`http://localhost:8000/${user.govtId.front}`}
                          alt="Front ID"
                          className="w-48 h-auto rounded-md border"
                          onError={(e) => {
                            console.error("Image load failed:", e.target.src);
                            e.target.src = "default-id-image.jpg";
                          }}
                        />
                      ) : (
                        <p className="text-gray-600">Not set</p>
                      )}
                    </div>
                    <div>
                      <Label>Back Image</Label>
                      {user.govtId?.back ? (
                        <img
                          src={`http://localhost:8000/${user.govtId.back}`}
                          alt="Back ID"
                          className="w-48 h-auto rounded-md border"
                          onError={(e) => {
                            console.error("Image load failed:", e.target.src);
                            e.target.src = "default-id-image.jpg";
                          }}
                        />
                      ) : (
                        <p className="text-gray-600">Not set</p>
                      )}
                    </div>
                    <div>
                      <Label>Verification Status</Label>
                      <p className="text-gray-600">{user.IdVerfication}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    
    </div>
    <Footer />
    </div>
  );
};

export default Profile;
