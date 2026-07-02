import { db, storage } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  getDoc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

// Detect if an image value looks like a Cloudinary URL.
const isCloudinaryUrl = (value) =>
  typeof value === "string" &&
  (value.includes("res.cloudinary.com/") || value.includes("/image/upload/"));

// Detect if an image value looks like a Firebase Storage download URL.
// (Used only to avoid calling deleteObject with Cloudinary URLs.)
const isFirebaseStorageUrl = (value) =>
  typeof value === "string" &&
  value.startsWith("https://firebasestorage.googleapis.com/");

// ============ PRODUCTS ============

export const addProduct = async (productData, imageFile) => {
  try {
    let imageUrl = "";

    if (imageFile) {
      // If ProductForm already uploaded to Cloudinary, we get a URL string.
      if (typeof imageFile === "string" && imageFile.trim().length > 0) {
        imageUrl = imageFile;
      } else {
        // Back-compat: Firebase Storage upload when a File is provided.
        const fileName = `${uuidv4()}_${imageFile.name}`;
        const storageRef = ref(storage, `products/${fileName}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }
    }

    const docRef = await addDoc(collection(db, "products"), {
      ...productData,
      imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const updateProduct = async (productId, productData, imageFile) => {
  try {
    const productRef = doc(db, "products", productId);

    // productData.imageUrl might already be the existing image URL.
    let imageUrl = productData.imageUrl;

    if (imageFile) {
      // If a Cloudinary URL is provided, just set it.
      if (
        typeof imageFile === "string" &&
        imageFile.trim().length > 0 &&
        isCloudinaryUrl(imageFile)
      ) {
        imageUrl = imageFile;
      } else if (imageFile instanceof File) {
        // Back-compat: if user selected a File, upload to Firebase Storage.
        // Delete old image only if it is a Firebase Storage URL.
        if (
          productData.imageUrl &&
          isFirebaseStorageUrl(productData.imageUrl)
        ) {
          try {
            // Delete by constructing a ref from the URL is non-trivial; the current code
            // uses `ref(storage, productData.imageUrl)` which assumes it is a storage path.
            // We keep deletion guarded to avoid calling deleteObject for Cloudinary.
            const oldImageRef = ref(storage, productData.imageUrl);
            await deleteObject(oldImageRef);
          } catch (err) {
            console.log("Could not delete old image");
          }
        }

        const fileName = `${uuidv4()}_${imageFile.name}`;
        const storageRef = ref(storage, `products/${fileName}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      // If imageFile is some other string (non-cloudinary), keep it as-is.
      if (typeof imageFile === "string" && !isCloudinaryUrl(imageFile)) {
        imageUrl = imageFile;
      }
    }

    // Prevent Firestore rejecting undefined fields.
    // (Firestore doesn't allow `undefined` as a value.)
    const safeProductData = { ...productData };

    // Only set imageUrl if we actually have a value.
    // If imageFile is not provided during edit, keep existing imageUrl.
    if (imageUrl !== undefined) {
      safeProductData.imageUrl = imageUrl;
    }

    await updateDoc(productRef, {
      ...safeProductData,
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const productRef = doc(db, "products", productId);
    const productData = await getDoc(productRef);

    if (productData.exists() && productData.data().imageUrl) {
      // Only attempt Storage deletion if the URL is a Firebase Storage URL.
      if (isFirebaseStorageUrl(productData.data().imageUrl)) {
        try {
          const storageRef = ref(storage, productData.data().imageUrl);
          await deleteObject(storageRef);
        } catch (err) {
          console.log("Could not delete product image");
        }
      }
    }

    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const getProducts = async (filters = {}) => {
  try {
    let q = collection(db, "products");
    const queryConstraints = [];

    if (filters.category) {
      queryConstraints.push(where("category", "==", filters.category));
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      if (filters.minPrice !== undefined) {
        queryConstraints.push(where("price", ">=", filters.minPrice));
      }
      if (filters.maxPrice !== undefined) {
        queryConstraints.push(where("price", "<=", filters.maxPrice));
      }
    }

    if (queryConstraints.length > 0) {
      q = query(q, ...queryConstraints);
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    const docRef = doc(db, "products", productId);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

// ============ ORDERS ============

export const createOrder = async (
  userId,
  cartItems,
  totalPrice,
  paymentMethod,
  userDetails,
) => {
  try {
    const orderId = uuidv4();

    // Batch write to update product stock
    const batch = writeBatch(db);

    for (const item of cartItems) {
      const productRef = doc(db, "products", item.id);
      const productSnap = await getDoc(productRef);
      const currentStock = productSnap.data().stock || 0;
      batch.update(productRef, {
        stock: currentStock - item.quantity,
      });
    }

    // Add order
    const orderRef = doc(db, "orders", orderId);
    batch.set(orderRef, {
      orderId,
      userId,
      items: cartItems,
      totalPrice,
      paymentMethod,
      userDetails,
      status: paymentMethod === "cod" ? "Pending" : "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await batch.commit();
    return orderId;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getOrders = async (userId = null) => {
  try {
    let q = collection(db, "orders");

    if (userId) {
      q = query(q, where("userId", "==", userId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting orders:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const saveCartToFirestore = async (userId, cartItems) => {
  try {
    const cartRef = doc(db, "carts", userId);
    await setDoc(
      cartRef,
      {
        userId,
        items: cartItems,
        updatedAt: new Date(),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Error saving cart:", error);
  }
};

export const getCartFromFirestore = async (userId) => {
  try {
    const cartRef = doc(db, "carts", userId);
    const snapshot = await getDoc(cartRef);

    if (snapshot.exists()) {
      return snapshot.data().items || [];
    }
    return [];
  } catch (error) {
    console.error("Error getting cart:", error);
    return [];
  }
};
