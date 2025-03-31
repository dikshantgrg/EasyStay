import React, { useState, useRef, useEffect } from "react";

const Step5 = ({ formData, handleChange, errors }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const fileInputRef = useRef(null);

  // Sync selectedImages with formData.images when component mounts or formData.images changes
  useEffect(() => {
    if (formData.images && formData.images.length > 0) {
      const previews = formData.images.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setSelectedImages(previews);
    } else {
      setSelectedImages([]);
    }

    // Cleanup: Revoke object URLs when component unmounts
    return () => {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [formData.images]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setSelectedImages((prev) => [...prev, ...newPreviews]);
      handleChange("images", [...(formData.images || []), ...files]);
    }
  };

  const removeImage = (index) => {
    const updatedPreviews = selectedImages.filter((_, i) => i !== index);
    const updatedFiles = formData.images.filter((_, i) => i !== index);
    setSelectedImages(updatedPreviews);
    handleChange("images", updatedFiles);
    URL.revokeObjectURL(selectedImages[index].preview);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Property Photos
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-gray-500">
              Upload high-quality photos that showcase your property (minimum 5 photos)
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {/* File Upload Section */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                errors.images ? "border-red-500" : "border-gray-300"
              }`}
            >
              <label
                htmlFor="images"
                className="cursor-pointer inline-flex flex-col items-center"
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
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                ref={fileInputRef}
              />
            </div>
            {errors.images && (
              <p className="mt-1 text-sm text-red-500">{errors.images}</p>
            )}

            {/* Image Previews */}
            {selectedImages.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">
                  Selected Photos ({selectedImages.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedImages.map((item, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-lg overflow-hidden shadow-sm"
                    >
                      <img
                        src={item.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5;