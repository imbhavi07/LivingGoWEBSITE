export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { uploadToCloudinary } from '@/lib/api/cloudinary';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    // Helper function to get string value from FormData
    const getString = (key: string): string | null => {
      const value = formData.get(key);
      return typeof value === 'string' ? value : null;
    };

    // Helper function to get number value from FormData
    const getNumber = (key: string): number | undefined => {
      const value = formData.get(key);
      if (typeof value === 'string') {
        const num = parseFloat(value);
        return isNaN(num) ? undefined : num;
      }
      return undefined;
    };

    // Helper function to get integer value from FormData
    const getInt = (key: string): number | undefined => {
      const value = formData.get(key);
      if (typeof value === 'string') {
        const num = parseInt(value, 10);
        return isNaN(num) ? undefined : num;
      }
      return undefined;
    };

    // Helper function to get JSON array from FormData
    const getJsonArray = (key: string): string[] => {
      const value = formData.get(key);
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed.map(String) : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    // Extract required string fields
    const title = getString('title');
    const description = getString('description');
    const location = getString('location'); 
    const preference = getString('preference') as 'Boys' | 'Girls' | 'Any' | null;

    if (!title || title.trim() === '') return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!description || description.trim() === '') return NextResponse.json({ error: "Description is required" }, { status: 400 });
    if (!location || location.trim() === '') return NextResponse.json({ error: "Location is required" }, { status: 400 });
    if (!preference) return NextResponse.json({ error: "Preference is required" }, { status: 400 });

    // Extract optional string fields
    const getOptionalString = (key: string): string | null => {
      const value = getString(key);
      return value && value.trim() !== '' ? value.trim() : null;
    };

    const mealPlan = getOptionalString('mealPlan');
    const curfewTime = getOptionalString('curfewTime');
    const noticePeriod = getOptionalString('noticePeriod');
    const rulesStrictness = getOptionalString('rulesStrictness');
    const managerContact = getOptionalString('managerContact');
    const securityContact = getOptionalString('securityContact');
    
    // FIX: Safely parse security deposit as an integer (Prisma usually expects Int here)
    const securityDepositMonths = getOptionalString('securityDepositMonths');

    // Extract numeric fields
    const priceSingle = getNumber('priceSingle');
    const priceDouble = getNumber('priceDouble');
    const priceTriple = getNumber('priceTriple');
    const bedsSingle = getInt('bedsSingle');
    const bedsDouble = getInt('bedsDouble');
    const bedsTriple = getInt('bedsTriple');
    const lat = getNumber('lat');
    const lng = getNumber('lng');

    // Extract JSON array fields
    const mealTimes = getJsonArray('mealTimes');
    const facilities = getJsonArray('facilities');

    // Validate at least one room type with price and beds > 0
    const hasSingle = priceSingle !== undefined && priceSingle > 0 && bedsSingle !== undefined && bedsSingle > 0;
    const hasDouble = priceDouble !== undefined && priceDouble > 0 && bedsDouble !== undefined && bedsDouble > 0;
    const hasTriple = priceTriple !== undefined && priceTriple > 0 && bedsTriple !== undefined && bedsTriple > 0;
    
    if (!hasSingle && !hasDouble && !hasTriple) {
      return NextResponse.json({ error: "At least one room type with price and beds must be provided" }, { status: 400 });
    }

    const prices = [priceSingle, priceDouble, priceTriple].filter((p): p is number => p !== undefined && p > 0);
    const price = Math.min(...prices);

    let roomType: 'Single' | 'Shared' = 'Single';
    let sharedType: string | undefined;
    if (hasDouble || hasTriple) {
      roomType = 'Shared';
      if (hasDouble) sharedType = 'Double';
      else if (hasTriple) sharedType = 'Triple';
    }

    // CRITICAL FIX: Convert Web Files to Base64 for Cloudinary
    const imageFiles = formData.getAll('images') as File[]; 
    const uploadedImages = await Promise.all(
      imageFiles.map(async (file) => {
        if (!(file instanceof File)) throw new Error('Invalid file');
        
        try {
          // Convert the file to a buffer, then to a base64 string
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
          
          // uploadToCloudinary expects a File in some typings; pass the base64 string
          // and cast to satisfy TypeScript. The implementation should accept data URLs.
          const result = await uploadToCloudinary(base64Image as unknown as File);
          return { url: result.url, publicId: result.publicId };
        } catch (uploadError) {
          console.error("🚨 Cloudinary Upload Failed:", uploadError);
          throw new Error("Failed to upload image to Cloudinary");
        }
      })
    );

    // Build the payload object
    const propertyData = {
      ownerId: userId,
      title: title.trim(),
      description: description.trim(),
      price,
      location: location.trim(),
      roomType,
      preference,
      mealPlan,
      curfewTime,
      noticePeriod,
      rulesStrictness,
      managerContact,
      securityContact,
      securityDepositMonths, 
      priceSingle,
      priceDouble,
      priceTriple,
      bedsSingle,
      bedsDouble,
      bedsTriple,
      lat,
      lng,
      mealTimes,
      facilities,
      sharedType,
      images: {
        create: uploadedImages.map(img => ({
          url: img.url,
          publicId: img.publicId,
        })),
      },
    };

    try {
      // Create property
      const property = await prisma.property.create({
        data: propertyData,
        include: { images: true },
      });
      return NextResponse.json(property, { status: 201 });
      
    } catch (dbError) {
      console.error("🚨 Prisma Database Error! Payload was:", JSON.stringify(propertyData, null, 2));
      console.error("🚨 Exact Prisma Error:", dbError);
      return NextResponse.json({ error: "Database creation failed. Check terminal." }, { status: 500 });
    }

  } catch (error) {
    console.error("🚨 Fatal Server Error in Property POST:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const properties = await prisma.property.findMany({
      where: {
        ownerId: userId,
      },
      include: {
        images: true, // Make sure we fetch the images so the dashboard can display thumbnails
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(properties, { status: 200 });
  } catch (error) {
    console.error("🚨 Fatal Server Error in Property GET:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}