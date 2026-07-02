"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProduct } from "/lib/firebaseAdmin";
import ProductForm from "/components/ProductForm";
import toast from "react-hot-toast";

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (productData, imageFile) => {
    console.log(productData, imageFile);
    try {
      setIsLoading(true);
      await addProduct(productData, imageFile);
      toast.success("Product added successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error.message || "Failed to add product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Add New Product</h1>
      </div>

      <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
