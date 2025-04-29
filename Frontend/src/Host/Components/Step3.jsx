import { FiPlus, FiMinus } from 'react-icons/fi';

const Step3 = ({ formData, handleChange, errors }) => {
  const handleIncrement = (field) => {
    handleChange(field, formData[field] + 1);
  };

  const handleDecrement = (field) => {
    if (formData[field] > (field === 'maxGuest' ? 1 : 0)) {
      handleChange(field, formData[field] - 1);
    }
  };

  const NumberInput = ({ field, label, min = 0 }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:border-blue-500 transition-colors">
      <label className="block text-base font-medium text-gray-700 mb-3">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => handleDecrement(field)}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          disabled={formData[field] <= min}
        >
          <FiMinus className="h-5 w-5 text-gray-600" />
        </button>
        <input
          type="number"
          id={field}
          name={field}
          value={formData[field]}
          onChange={(e) => handleChange(field, Number(e.target.value))}
          min={min}
          className={`block w-20 text-center px-2 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
            errors[field] ? "border-red-500" : "border-gray-300"
          }`}
        />
        <button
          type="button"
          onClick={() => handleIncrement(field)}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <FiPlus className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      {errors[field] && (
        <p className="mt-2 text-sm text-red-500">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <div className="max-h-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-6">
          <div className="pb-6">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Property Features</h2>
            <p className="mt-2 text-sm text-gray-500">Tell guests about your property's capacity and features.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <NumberInput field="maxGuest" label="Maximum Guests" min={1} />
            <NumberInput field="bedrooms" label="Bedrooms" />
            <NumberInput field="bathrooms" label="Bathrooms" />
            <NumberInput field="kitchen" label="Kitchen Count" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3;