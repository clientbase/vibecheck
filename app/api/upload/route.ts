import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer (ensure Buffer type matches sharp's expectations)
    const bytes = new Uint8Array(await file.arrayBuffer());
    let buffer: Buffer = Buffer.from(bytes);
    let outContentType = file.type || 'image/jpeg';

    // Server-side optimize with sharp if available
    try {
      const { default: sharp } = await import('sharp');
      const pipeline = sharp(buffer)
        .rotate()
        .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true });
      // Prefer JPEG for compatibility
      buffer = await pipeline.jpeg({ quality: 75, mozjpeg: true }).toBuffer();
      outContentType = 'image/jpeg';
    } catch (e) {
      // sharp not installed or failed — fall back to original buffer
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const originalExt = (file.name.split('.').pop() || '').toLowerCase();
    const extension = outContentType.includes('jpeg') || outContentType.includes('jpg') ? 'jpg' : (originalExt || 'jpg');
    const filename = `vibe-reports/${timestamp}-${randomString}.${extension}`;

    // Upload to Vercel Blob Store
    const blob = await put(filename, buffer, {
      access: 'public',
      addRandomSuffix: false,
      contentType: outContentType,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: filename,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 