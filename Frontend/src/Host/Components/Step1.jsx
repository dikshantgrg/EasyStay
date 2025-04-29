const Step1 = ({ formData, handleChange, errors, propertyTypes }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
      Property Details
    </h2>

    <div className="mt-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Type
        </label>
        <select
          value={formData.property_type_id}
          مع1
          onChange={(e) => handleChange("property_type_id", e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg ${
            errors.property_type_id ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select Property Type</option>
          {propertyTypes.map((type) => (
            <option key={type._id} value={type._id}>
              {type.title}
            </option>
          ))}
        </select>
        {errors.property_type_id && (
          <p className="mt-1 text-sm text-red-500">{errors.property_type_id}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Luxury Beach Villa"
          className={`w-full px-4 py-3 border rounded-lg ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-500">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe your property..."
          className={`w-full px-4 py-3 border rounded-lg ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price per Night (Rs)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            Rs
          </span>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            placeholder="250"
            className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
              errors.price ? "border-red-500" : "border-gray-300"
            }`}
          />
        </div>
        {errors.price && (
          <p className="mt-1 text-sm text-red-500">{errors.price}</p>
        )}
      </div>
    </div>
  </div>
);

export default Step1;
