import React, { useEffect, useRef } from "react";
import SearchBar from "../Components/SearchBar";
import Property from "../Components/Property";
import Footer from "../Components/Footer";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import img from "../../assets/123.png"; // Adjust the path as necessary
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import CityCard from "../Components/CityCard";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import pkr from "../../assets/aryan-bhattarai-eLzo-6a2B0w-unsplash.jpg";
import ktm from "../../assets/kathmandu.jpg";
import lum from "../../assets/lumbini.jpg";
import chi from "../../assets/960553.jpg"; // Adjust the path as necessary

const cities = [
  {
    name: "Kathmandu",
    image: ktm,
  },
  {
    name: "Pokhara",
    image: pkr,
  },
  {
    name: "Chitwan",
    image: chi,
  },
  {
    name: "Lumbini",
    image: lum,
  },
];

const Home = () => {
  const [properties, setProperties] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/properties");
      setProperties(response.data.properties || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearch = (e, { destination, checkIn, checkOut, guests }) => {
    e.preventDefault();
    navigate("/properties", {
      state: {
        destination,
        checkIn: checkIn ? moment(checkIn).format("YYYY-MM-DD") : null,
        checkOut: checkOut ? moment(checkOut).format("YYYY-MM-DD") : null,
        guests,
      },
    });
  };

  // Responsive breakpoints for the carousel
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
      slidesToSlide: 1,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3,
      slidesToSlide: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1,
    },
  };

  const handlePrevious = () => {
    if (carouselRef.current) {
      carouselRef.current.previous();
    }
  };

  const handleNext = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };

  return (
    <div>
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <img
          src={img}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Foreground Content */}
        <div className="relative z-20 container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white">
              Find Your Perfect Stay
            </h1>
            <p className="text-lg text-white mt-2">
              Explore properties tailored to your needs
            </p>
          </div>
          <SearchBar mode="full" onSearch={handleSearch} />
        </div>
      </section>

      {/* Explore by Destination Section */}
      <div className="relative py-8">
        <div className="relative max-w-7xl mx-auto">
          <div>
            <h2 className="text-3xl font-bold mb-6">Explore by Destination</h2>
          </div>

          {/* Previous Button */}
          <div className="absolute top-36 -translate-y-1/2 -left-1 md:-left-10 z-10">
            <button
              className="hidden md:flex p-2 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200"
              onClick={handlePrevious}
            >
              <FiChevronLeft className="w-6 h-6 text-black" />
            </button>
          </div>

          {/* Carousel */}
          <Carousel
            ref={carouselRef}
            responsive={responsive}
            arrows={false}
            swipeable
            draggable
            infinite={true}
            autoPlay={false}
            keyBoardControl
            containerClass="carousel-container"
            itemClass="carousel-item"
          >
            {cities.map((city, index) => (
              <CityCard
                key={`${city.name}-${index}`}
                name={city.name}
                image={city.image}
                onClick={(e) =>
                  handleSearch(e, {
                    destination: city.name,
                    checkIn: null,
                    checkOut: null,
                    guests: null,
                  })
                }
              />
            ))}
          </Carousel>

          {/* Next Button */}
          <div className="absolute top-36 -translate-y-1/2 -right-1 md:-right-10 z-10">
            <button
              className="hidden md:flex p-2 bg-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200"
              onClick={handleNext}
            >
              <FiChevronRight className="w-6 h-6 text-black" />
            </button>
          </div>
        </div>
      </div>

      {/* Explore Our Properties Section */}
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold ">Discover Your Next Stay</h2>
          <button
            className=" text-blue-600   hover:text-blue-800 transition duration-200 pr-1"
            onClick={() => navigate("/properties")}
          >
            Discover more
          </button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 py-10">
            Loading properties...
          </p>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mt-3">
            {properties.map((el) => (
              <Link to={`/property/${el._id}`} key={el._id}>
                <Property
                  id={el._id}
                  title={el.title}
                  image={
                    el.images &&
                    Array.isArray(el.images) &&
                    el.images.length > 0
                      ? el.images[0]
                      : null
                  }
                  city={el.addressId?.city || "Unknown City"}
                  street={el.addressId?.street || "Unknown Street"}
                  price={el.price}
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">
            No properties found.
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Home;
