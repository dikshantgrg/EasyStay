import React, { useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import LocationPicker from "./LocationPicker";

const Step4 = ({ formData, handleChange, errors }) => {
  useEffect(() => {
    if (!formData.latitude && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleChange("latitude", position.coords.latitude);
          handleChange("longitude", position.coords.longitude);
        },
        (error) => {
          console.error("Error fetching geolocation:", error);
        }
      );
    }
  }, [formData.latitude, handleChange]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-6 divide-y divide-gray-200">
        <div className="space-y-2">
          <div className="border-b border-gray-200 pb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Property Location
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Click on the map to set your property's exact location
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <div
              className={`rounded-lg overflow-hidden shadow-lg border ${
                errors.latitude || errors.longitude ? "border-red-500" : "border-gray-200"
              }`}
            >
              <MapContainer
                center={[
                  formData.latitude || 28.3949,
                  formData.longitude || 84.124,
                ]}
                zoom={5}
                className="h-96 w-full"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationPicker formData={formData} handleChange={handleChange} />
              </MapContainer>
            </div>
            {(errors.latitude || errors.longitude) && (
              <p className="mt-1 text-sm text-red-500">
                {errors.latitude || errors.longitude || "Please set a valid location"}
              </p>
            )}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <div className="text-gray-900 font-mono text-sm pointer-events-none">
                  {formData.latitude !== undefined ? formData.latitude : "Not set"}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <div className="text-gray-900 font-mono text-sm pointer-events-none">
                  {formData.longitude !== undefined ? formData.longitude : "Not set"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4;