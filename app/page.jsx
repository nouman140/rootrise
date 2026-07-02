"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import { getProducts } from "../lib/firebaseAdmin";
import { Loader, Search } from "lucide-react";
import toast from "react-hot-toast";
import Admin from "./admin/layout";

export default function Home() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [categories, setCategories] = useState([]);

  const PAGE_SIZE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const allProducts = await getProducts();
      setProducts(allProducts);

      // Extract unique categories
      const uniqueCategories = [...new Set(allProducts.map((p) => p.category))];
      setCategories(uniqueCategories);

      filterProducts(allProducts, "", [0, 100000]);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = (
    allProducts,
    search,
    price,
    category = selectedCategory,
  ) => {
    let filtered = allProducts;

    // Filter by category
    if (category) {
      filtered = filtered.filter((p) => {
        const match = p.category === category;
        return match;
      });
    }

    // Filter by price range
    filtered = filtered.filter((p) => {
      const match = p.price >= price[0] && p.price <= price[1];
      return match;
    });

    // Filter by search term
    if (search) {
      filtered = filtered.filter((p) => {
        const match = p.name.toLowerCase().includes(search.toLowerCase());
        return match;
      });
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterProducts(products, searchTerm, priceRange, category);
  };

  const handlePriceChange = (min, max) => {
    setPriceRange([min, max]);
    filterProducts(products, searchTerm, [min, max]);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    filterProducts(products, term, priceRange);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800  rounded-lg shadow-lg p-8 mb-12 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to RootRise
        </h1>
        <p className="text-xl mb-6">
          Discover amazing products at unbeatable prices
        </p>
        <div className="max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search for products by title"
              className="w-full px-4 py-3 rounded-lg text-gray-800 pl-12"
            />
            <Search
              className="absolute left-4 top-3.5 text-gray-600"
              size={20}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <ProductFilters
            categories={categories}
            onCategoryChange={handleCategoryChange}
            onPriceChange={handlePriceChange}
          />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader className="animate-spin text-blue-600" size={48} />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-600">
                  Showing{" "}
                  <span className="font-semibold">
                    {filteredProducts.length}
                  </span>{" "}
                  products
                </p>
              </div>

              {/* Pagination */}
              {(() => {
                const totalPages =
                  Math.ceil(filteredProducts.length / PAGE_SIZE) || 1;
                const startIndex = (currentPage - 1) * PAGE_SIZE;
                const pageItems = filteredProducts.slice(
                  startIndex,
                  startIndex + PAGE_SIZE,
                );

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {pageItems.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 mt-8">
                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="px-4 py-2 rounded-lg border hover:bg-blue-100 font-medium border-blue-600 disabled:opacity-50"
                        >
                          Prev
                        </button>

                        <span className="text-gray-700">
                          Page{" "}
                          <span className="font-semibold">{currentPage}</span>{" "}
                          of <span className="font-semibold">{totalPages}</span>
                        </span>

                        <button
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 rounded-lg border hover:bg-blue-100 font-medium border-blue-600 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
