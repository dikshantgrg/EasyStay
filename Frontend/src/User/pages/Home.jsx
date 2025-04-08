import React, { useEffect, useState } from "react";
import SearchBar from "../Components/SearchBar";
import Property from "../Components/Property";
import Footer from "../Components/Footer";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import img from "../../assets/123.png"; // Adjust the path as necessary
const Home = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <div>
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <img
          src={img}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover "
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40 " />

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

      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Explore Our Properties</h1>

        {isLoading ? (
          <p className="text-center text-gray-500 py-10">
            Loading properties...
          </p>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">
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
