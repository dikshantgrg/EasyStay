import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, X } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/features/user/userSlice";

const Profile = () => {
  const [userData, setUserData] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    phoneNumber: "",
    profileImage: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPersonalEditing, setIsPersonalEditing] = useState(false);
  const [isContactEditing, setIsContactEditing] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (user) {
      setUserData({
        FirstName: user.FirstName || "",
        LastName: user.LastName || "",
        Email: user.Email || "",
        phoneNumber: user.phoneNumber || "",
        profileImage: user.profileImage || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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

      setUserData((prev) => ({
        ...prev,
        profileImage: response.data.profileImage,
      }));

      const newToken = response.data.token;
      if (newToken) {
        localStorage.setItem("token", newToken);
      }

      setSelectedFile(null);
      setPreviewUrl(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile image");
      console.error("Image upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, section) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
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
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setUserData(response.data.user);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      const token = response.data.token;
      const user = jwtDecode(token);
      dispatch(setUser(user));

      if (section === "personal") setIsPersonalEditing(false);
      if (section === "contact") setIsContactEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      console.error("Profile update error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getImageSource = () => {
    if (previewUrl) {
      return { type: "image", src: previewUrl };
    }
    if (userData.profileImage) {
      return {
        type: "image",
        src: `http://localhost:8000/${userData.profileImage}`,
      };
    }
    const initial = userData.FirstName
      ? userData.FirstName.charAt(0).toUpperCase()
      : "G";
    return { type: "initial", src: initial };
  };

  const imageData = getImageSource();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Profile Settings
      </h2>

      {error && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
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
                    <span className="w-5 h-5 text-white animate-spin">⌛</span>
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
        </div>

        <div className="md:col-span-2 space-y-3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Personal Information
              </h3>
              <Button
                variant="outline"
                onClick={() => setIsPersonalEditing(!isPersonalEditing)}
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
                    <Input
                      id="FirstName"
                      name="FirstName"
                      value={userData.FirstName}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-600">{userData.FirstName || "Not set"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="LastName">Last Name</Label>
                  {isPersonalEditing ? (
                    <Input
                      id="LastName"
                      name="LastName"
                      value={userData.LastName}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-600">{userData.LastName || "Not set"}</p>
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
                onClick={() => setIsContactEditing(!isContactEditing)}
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
                    <Input
                      id="Email"
                      name="Email"
                      type="email"
                      value={userData.Email}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-600">{userData.Email || "Not set"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  {isContactEditing ? (
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={userData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-600">{userData.phoneNumber || "Not set"}</p>
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
        </div>
      </div>
    </div>
  );
};

export default Profile;