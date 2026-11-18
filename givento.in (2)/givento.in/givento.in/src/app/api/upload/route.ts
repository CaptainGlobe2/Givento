import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file uploaded.' },
        { status: 400 }
      );
    }

    // Validate format
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid image format. Please select a JPG, PNG, or WEBP file.' },
        { status: 400 }
      );
    }

    // Validate size (max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: 'Image size exceeds 5MB limit. Please compress or select a smaller image.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const ext = ['jpeg', 'jpg', 'png', 'webp', 'svg'].includes(rawExt) ? rawExt : 'jpg';
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30)
      .toLowerCase();
    const uniqueFileName = `product_${Date.now()}_${cleanName}.${ext}`;

    // 1. If Supabase is configured, try Supabase Storage
    if (isSupabaseConfigured && supabase) {
      const candidateBuckets = ['product-images', 'products', 'givento-products'];
      for (const bucket of candidateBuckets) {
        try {
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(uniqueFileName, buffer, {
              contentType: file.type,
              upsert: true,
            });

          if (!error && data) {
            const { data: publicData } = supabase.storage
              .from(bucket)
              .getPublicUrl(uniqueFileName);

            if (publicData?.publicUrl) {
              return NextResponse.json({
                success: true,
                url: publicData.publicUrl,
                fileName: uniqueFileName,
                storage: 'supabase',
                bucket,
              });
            }
          }
        } catch {
          // Try next bucket or fallback to local
        }
      }
    }

    // 2. Save directly to public/uploads directory (Local Storage Fallback)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const targetPath = path.join(uploadsDir, uniqueFileName);
      fs.writeFileSync(targetPath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${uniqueFileName}`,
        fileName: uniqueFileName,
        storage: 'local',
      });
    } catch (fsErr) {
      // 3. Fallback to Data URL if filesystem write is unavailable
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64Data}`;
      return NextResponse.json({
        success: true,
        url: dataUrl,
        fileName: uniqueFileName,
        storage: 'data_url',
      });
    }
  } catch (err: any) {
    console.error('API Upload error:', err);
    return NextResponse.json(
      { error: err?.message || 'Server failed to process image upload.' },
      { status: 500 }
    );
  }
}
