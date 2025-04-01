import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    phoneNumber: '',
    profileImage: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/user/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserData(response.data);
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const handleInputChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('FirstName', userData.FirstName);
      formData.append('LastName', userData.LastName);
      formData.append('Email', userData.Email);
      formData.append('phoneNumber', userData.phoneNumber);
      if (selectedFile) {
        formData.append('profileImage', selectedFile);
      }

      const response = await axios.put('/api/user/profile', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setUserData(response.data);
      setSelectedFile(null);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Profile Settings</h2>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Image Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <img 
                  src={'default-profile-image.jpg'} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full shadow-sm hover:bg-blue-600 transition-colors cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <svg 
                    className="w-5 h-5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Allowed formats: JPEG, PNG up to 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">First Name</label>
                  <input
                    type="text"
                    name="FirstName"
                    value={userData.FirstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="LastName"
                    value={userData.LastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="Email"
                    value={userData.Email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={userData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

};

export default Profile;