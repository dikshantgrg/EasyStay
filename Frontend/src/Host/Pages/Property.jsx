import React, { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "../../User/Components/ConfirmationModal";
import toast, { Toaster } from 'react-hot-toast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Property = () => {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/properties/host",
          {
            params: {
              page,
              limit: 10,
              title: searchTerm,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setProperties(response.data.properties);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error("Error fetching properties:", error);
        alert("Failed to fetch properties. Please try again later.");
      }
    };

    fetchProperties();
  }, [page, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedPropertyId) return;
    
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:8000/api/delete-property/${selectedPropertyId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      // Remove the deleted property from the state
      setProperties(properties.filter(prop => prop._id !== selectedPropertyId));
      setIsDeleteModalOpen(false);
      toast.success('Property deleted successfully!');
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error('Failed to delete property. Please try again later.');
    } finally {
      setIsDeleting(false);
      setSelectedPropertyId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 mt-2">
  
      <h1 className="text-3xl font-semibold text-gray-800">Your Properties</h1>

      {/* Search bar & Add button */}
      <div className="my-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="w-full sm:flex-1 flex gap-2">
          <Input
            type="text"
            placeholder="Search for a property"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            className="bg-blue-700 text-white hover:bg-blue-800"
          >
            Search
          </Button>
        </form>

        <div>
          <Button
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-full"
            asChild
          >
            <Link to="/host/property/new">
              <IoMdAdd className="text-4xl" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Properties Display */}
      <div className="mt-10">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="hidden md:flex justify-between items-center px-4">
            <div className="md:w-[400px] flex-shrink-0">
              <span className="text-lg font-semibold">Property</span>
            </div>
            <div className="grid grid-cols-4 flex-1 md:gap-4 lg:gap-6 xl:gap-8">
              <span className="text-base text-center">Location</span>
              <span className="text-base text-center">Price</span>
              <span className="text-base text-center">Status</span>
              <span className="text-base text-center">Actions</span>
            </div>
          </div>

          {/* Property Cards */}
          {properties.map((el) => (
            <div
              key={el._id}
              className="flex flex-col md:flex-row justify-between items-start p-4 rounded-lg border hover:bg-gray-50 transition-all gap-4 md:gap-0"
            >
              <div className="flex gap-4 items-center w-full md:flex-1 md:max-w-[400px]">
                <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 bg-slate-500 rounded-xl overflow-hidden">
                  <img
                    src={`http://localhost:8000/${el.images[0]}`}
                    alt={el.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-base sm:text-lg font-medium line-clamp-2 flex-1">
                  {el.title}
                </h1>
              </div>

              <div className="w-full md:flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-4 lg:gap-6 xl:gap-8">
                <div className="flex items-center justify-center">
                  <span className="text-sm md:text-base line-clamp-1 text-center">
                    {el.addressId.city}, {el.addressId.street}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-sm md:text-base font-medium">
                    Rs {el.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <span
                    className={`text-sm md:text-base px-3 py-1 rounded-full min-w-[100px] text-center ${
                      el.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : el.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {el.status === "pending"
                      ? "Pending"
                      : el.status === "approved"
                      ? "Active"
                      : "Rejected"}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2">
                  <Button
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 w-full"
                    asChild
                  >
                    <Link to={`/host/property/${el._id}`}>Edit</Link>
                  </Button>
                  <Button
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200 w-full"
                    asChild
                  >
                    <Link to={`/host/property/reviews/${el._id}`}>
                      View Review
                    </Link>
                  </Button>
                  <Button
                    className="bg-red-100 text-red-800 hover:bg-red-200 w-full"
                    onClick={() => {
                      setSelectedPropertyId(el._id);
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.currentPage === 1}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-100"
                />
              </PaginationItem>

              {[...Array(pagination.totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    onClick={() => setPage(index + 1)}
                    isActive={pagination.currentPage === index + 1}
                    className={`${
                      pagination.currentPage === index + 1
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setPage((prev) => Math.min(pagination.totalPages, prev + 1))
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-100"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedPropertyId(null);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Property;
