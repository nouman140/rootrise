import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import os from "os";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  let tempFilePath;
  try {
    // Verify Cloudinary config
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      throw new Error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
    }
    if (!process.env.CLOUDINARY_API_KEY) {
      throw new Error("Missing CLOUDINARY_API_KEY");
    }
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error("Missing CLOUDINARY_API_SECRET");
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log(`Uploading file: ${file.name}, Size: ${file.size} bytes`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to temp file
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `temp_${Date.now()}_${file.name}`);

    await writeFile(tempFilePath, buffer);
    console.log(`Temp file saved to: ${tempFilePath}`);

    // Upload to Cloudinary
    console.log("Starting Cloudinary upload...");
    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: "root-rise-shop/products",
      resource_type: "auto",
      max_file_size: 5242880, // 5MB
      timeout: 60000, // 60 seconds timeout
    });

    console.log(`Upload successful: ${result.secure_url}`);

    // Clean up temp file
    if (tempFilePath) {
      await unlink(tempFilePath).catch((err) =>
        console.error("Error cleaning up temp file:", err),
      );
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Clean up temp file if it exists
    if (tempFilePath) {
      await unlink(tempFilePath).catch((err) =>
        console.error("Error cleaning up temp file:", err),
      );
    }

    return NextResponse.json(
      {
        error: error.message || "Upload failed",
        details:
          process.env.NODE_ENV === "development" ? error.toString() : undefined,
      },
      { status: 500 },
    );
  }
}
