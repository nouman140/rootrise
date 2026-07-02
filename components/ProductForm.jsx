"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Loader } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Books",
  "Sports",
  "Toys",
  "Food",
  "Beauty",
];

export default function ProductForm({
  onSubmit,
  isLoading,
  initialData = null,
}) {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    stock: initialData?.stock || "",
    category: initialData?.category || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialData?.imageUrl || null,
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error || data.details || "Upload failed";
          throw new Error(errorMsg);
        }

        setImageFile(data.url); // Store Cloudinary URL instead of file
        setImagePreview(data.url);
        toast.success("Image uploaded successfully");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Upload failed: ${error.message}`);
        setImagePreview(null);
        setImageFile(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.category
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!imageFile && !imagePreview) {
      toast.error("Please select a product image");
      return;
    }

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
    };

    await onSubmit(submitData, imageFile);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {initialData ? "Edit Product" : "Add New Product"}
      </h2>

      <div className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Enter product name"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Enter product description"
            rows="4"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (Rs.) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="0"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image *
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition"
          >
            {imagePreview ? (
              <div className="relative w-32 h-32 mx-auto mb-4">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  sizes="10"
                  className="object-cover rounded"
                />
              </div>
            ) : (
              <Upload className="mx-auto mb-2 text-blue-600" size={32} />
            )}
            <p className="text-gray-700 font-semibold">
              {imagePreview ? "Click to change image" : "Click to upload image"}
            </p>
            <p className="text-gray-500 text-sm">PNG, JPG, GIF (max 5MB)</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isUploading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
            isLoading || isUploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? (
            <>
              <Loader size={20} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : isUploading ? (
            <>
              <Loader size={20} className="animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <span>{initialData ? "Update Product" : "Add Product"}</span>
          )}
        </button>
      </div>
    </form>
  );
}
