import React from "react";

const Property = ({ id, title, image, city, street, price }) => {
  return (
    // <div
    //   key={id}
    //   className="border border-gray-200 rounded-lg  overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl"
    // >
    //   <img
    //     src={`http://localhost:8000/${image}`}
    //     className="w-full h-80 object-cover"
    //   />
    //   <div className="p-4">
    //     <h3 className="text-xl font-semibold mb-2">{title}</h3>
    //     <p className="text-gray-600 mb-2">{city} {street}</p>
    //     <div className="flex items-center mb-3"></div>
    //     <p className="text-lg font-semibold text-blue-600 mt-2">{price}/night</p>
    //   </div>
    // </div>
    <div
      key={id}
      className=" w- group relative border-2 border-gray-200 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-gray-300 hover:scale-105"
    >
      {/* Image with overlay effect */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={`http://localhost:8000/${image}`}
          alt="Property image"
          className=" w-full h-full object-cover transition-transform duration-500 group-hover:scale-100"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/20" />
      </div>

      <div className="p-4">
        {/* Title and location */}
        <div className="">
          <h3 className="text-xl font-semibold text-gray-800 transition-colors group-hover:text-blue-600">
            {title}
          </h3>
          <div className="flex items-center text-gray-600 ">
            <span className="text-sm">
              {city} {street}
            </span>
          </div>
        </div>

        <div className="mt- flex items-center justify-between">
          <p className="text-lg font-bold text-blue-600">
           NPR {price}
            <span className="text-sm font-normal text-gray-500 ml-1">
              /night
            </span>
          </p>
        </div>
      </div>

      {/* Favorite button */}
    </div>
  );
};

export default Property;
