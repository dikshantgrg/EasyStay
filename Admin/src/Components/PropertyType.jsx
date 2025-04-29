import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import ConfirmationModal from "./ConfirmationModal";

const PropertyType = () => {
  const [propertyTypes, setPropertyTypes] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [propertyName, setPropertyName] = useState("");

  useEffect(() => {
    fetchPropertyTypes();
  }, []);

  const fetchPropertyTypes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/get/property-type",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Check if the response contains data property
      console.log(response.data);

      setPropertyTypes(Array.isArray(response.data) ? response.data : []);

      console.log(response.data);
    } catch (error) {
      console.error("Error details:", error.response || error);
      toast.error("Failed to fetch property types");
      setPropertyTypes([]);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/add/property-type",
        { title: propertyName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Property type added successfully");
      fetchPropertyTypes();
      setIsModalVisible(false);
      setPropertyName("");
    } catch (error) {
      toast.error("Failed to add property type");
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8000/api/update/property-type/${editingId}`,
        { title: propertyName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Property type updated successfully");
      fetchPropertyTypes();
      setIsModalVisible(false);
      setPropertyName("");
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to update property type");
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      await axios.delete(
        `http://localhost:8000/api/delete/property-type/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Property type deleted successfully");
      fetchPropertyTypes();
    } catch (error) {
      toast.error("Failed to delete property type");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const initiateDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const showModal = (record = null) => {
    if (record) {
      setPropertyName(record.title); // Changed from record.name to record.title
      setEditingId(record._id);
    } else {
      setPropertyName(""); // Reset property name when adding new
    }
    setIsModalVisible(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      handleUpdate();
    } else {
      handleAdd();
    }
  };

  return (
    <div className="ml-64 w-[calc(100%-16rem)] p-6 bg-gray-100 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className=" p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Property Types
          </h1>
          <button
            onClick={() => showModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 flex items-center"
          >
            <FiPlus className="mr-2" />
            Add Property Type
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Property Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {propertyTypes && propertyTypes.length > 0 ? (
                propertyTypes.map((property) => (
                  <tr key={property._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {property.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => showModal(property)}
                        className="text-blue-600 hover:text-blue-900 mr-3 transition duration-300"
                      >
                        <FiEdit2 className="h-5 w-5 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => initiateDelete(property._id)}
                        className="text-red-600 hover:text-red-900 transition duration-300"
                      >
                        <FiTrash2 className="h-5 w-5 inline mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="2"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No property types found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
              {editingId ? "Edit Property Type" : "Add Property Type"}
            </h2>
            <form onSubmit={handleSubmit}>
              <label className="block mb-4">
                <span className="text-gray-700">Property Type Name:</span>
                <input
                  type="text"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter property type name"
                />
              </label>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalVisible(false);
                    setPropertyName("");
                    setEditingId(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                >
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Property Type"
        message="Are you sure you want to delete this property type? This action cannot be undone."
        onConfirm={() => handleDelete(deleteId)}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default PropertyType;
