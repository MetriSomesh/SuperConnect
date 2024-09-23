// pages/api/upload.tsx

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest, res: NextResponse) => {
  try {
    const formData = await req.formData();
    const file: File | null = formData.get("image") as unknown as File;

    if (!file) {
      return NextResponse.json(
        {
          msg: "Failed to get image",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const apiKey = process.env.API_KEY;
    const uploadImg = await axios.post(
      "https://api.imgbb.com/1/upload",
      {
        key: apiKey,
        image: buffer.toString("base64"),
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (uploadImg.data && uploadImg.data.data && uploadImg.data.data.url) {
      const imageUrl = uploadImg.data.data.url;
      return NextResponse.json(
        {
          msg: "Image uploaded successfully",
          imageUrl: imageUrl,
        },
        { status: 200 }
      );
    } else {
      console.error("Error uploading to cloud service:", uploadImg.data);
      return NextResponse.json(
        {
          msg: "Failed to upload image to cloud service",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      {
        msg: "Failed to process file",
      },
      { status: 500 }
    );
  }
};
