import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all products
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id');

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: unknown) {
    let message = 'Failed to fetch products';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

// POST new product (optional, for admin)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, unit } = body;

    // Validation
    if (!id || !name || !unit) {
      return NextResponse.json(
        {
          success: false,
          error: 'id, name, and unit are required',
        },
        { status: 400 }
      );
    }

    // Check if product ID already exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product ID sudah terdaftar',
        },
        { status: 400 }
      );
    }

    // Insert product
    const { data, error } = await supabase
      .from('products')
      .insert({ id, name, unit })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        message: 'Product berhasil ditambahkan',
        data,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    let message = 'Failed to create product';
    if (error instanceof Error) {
      message = error.message;
    }
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}