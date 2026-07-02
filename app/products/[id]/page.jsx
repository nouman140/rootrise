"use client"; // ← Add this at the VERY TOP

import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductById } from "/lib/firebaseAdmin";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { addToCart as addToCartAction, selectCartItems } from "/store/cartSlice";
import { selectUser, selectAuthIsLoading } from "/store/authSlice";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ProductDetailPage({ params }) {
  const { id } = params;

  // State for product data
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hooks for cart functionality
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const user = useSelector(selectUser);
  const authLoading = useSelector(selectAuthIsLoading);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch product data
  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  // Check if product is in cart
  const isInCart = product
    ? cartItems.some((item) => item.id === product.id)
    : false;

  // Handle Add to Cart
  const handleAddToCart = async (e) => {
    if (isInCart) {
      return toast.error("Item already in cart");
    }
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();

    if (authLoading) return;

    if (!user) {
      router.push("/auth/login");
      toast.error("Please login to add items to cart");
      return;
    }

    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    try {
      setIsLoading(true);
      dispatch(addToCartAction({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
      }));
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-28 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-12 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!product) {
    notFound();
  }

  const stockStatus = product.stock > 0 ? "In Stock" : "Out of Stock";
  const isOutOfStock = product.stock === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/"
        className="w-28 mb-3 border border-blue-600 hover:bg-blue-50 text-blue-600 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
      >
        <ArrowLeft size={20} />
        <span>Go Back</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Image Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="relative w-full h-96 bg-gray-200">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                <span className="text-gray-500">No Image</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold bg-blue-600 text-white px-2 py-1 rounded">
                {product.category}
              </span>
              <span
                className={`text-sm font-semibold px-2 py-1 rounded ${
                  isOutOfStock
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {stockStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-3 text-gray-600 text-lg">{product.description}</p>

          <div className="mt-6">
            <div className="text-4xl font-extrabold text-blue-600">
              Rs. {Number(product.price).toFixed(0)}
            </div>

            {product.stock > 0 && (
              <div className="mt-2 text-gray-500">
                {product.stock} items available
              </div>
            )}
          </div>

          <div className="mt-8 rounded-lg border bg-white p-4">
            <h2 className="text-lg font-semibold mb-2">Product Details</h2>
            <div className="flex justify-evenly my-3 flex-wrap gap-2">
              <div>
                <span className="font-medium">Price: </span>
                Rs. {product.price}
              </div>
              <div>
                <span className="font-medium">Category: </span>
                {product.category}
              </div>
              <div>
                <span className="font-medium">Availability: </span>
                {stockStatus}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition ${
                isOutOfStock
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : isLoading
                    ? "bg-blue-400 cursor-wait"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <ShoppingCart size={18} />
              <span>
                {isLoading
                  ? "Adding..."
                  : isInCart
                    ? "Already in Cart ✓"
                    : isOutOfStock
                      ? "Out of Stock"
                      : "Add to Cart"}
              </span>
            </button>

            {isInCart && !isOutOfStock && (
              <p className="mt-2 text-sm text-blue-600 text-center">
                This item is already in your cart
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
