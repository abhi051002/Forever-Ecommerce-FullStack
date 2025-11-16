import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { backEndURL, currency } from "../App";
import { toast } from "react-toastify";
import ProductUpdateModal from "./ProductUpdateModal";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoSearchOutline } from "react-icons/io5";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filters + pagination
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [bestseller, setBestseller] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Delete modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch List With Filters & Pagination
  const fetchList = async () => {
    try {
      const response = await axios.get(`${backEndURL}/api/product/list`, {
        params: {
          page: currentPage,
          limit,
          search,
          category,
          subCategory,
          bestseller,
        },
      });

      if (response.data.success) {
        setList(response.data.products);
        setTotalPages(response.data.totalPages || 1);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openDeleteModal = (item) => {
    setToDelete(item);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete?._id) return;
    try {
      setDeleting(true);
      const response = await axios.post(
        backEndURL + "/api/product/remove",
        { id: toDelete._id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message || "Product deleted");
        setConfirmOpen(false);
        setToDelete(null);
        fetchList();
      } else {
        toast.error(response.data.message || "Delete failed");
      }
    } catch (error) {
      toast.error(error.message || "Network error");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchList();
  };

  return (
    <>
      <p className="mb-3 text-lg font-semibold">Product Management</p>

      {/* SEARCH + FILTERS */}
      <div className="bg-white p-4 rounded-lg shadow mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <IoSearchOutline
            size={20}
            className="absolute left-3 top-3 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 p-2 border rounded-md"
          />
        </div>

        {/* Category */}
        <select
          className="border p-2 rounded-md"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
        </select>

        {/* Sub Category */}
        <select
          className="border p-2 rounded-md"
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
        >
          <option value="">All Sub Categories</option>
          <option value="Topwear">Topwear</option>
          <option value="Bottomwear">Bottomwear</option>
          <option value="Winterwear">Winterwear</option>
        </select>

        {/* Bestseller */}
        <select
          value={bestseller}
          onChange={(e) => setBestseller(e.target.value)}
          className="border p-2 rounded-md"
        >
          <option value="">All Products</option>
          <option value="true">Bestseller Only</option>
        </select>

        {/* BUTTONS — Apply + Clear */}
        <div className="md:col-span-4 flex gap-3">
          <button
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            onClick={applyFilters}
          >
            Apply Filters
          </button>

          <button
            className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition"
            onClick={() => {
              setSearch("");
              setCategory("");
              setSubCategory("");
              setBestseller("");
              setCurrentPage(1);
              fetchList();
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* PRODUCT LIST */}
      <div className="flex flex-col gap-2">
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] py-2 px-3 border bg-gray-100 text-sm font-semibold">
          <p>Image</p>
          <p>Name</p>
          <p>Category</p>
          <p>Price</p>
          <p className="text-center">Edit</p>
          <p className="text-center">Delete</p>
        </div>

        {list.length === 0 && (
          <p className="text-center text-gray-600 mt-3">No Products Found</p>
        )}

        {list.map((item) => (
          <div
            key={item._id}
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr]
                       items-center gap-3 py-2 px-3 border rounded-md bg-white shadow-sm"
          >
            <img
              src={item.image[0]}
              className="w-12 h-12 object-cover rounded-md"
              alt="product"
            />

            <p className="font-medium">{item.name}</p>
            <p className="text-gray-600">{item.category}</p>
            <p className="font-semibold">
              {currency}
              {item.price}
            </p>

            {/* Edit */}
            <button
              className="hidden md:flex justify-center text-blue-600 hover:text-blue-800 transition"
              onClick={() => {
                setSelectedProduct(item);
                setShowModal(true);
              }}
            >
              <FiEdit size={20} />
            </button>

            {/* Delete */}
            <button
              className="hidden md:flex justify-center text-red-500 hover:text-red-700 transition"
              onClick={() => openDeleteModal(item)}
            >
              <RiDeleteBin6Line size={20} />
            </button>

            {/* MOBILE BUTTONS */}
            <div className="flex md:hidden gap-4 justify-center">
              <button
                onClick={() => {
                  setSelectedProduct(item);
                  setShowModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 transition"
              >
                <FiEdit size={20} />
              </button>

              <button
                onClick={() => openDeleteModal(item)}
                className="text-red-500 hover:text-red-700 transition"
              >
                <RiDeleteBin6Line size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 mt-5">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-2 border rounded ${
              currentPage === i + 1 ? "bg-blue-600 text-white" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          className="px-3 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* UPDATE MODAL */}
      {showModal && (
        <ProductUpdateModal
          key={selectedProduct._id}
          product={selectedProduct}
          closeModal={() => setShowModal(false)}
          refreshList={fetchList}
          token={token}
        />
      )}

      {/* CONFIRM DELETE MODAL */}
      <ConfirmDeleteModal
        open={confirmOpen}
        onClose={() => {
          if (!deleting) {
            setConfirmOpen(false);
            setToDelete(null);
          }
        }}
        onConfirm={confirmDelete}
        product={toDelete}
        loading={deleting}
      />
    </>
  );
};

export default List;
