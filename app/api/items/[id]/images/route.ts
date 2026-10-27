import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/supabase/repository';
import { getCurrentUser } from '@/lib/auth/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const item = await repository.getItemById(id, user.id, user.role);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    if (item.reporter_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized to upload images for this item' }, { status: 403 });
    }

    const json = await request.json();
    const { image_url } = json;

    if (!image_url || typeof image_url !== 'string') {
      return NextResponse.json({ error: 'Valid image_url is required' }, { status: 400 });
    }

    const currentImages = item.images || [];
    const newImage = {
      id: `img-${Date.now()}`,
      item_id: id,
      image_url,
      storage_path: `item-photos/${id}-${currentImages.length}.jpg`,
      is_primary: currentImages.length === 0,
      created_at: new Date().toISOString(),
    };

    const updated = await repository.updateItem(
      id,
      { images: [...currentImages, newImage] },
      user.id,
      user.role
    );

    return NextResponse.json({ image: newImage, item: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Image upload failed' }, { status: 500 });
  }
}
