import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET current stock for all products
export async function GET() {
  try {
    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('id');

    if (productsError) throw productsError;

    // For each product, get latest stock
    const stockData = await Promise.all(
      (products || []).map(async (product) => {
        const { data: lastTransaction } = await supabase
          .from('inventory_transactions')
          .select('stock_after')
          .eq('product_id', product.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          productId: product.id,
          productName: product.name,
          currentStock: lastTransaction?.stock_after || 0,
          unit: product.unit,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: stockData,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stock data',
      },
      { status: 500 }
    );
  }
}