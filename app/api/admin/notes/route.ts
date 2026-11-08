import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Product } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { products } = await db.getProducts({ status: 'all' });
    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.slug || typeof body.price_in_paise !== 'number') {
      return NextResponse.json({ error: 'Title, slug, and price are required' }, { status: 400 });
    }

    const newProduct: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: body.title,
      slug: body.slug,
      branch_id: body.branch_id,
      year_id: body.year_id,
      subject_id: body.subject_id || 'sub_general',
      pattern_id: body.pattern_id || 'pat_2024',
      short_description: body.short_description || '',
      full_description: body.full_description || '',
      topics_covered: body.topics_covered || [],
      price_in_paise: body.price_in_paise,
      compare_at_price_in_paise: body.compare_at_price_in_paise || null,
      publication_status: body.publication_status || 'published',
      is_coming_soon: Boolean(body.is_coming_soon),
      is_available: !Boolean(body.is_coming_soon),
      file_format: 'PDF',
      page_count: body.page_count || 65,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await db.createProduct(newProduct);

    // Audit log
    await db.logAdminAudit({
      admin_email: process.env.ADMIN_EMAIL || 'admin@notesbazaar.local',
      action: 'CREATE_NOTE',
      entity_type: 'product',
      entity_id: saved.id,
      details: `Created note: "${saved.title}" (Coming Soon: ${saved.is_coming_soon})`,
    });

    return NextResponse.json({ product: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

