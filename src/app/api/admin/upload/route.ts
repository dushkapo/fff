import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { supabaseAdmin } from '@/lib/supabaseServer';
import crypto from 'crypto';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Map of allowed MIME types -> canonical file extension.
// The extension is derived from the verified type, never from the user's filename.
const ALLOWED_TYPES: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
};

/**
 * Verify the actual file content matches the declared image type by checking
 * its magic bytes (file signature). Prevents disguised/malicious uploads.
 */
function detectImageType(buffer: Buffer): string | null {
    if (buffer.length < 12) return null;
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'image/jpeg';
    }
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
        buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e &&
        buffer[3] === 0x47 && buffer[4] === 0x0d && buffer[5] === 0x0a &&
        buffer[6] === 0x1a && buffer[7] === 0x0a
    ) {
        return 'image/png';
    }
    // GIF: 'GIF87a' or 'GIF89a'
    if (buffer.toString('ascii', 0, 6) === 'GIF87a' || buffer.toString('ascii', 0, 6) === 'GIF89a') {
        return 'image/gif';
    }
    // WEBP: 'RIFF'....'WEBP'
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
        return 'image/webp';
    }
    return null;
}

export const POST = withAdminAuth(async (request: Request) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate declared file type
        if (!ALLOWED_TYPES[file.type]) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed: ${Object.keys(ALLOWED_TYPES).join(', ')}` },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: `File too large. Max: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
                { status: 400 }
            );
        }

        // Convert to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Verify actual content matches an allowed image type (magic bytes)
        const detectedType = detectImageType(buffer);
        if (!detectedType || !ALLOWED_TYPES[detectedType]) {
            return NextResponse.json(
                { error: 'File content does not match an allowed image format' },
                { status: 400 }
            );
        }

        // Generate unique filename using the verified extension
        const ext = ALLOWED_TYPES[detectedType];
        const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
        const filePath = `products/${uniqueName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabaseAdmin.storage
            .from('bouquet-images')
            .upload(filePath, buffer, {
                contentType: detectedType,
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
        }

        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
            .from('bouquet-images')
            .getPublicUrl(filePath);

        return NextResponse.json({
            url: urlData.publicUrl,
            path: filePath,
        });
    } catch (err) {
        console.error('Upload error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
});
