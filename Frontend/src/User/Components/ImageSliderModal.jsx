import React, { useState } from 'react';

const ImageSliderModal = ({ isOpen, closeModal, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to the first image
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(images.length - 1); // Loop back to the last image
    }
  };

  if (!isOpen) return null; // If modal is not open, return nothing

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="relative bg-white p-6 rounded-lg max-w-4xl max-h-[80%] overflow-hidden">
        <button 
          onClick={closeModal} 
          className="absolute top-4 right-4 text-3xl text-gray-700 hover:text-black"
        >
          &times;
        </button>

        <div className="flex justify-center items-center">
          <button 
            onClick={prevImage} 
            className="absolute left-4 text-3xl text-gray-700 bg-white rounded-full p-2 shadow-lg hover:text-black"
          >
            &lt;
          </button>

          <img 
            src={images[currentIndex]} 
            alt="slider" 
            className="w-full h-[500px] object-cover rounded-md"
          />

          <button 
            onClick={nextImage} 
            className="absolute right-4 text-3xl text-gray-700 bg-white rounded-full p-2 shadow-lg hover:text-black"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSliderModal;
