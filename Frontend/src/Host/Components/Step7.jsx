// const Step6 = ({ formData, handleChange }) => {
//     // List of available amenities
//     const amenities = [
//       { id: "wifi", label: "Wi-Fi" },
//       { id: "pool", label: "Pool" },
//       { id: "gym", label: "Gym" },
//       { id: "parking", label: "Parking" },
//       { id: "airConditioning", label: "Air Conditioning" },
//       { id: "petFriendly", label: "Pet Friendly" },
//     ];
  
//     // Handle checkbox selection
//     const handleAmenityChange = (amenityId, isChecked) => {
//       const updatedAmenities = isChecked
//         ? [...formData.amenities, amenityId] // Add amenity
//         : formData.amenities.filter((id) => id !== amenityId); // Remove amenity
  
//       handleChange("amenities", updatedAmenities);
//     };
  
//     return (
//       <div className="space-y-6">
//         <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Amenities</h2>
  
//         <div className="mt-6 space-y-4">
//           <p className="text-sm text-gray-600">
//             Select the amenities available at your property.
//           </p>
  
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {amenities.map((amenity) => (
//               <div key={amenity.id} className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id={amenity.id}
//                   checked={formData.amenities.includes(amenity.id)}
//                   onChange={(e) =>
//                     handleAmenityChange(amenity.id, e.target.checked)
//                   }
//                   className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                 />
//                 <label
//                   htmlFor={amenity.id}
//                   className="ml-3 text-sm font-medium text-gray-700"
//                 >
//                   {amenity.label}
//                 </label>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   };
  
//   export default Step6;

import React, { useState } from "react";

const Step7 = ({ formData, handleChange, errors }) => {
  const [idType, setIdType] = useState(formData.govtId.type || ""); // Sync with formData
  const [selectedImages, setSelectedImages] = useState({
    front: formData.govtId.front ? { file: formData.govtId.front, preview: URL.createObjectURL(formData.govtId.front) } : null,
    back: formData.govtId.back ? { file: formData.govtId.back, preview: URL.createObjectURL(formData.govtId.back) } : null,
  });

  const handleIdTypeChange = (e) => {
    const selectedType = e.target.value;
    setIdType(selectedType);
    setSelectedImages({ front: null, back: null }); // Reset local previews
    handleChange("govtId", { type: selectedType }); // Reset govtId with new type
  };

  const handleImageChange = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setSelectedImages((prev) => ({ ...prev, [side]: { file, preview } }));
      handleChange("govtId", { ...(formData.govtId || {}), [side]: file });
    }
  };

  const removeImage = (side) => {
    if (selectedImages[side]) {
      URL.revokeObjectURL(selectedImages[side].preview);
    }
    setSelectedImages((prev) => ({ ...prev, [side]: null }));
    const updatedGovtId = { ...(formData.govtId || {}) };
    delete updatedGovtId[side];
    handleChange("govtId", updatedGovtId);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Government ID Upload
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-gray-500">
              Upload a clear image of your government-issued ID for verification.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {/* ID Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select ID Type
              </label>
              <select
                className={`mt-2 block w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.govtId_type ? "border-red-500" : "border-gray-300"
                }`}
                value={idType}
                onChange={handleIdTypeChange}
              >
                <option value="">Choose an ID type</option>
                <option value="passport">Passport</option>
                <option value="citizenship">Citizenship Card</option>
                <option value="drivingLicense">Driving License</option>
              </select>
              {errors.govtId_type && (
                <p className="mt-1 text-sm text-red-500">{errors.govtId_type}</p>
              )}
            </div>

            {/* Upload Section */}
            {idType && (
              <>
                {/* For Passport or Driving License (single upload) */}
                {(idType === "passport" || idType === "drivingLicense") && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="front-upload"
                      onChange={(e) => handleImageChange(e, "front")}
                      className="hidden"
                    />
                    <label
                      htmlFor="front-upload"
                      className={`cursor-pointer inline-flex flex-col items-center border-2 border-dashed rounded-lg p-8 text-center ${
                        errors.govtId_front ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <svg
                        className="w-12 h-12 text-gray-400 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="block text-sm font-medium text-gray-700 mb-2">
                        Click to upload or drag and drop
                      </span>
                      <span className="block text-xs text-gray-500">
                        PNG, JPG, JPEG up to 10MB
                      </span>
                    </label>
                    {errors.govtId_front && (
                      <p className="mt-1 text-sm text-red-500">{errors.govtId_front}</p>
                    )}

                    {selectedImages.front && (
                      <div className="mt-4 relative">
                        <img
                          src={selectedImages.front.preview}
                          className="w-full h-auto rounded-lg shadow-md"
                          alt="Preview"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage("front")}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* For Citizenship Card (requires both Front & Back uploads) */}
                {idType === "citizenship" && (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Front Side */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id="front-upload-citizenship"
                        onChange={(e) => handleImageChange(e, "front")}
                        className="hidden"
                      />
                      <label
                        htmlFor="front-upload-citizenship"
                        className={`cursor-pointer inline-flex flex-col items-center border-2 border-dashed rounded-lg p-8 text-center ${
                          errors.govtId_front ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <svg
                          className="w-12 h-12 text-gray-400 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="block text-sm font-medium text-gray-700 mb-2">
                          Front Side
                        </span>
                        <span className="block text-xs text-gray-500">
                          PNG, JPG, JPEG up to 10MB
                        </span>
                      </label>
                      {errors.govtId_front && (
                        <p className="mt-1 text-sm text-red-500">{errors.govtId_front}</p>
                      )}
                      {selectedImages.front && (
                        <div className="mt-4 relative">
                          <img
                            src={selectedImages.front.preview}
                            className="w-full h-auto rounded-lg shadow-md"
                            alt="Front Preview"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage("front")}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Back Side */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id="back-upload-citizenship"
                        onChange={(e) => handleImageChange(e, "back")}
                        className="hidden"
                      />
                      <label
                        htmlFor="back-upload-citizenship"
                        className={`cursor-pointer inline-flex flex-col items-center border-2 border-dashed rounded-lg p-8 text-center ${
                          errors.govtId_back ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <svg
                          className="w-12 h-12 text-gray-400 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="block text-sm font-medium text-gray-700 mb-2">
                          Back Side
                        </span>
                        <span className="block text-xs text-gray-500">
                          PNG, JPG, JPEG up to 10MB
                        </span>
                      </label>
                      {errors.govtId_back && (
                        <p className="mt-1 text-sm text-red-500">{errors.govtId_back}</p>
                      )}
                      {selectedImages.back && (
                        <div className="mt-4 relative">
                          <img
                            src={selectedImages.back.preview}
                            className="w-full h-auto rounded-lg shadow-md"
                            alt="Back Preview"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage("back")}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step7;
