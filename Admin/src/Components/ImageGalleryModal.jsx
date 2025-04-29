import { useEffect, useState } from "react";
import {  IoIosArrowForward, IoIosArrowBack } from "react-icons/io";
import { RxCross1 } from "react-icons/rx";

const ImageGalleryModal = ({ images, isOpen, onClose, initialIndex }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex || 0);
    useEffect(() => {
      setCurrentIndex(initialIndex || 0);
    }, [initialIndex]);

    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight') {
          setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowLeft') {
          setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
        }
      };
  
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [images.length]);
    if (!isOpen) return null;
  
    return (
        <div className="relative">
      <div className="fixed  inset-0 bg-black/90 z-[99999999] flex items-center justify-center p-4">
        <div className="  w-full max-w-6xl h-[90vh]">
          <button
            onClick={onClose}
            className="absolute top-4 right-11 text-white text-5xl z-50 hover:text-gray-500"
          >
           <RxCross1 />
          </button>
  
          <div className="h-full flex gap-4">
            {/* Main Image */}
            <div className="flex-1 relative">
              <img
                src={`http://localhost:8000/${images[currentIndex]}`}
                alt={`Slide ${currentIndex + 1}`}
                className="w-full h-full object-contain"
              />
  
              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    <IoIosArrowBack className="text-2xl" />
                  </button>
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    <IoIosArrowForward className="text-2xl" />
                  </button>
                </>
              )}
            </div>
  
            {/* Thumbnails */}
            <div className=" mt-3 w-32 hidden md:block overflow-y-auto">
              <div className="grid gap-2">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={`http://localhost:8000/${img}`}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-full h-20 object-cover cursor-pointer border-2 ${
                      index === currentIndex ? "border-blue-700" : "border-transparent"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
  
          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>
      </div>
    );
  };

  export default ImageGalleryModal;