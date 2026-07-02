"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function ProductFilters({
  onCategoryChange,
  onPriceChange,
  categories = [],
}) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [expandedCategory, setExpandedCategory] = useState(false);
  const [expandedPrice, setExpandedPrice] = useState(false);

  const handleCategoryChange = (category) => {
    const newCategory = selectedCategory === category ? "" : category;
    setSelectedCategory(newCategory);
    onCategoryChange(newCategory);
  };
  const handleAllCategory = () => {
    const newCategory = "";
    setSelectedCategory(newCategory);
    onCategoryChange(newCategory);
  };

  const handlePriceChange = (type, value) => {
    const newRange = [...priceRange];
    if (type === "min") {
      newRange[0] = Math.min(parseInt(value) || 0, newRange[1]);
    } else {
      newRange[1] = Math.max(parseInt(value) || 100000, newRange[0]);
    }
    setPriceRange(newRange);
    onPriceChange(newRange[0], newRange[1]);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Filters</h2>

      {/* Category Filter */}
      <div className="mb-6 border-b pb-4">
        <h3 className="text-lg font-semibold text-gray-800 my-3">Category</h3>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              checked={selectedCategory === ""}
              onChange={() => handleAllCategory()}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
            <span className="ml-3 text-gray-700">All Categories</span>
          </label>
          {categories.length > 0 ? (
            categories.map((category) => (
              <label
                key={category}
                className="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  checked={selectedCategory === category}
                  onChange={() => handleCategoryChange(category)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
                <span className="ml-3 text-gray-700">{category}</span>
              </label>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No categories available</p>
          )}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 my-3">
          Price Range
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Min :{priceRange[0].toLocaleString()} Rs
            </label>
            <input
              type="range"
              min="0"
              max="100000"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange("min", e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Max :{priceRange[1].toLocaleString()} Rs
            </label>
            <input
              type="range"
              min="0"
              max="100000"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange("max", e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
