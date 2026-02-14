import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all inventory transactions
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        products (
          id,
          name,
          unit
        )
      `)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: (error instanceof Error ? error.message : 'Failed to fetch transactions'),
      },
      { status: 500 }
    );
  }
}

// POST new transaction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantity, date } = body;

    // Validation - Required fields
    if (!productId || quantity === undefined || !date) {
      return NextResponse.json(
        {
          success: false,
          error: 'productId, quantity, and date are required',
        },
        { status: 400 }
      );
    }

    // Validation - Quantity must be numeric
    const qtyNum = parseInt(quantity);
    if (isNaN(qtyNum)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quantity harus berupa angka',
        },
        { status: 400 }
      );
    }

    // Validation - Date must be today or before
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (selectedDate > today) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tanggal tidak valid. Hanya dapat input tanggal hari ini atau sebelumnya',
        },
        { status: 400 }
      );
    }

    // Check if product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product ID tidak ditemukan',
        },
        { status: 404 }
      );
    }

    // Calculate current stock
    const { data: lastTransaction } = await supabase
      .from('inventory_transactions')
      .select('stock_after')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const currentStock = lastTransaction?.stock_after || 0;
    const newStock = currentStock + qtyNum;

    // Validation - Prevent negative stock
    if (newStock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Stock tidak mencukupi. Stock tersedia: ${currentStock} ${product.unit}`,
        },
        { status: 400 }
      );
    }

    // Insert transaction
    const { data: transaction, error: insertError } = await supabase
      .from('inventory_transactions')
      .insert({
        product_id: productId,
        quantity: qtyNum,
        date: date,
        stock_after: newStock,
      })
      .select(`
        *,
        products (
          id,
          name,
          unit
        )
      `)
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(
      {
        success: true,
        message: 'Transaksi berhasil disimpan',
        data: transaction,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: (error instanceof Error ? error.message : 'Failed to create transaction'),
      },
      { status: 500 }
    );
  }
}