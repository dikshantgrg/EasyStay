import React, { useState } from "react";
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
  { name: "WiFi", icon: FaWifi },
  { name: "TV", icon: FaTv },
  { name: "Coffee Maker", icon: FaCoffee },
  { name: "Parking", icon: FaParking },
  { name: "Swimming Pool", icon: FaSwimmingPool },
  { name: "Hot Tub", icon: FaHotTub },
  { name: "Fire Extinguisher", icon: FaFireExtinguisher },
  { name: "Lockbox", icon: FaLock },
  { name: "Air Conditioning", icon: FaSnowflake },
  { name: "Ceiling Fan", icon: FaFan },
  { name: "Gym", icon: FaDumbbell },
  { name: "Kitchen", icon: FaUtensils },
  { name: "Laptop Workspace", icon: FaLaptop },
  { name: "Pet Friendly (Dogs)", icon: FaDog },
  { name: "Pet Friendly (Cats)", icon: FaCat },
  { name: "No Smoking", icon: FaBan },
  { name: "Wheelchair Accessible", icon: FaWheelchair },
  { name: "Baby Stroller", icon: FaBabyCarriage },
  { name: "Power Backup", icon: FaPlug },
  { name: "Shower", icon: FaShower },
  { name: "Bathtub", icon: FaBath },
  { name: "Extra Bed", icon: FaBed },
  { name: "Sofa", icon: FaCouch },
  { name: "Armchair", icon: FaChair },
  { name: "Dining Table", icon: FaTable },
  { name: "Blender", icon: FaBlender },
  { name: "Dishwasher", icon: FaSink },
  { name: "Toaster", icon: FaBreadSlice },
  { name: "Trash Disposal", icon: FaTrash },
  { name: "Cleaning Supplies", icon: FaBroom },
  { name: "Soap/Shampoo", icon: FaSoap },
  { name: "Extra Towels", icon: FaTshirt },
  { name: "Hair Dryer", icon: FaAirFreshener },
  { name: "Security Camera", icon: FaCamera },
  { name: "Books", icon: FaBook },
  { name: "Gaming Console", icon: FaGamepad },
  { name: "Music System", icon: FaMusic },
  { name: "Bicycles", icon: FaBicycle },
  { name: "Car Rental", icon: FaCar },
  { name: "Public Transport Access", icon: FaBus },
  { name: "Airport Shuttle", icon: FaPlane },
  { name: "Garden", icon: FaTree },
  { name: "Balcony", icon: FaSun },
];

const amenitiesMap = new Map(
  amenitiesList.map((item) => [item.name, item.icon])
);

const AmenitiesDisplay = ({ amenities }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validAmenities = Array.isArray(amenities)
    ? amenities.filter((amenity) => amenitiesMap.has(amenity)) // Only include amenities from amenitiesList
    : [];
  const formattedAmenities = validAmenities.map((amenity) => ({
    icon: amenitiesMap.get(amenity) || FaSwimmingPool, // Fallback to FaSwimmingPool
    label: amenity,
  }));

  const displayedAmenities = formattedAmenities.slice(0, 6); // Limit to 6 amenities initially
  const hasMoreThanSix = formattedAmenities.length > 6;

  return (
    <div>
      <section className="mb-12">
      
        {formattedAmenities.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedAmenities.map(({ icon: Icon, label }, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 bg-white rounded-lg shadow-sm" // Previous design
                >
                  <Icon className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="text-gray-700">{label}</span>
                </div>
              ))}
            </div>
            {hasMoreThanSix && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Show All {formattedAmenities.length} Amenities
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-500">No amenities available</p>
        )}
      </section>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                All Amenities
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {amenitiesList.map((amenity) => {
                const isSelected = validAmenities.includes(amenity.name);
                return (
                  <div
                    key={amenity.name}
                    className="flex items-center p-3 bg-white rounded-lg shadow-sm"
                  >
                    <amenity.icon
                      className={`w-6 h-6 mr-3 ${
                        isSelected ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        isSelected ? "text-gray-700" : "text-gray-400 line-through"
                      }`}
                    >
                      {amenity.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmenitiesDisplay;