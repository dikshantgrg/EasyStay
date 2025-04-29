import React, { useState, useEffect } from "react";
import {
  FaWifi,
  FaTv,
  FaCoffee,
  FaParking,
  FaSwimmingPool,
  FaHotTub,
  FaFireExtinguisher,
  FaLock,
  FaSnowflake,
  FaFan,
  FaDumbbell,
  FaUtensils,
  FaLaptop,
  FaDog,
  FaCat,
  FaBan,
  FaWheelchair,
  FaBabyCarriage,
  FaPlug,
  FaShower,
  FaBath,
  FaBed,
  FaCouch,
  FaChair,
  FaTable,
  FaBlender,
  FaSink,
  FaBreadSlice,
  FaTrash,
  FaBroom,
  FaSoap,
  FaTshirt,
  FaAirFreshener,
  FaCamera,
  FaBook,
  FaGamepad,
  FaMusic,
  FaBicycle,
  FaCar,
  FaBus,
  FaPlane,
  FaTree,
  FaSun,
} from "react-icons/fa";

const amenitiesList = [
  { name: "WiFi", icon: <FaWifi /> },
  { name: "TV", icon: <FaTv /> },
  { name: "Coffee Maker", icon: <FaCoffee /> },
  { name: "Parking", icon: <FaParking /> },
  { name: "Swimming Pool", icon: <FaSwimmingPool /> },
  { name: "Hot Tub", icon: <FaHotTub /> },
  { name: "Fire Extinguisher", icon: <FaFireExtinguisher /> },

  { name: "Lockbox", icon: <FaLock /> },
  { name: "Air Conditioning", icon: <FaSnowflake /> },
  { name: "Ceiling Fan", icon: <FaFan /> },
  { name: "Gym", icon: <FaDumbbell /> },
  { name: "Kitchen", icon: <FaUtensils /> },
  { name: "Laptop Workspace", icon: <FaLaptop /> },
  { name: "Pet Friendly (Dogs)", icon: <FaDog /> },
  { name: "Pet Friendly (Cats)", icon: <FaCat /> },
  { name: "No Smoking", icon: <FaBan /> },
  { name: "Wheelchair Accessible", icon: <FaWheelchair /> },
  { name: "Baby Stroller", icon: <FaBabyCarriage /> },
  { name: "Power Backup", icon: <FaPlug /> },
  { name: "Shower", icon: <FaShower /> },
  { name: "Bathtub", icon: <FaBath /> },
  { name: "Extra Bed", icon: <FaBed /> },
  { name: "Sofa", icon: <FaCouch /> },
  { name: "Armchair", icon: <FaChair /> },
  { name: "Dining Table", icon: <FaTable /> },
  { name: "Blender", icon: <FaBlender /> },

  { name: "Dishwasher", icon: <FaSink /> },
  { name: "Toaster", icon: <FaBreadSlice /> },
  { name: "Trash Disposal", icon: <FaTrash /> },
  { name: "Cleaning Supplies", icon: <FaBroom /> },
  { name: "Soap/Shampoo", icon: <FaSoap /> },
  { name: "Extra Towels", icon: <FaTshirt /> },

  { name: "Hair Dryer", icon: <FaAirFreshener /> },

  { name: "Security Camera", icon: <FaCamera /> },
  { name: "Books", icon: <FaBook /> },
  { name: "Gaming Console", icon: <FaGamepad /> },
  { name: "Music System", icon: <FaMusic /> },
  { name: "Bicycles", icon: <FaBicycle /> },
  { name: "Car Rental", icon: <FaCar /> },
  { name: "Public Transport Access", icon: <FaBus /> },
  { name: "Airport Shuttle", icon: <FaPlane /> },
  { name: "Garden", icon: <FaTree /> },
  { name: "Balcony", icon: <FaSun /> },
];

const Step6 = ({ formData, handleChange, errors }) => {
  const [selectedAmenities, setSelectedAmenities] = useState(
    formData.amenities || []
  );

  useEffect(() => {
   
    setSelectedAmenities(formData.amenities || []);``
  }, [formData.amenities]);

  const handleAmenityChange = (amenityName) => {
    const updatedAmenities = selectedAmenities.includes(amenityName)
      ? selectedAmenities.filter((item) => item !== amenityName)
      : [...selectedAmenities, amenityName];
    setSelectedAmenities(updatedAmenities);
    handleChange("amenities", updatedAmenities);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Amenities
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-gray-500">
              Select the amenities available at your property to help guests
              know what to expect.
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {amenitiesList.map((amenity) => (
                <label
                  key={amenity.name}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAmenities.includes(amenity.name)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity.name)}
                    onChange={() => handleAmenityChange(amenity.name)}
                    className="hidden"
                  />
                  <span className="mr-2 text-xl">{amenity.icon}</span>
                  <span className="text-sm font-medium text-gray-700">
                    {amenity.name}
                  </span>
                </label>
              ))}
            </div>
            {errors.amenities && (
              <p className="mt-1 text-sm text-red-500">{errors.amenities}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step6;
