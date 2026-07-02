"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById, updateProduct } from "/lib/firebaseAdmin";
import ProductForm from "/components/ProductForm";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id;
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const productData = await getProductById(productId);
      if (productData) {
        setProduct(productData);
      } else {
        toast.error("Product not found");
        router.push("/admin/products");
      }
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Failed to load product");
      router.push("/admin/products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (productData, imageFile) => {
    try {
      setIsSubmitting(true);
      await updateProduct(productId, productData, imageFile);
      toast.success("Product updated successfully!");
      router.push("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Edit Product</h1>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        initialData={product}
      />
    </div>
  );
}
