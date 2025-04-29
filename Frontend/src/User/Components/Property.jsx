import React from "react";

const Property = ({ id, title, image, city, street, price }) => {
  return (
    <div
      key={id}
      className="w-[300px] h-[400px] group relative border-2 border-gray-200 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:scale-105"
    >
      {/* Image with overlay effect */}
      <div className="relative h-[250px] overflow-hidden">
        <img
          src={`http://localhost:8000/${image}`}
          alt="Property image"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-100"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/20" />
      </div>

      <div className="p-4 flex flex-col justify-between h-[150px]">
        {/* Title and location */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 transition-colors group-hover:text-blue-600 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center text-gray-600">
            <span className="text-sm truncate">
              {city}, {street}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-blue-600">
            Rs {price}
            <span className="text-sm font-normal text-gray-500 ml-1">
              /night
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Property;
