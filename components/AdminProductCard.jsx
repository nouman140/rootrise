'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProductCard({ product, onDelete, onEdit }) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await onDelete(product.id);
        toast.success('Product deleted successfully');
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="relative w-full h-40 bg-gray-200">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-300">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.category}</p>
          </div>
          <span className={`px-2 py-1 rounded text-sm font-semibold ${
            product.stock > 0
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {product.stock} left
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="mb-4">
          <span className="text-2xl font-bold text-blue-600">
            Rs. {product.price.toFixed(0)}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Edit size={18} />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
          >
            <Trash2 size={18} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
