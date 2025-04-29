const Step2 = ({ formData, handleChange, errors }) => (
  <div className="max-w-2xl mx-auto p-4 sm:px-6 lg:px-8">
    <div className="space-y-8 divide-y divide-gray-200">
      <div className="space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Address Details
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Provide the physical location of your property
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={(e) => handleChange("street", e.target.value)}
              placeholder="123 Main St"
              className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.street ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.street && (
              <p className="mt-1 text-sm text-red-500">{errors.street}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="City"
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.city ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-500">{errors.city}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Province
              </label>
              <select
                id="province_name"
                name="province_name"
                value={formData.province_name}
                onChange={(e) => handleChange("province_name", e.target.value)}
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.province_name ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select Province</option>
                <option value="Koshi">Koshi</option>
                <option value="Madhesh">Madhesh</option>
                <option value="Bagmati">Bagmati</option>
                <option value="Gandaki">Gandaki</option>
                <option value="Lumbini">Lumbini</option>
                <option value="Karnali">Karnali</option>
                <option value="Sudurpashchim">Sudurpashchim</option>
              </select>
              {errors.province_name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.province_name}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="zipCode"
              className="block text-sm font-medium text-gray-700"
            >
              ZIP/Postal Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={(e) => handleChange("zipCode", e.target.value)}
              placeholder="12345"
              className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                errors.zipCode ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.zipCode && (
              <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Step2;
