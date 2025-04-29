import React from "react";

const CityCard = ({ name, image, onClick }) => (
  <div
    className="mx-2 cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
    onClick={onClick}
  >
    <div className="relative h-48">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h3 className="text-2xl font-semibold text-white">{name}</h3>
      </div>
    </div>
  </div>
);

export default CityCard;