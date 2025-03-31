import React, { useState, useEffect } from "react";
import { useMapEvents, Marker, useMap } from "react-leaflet";

const LocationPicker = ({ formData, handleChange }) => {
  const [location, setLocation] = useState(null);
  const map = useMap();

  // Update local marker state and fly to the new location when formData updates.
  useEffect(() => {
    if (formData.latitude != null && formData.longitude != null) {
      const newLocation = { lat: formData.latitude, lng: formData.longitude };
      setLocation(newLocation);
      map.flyTo([newLocation.lat, newLocation.lng], map.getZoom(12), {
        animate: true,
        duration: 1.0,
      });
    }
  }, [formData.latitude, formData.longitude, map]);

  // Listen for map click events to update location and smoothly fly to that spot.
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      const newLocation = { lat, lng };
      setLocation(newLocation);
      handleChange("latitude", lat);
      handleChange("longitude", lng);
      map.flyTo([lat, lng], map.getZoom(10), {
        animate: true,
        duration: 1.0,
      });
    },
  });

  return location ? <Marker position={[location.lat, location.lng]} /> : null;
};

export default LocationPicker;
