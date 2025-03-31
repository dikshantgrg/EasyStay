const Step3 = ({ formData, handleChange, errors }) => (
  <div className="max-h-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Property Features</h2>
          <p className="mt-2 text-sm text-gray-500">Describe your property's capacity and amenities. This helps guests understand exactly what your space offers.</p>
        </div>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Maximum Guests
              </label>
              <input
                type="number"
                id="maxGuest"
                name="maxGuest"
                value={formData.maxGuest}
                onChange={(e) => handleChange("maxGuest", Number(e.target.value))}
                min="1"
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.maxGuest ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.maxGuest && (
                <p className="mt-1 text-sm text-red-500">{errors.maxGuest}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bedrooms
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={(e) => handleChange("bedrooms", Number(e.target.value))}
                min="0"
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.bedrooms ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.bedrooms && (
                <p className="mt-1 text-sm text-red-500">{errors.bedrooms}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bathrooms
              </label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={(e) => handleChange("bathrooms", Number(e.target.value))}
                min="0"
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.bathrooms ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.bathrooms && (
                <p className="mt-1 text-sm text-red-500">{errors.bathrooms}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="kitchen" className="block text-sm font-medium text-gray-700">
                Kitchen Count
              </label>
              <input
                type="number"
                id="kitchen"
                name="kitchen"
                value={formData.kitchen}
                onChange={(e) => handleChange("kitchen", Number(e.target.value))}
                min="0"
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.kitchen ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.kitchen && (
                <p className="mt-1 text-sm text-red-500">{errors.kitchen}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Step3;