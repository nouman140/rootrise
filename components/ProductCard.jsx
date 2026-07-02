"use client";

import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart as addToCartAction,
  selectCartItems,
} from "../store/cartSlice";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { selectUser, selectAuthIsLoading } from "../store/authSlice";
import { useRouter } from "next/navigation";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const user = useSelector(selectUser);
  const authLoading = useSelector(selectAuthIsLoading);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isInCart = cartItems.some((item) => item.id === product.id);

  const handleAddToCart = async (e) => {
    // Prevent card click navigation when pressing Add to Cart
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
    // if(product.stock === 0) {}
    try {
      setIsLoading(true);
      dispatch(
        addToCartAction({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          stock: product.stock,
        }),
      );
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const stockStatus = product.stock > 0 ? "In Stock" : "Out of Stock";
  const isOutOfStock = product.stock === 0;

  const goToProductDetails = () => {
    if (!product?.id) return;
    router.push(`/products/${product.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer">
      <div onClick={goToProductDetails}>
        <div className="relative w-full h-48 bg-gray-200">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="10"
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-300">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
            {product.category}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
            {product.name}
          </h3>

          {/* <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p> */}

          <div className="flex justify-between items-center mb-4">
            <span className="text-2xl font-bold text-blue-600">
              Rs. {product.price.toFixed(0)}
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
      <button
        onClick={handleAddToCart}
        disabled={isOutOfStock || isLoading}
        className={`w-4/5 m-auto my-2 flex items-center justify-center space-x-2 py-2 rounded-lg transition font-semibold ${
          isOutOfStock
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
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
    </div>
  );
}
