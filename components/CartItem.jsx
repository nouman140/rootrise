"use client";

import Image from "next/image";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateQuantity,
  removeFromCartAndPersist,
} from "../store/cartSlice";
import { selectAuthIsLoading } from "../store/authSlice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CartItem({ item }) {
  const dispatch = useDispatch();
  const authLoading = useSelector(selectAuthIsLoading);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    try {
      setIsLoading(true);
      dispatch(updateQuantity({ productId: item.id, quantity: newQuantity }));
    } catch (error) {
      toast.error("Failed to update quantity");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    const confirmed = await new Promise((resolve) => {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <div className="font-semibold">Remove this item?</div>
          <div className="flex gap-3">
            <button
              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
            >
              Yes
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
            >
              No
            </button>
          </div>
        </div>
      ));
    });

    if (!confirmed) return;

    try {
      setIsLoading(true);
      await dispatch(removeFromCartAndPersist(item.id)).unwrap();
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToShop = () => {
    router.push("/");
  };

  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <button
        onClick={handleBackToShop}
        disabled={isLoading}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
        aria-label="Back to shop"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="w-24 h-24 relative flex-shrink-0 bg-gray-200 rounded">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover rounded"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-300">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
        <p className="text-blue-600 font-bold text-lg">
          Rs. {item.price.toFixed(0)}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-gray-100 rounded-lg p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={isLoading}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
          >
            <Minus size={18} />
          </button>
          <span className="w-8 text-center font-semibold">{item.quantity}</span>
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            disabled={isLoading || item.quantity >= item.stock}
            className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm text-gray-500">Total</p>
        <p className="text-xl font-bold text-gray-800">
          Rs. {(item.price * item.quantity).toFixed(0)}
        </p>
      </div>

      <button
        onClick={handleRemove}
        disabled={isLoading}
        className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
