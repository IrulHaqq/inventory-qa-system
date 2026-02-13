'use client';

import { useState, useEffect } from 'react';
import { supabase, Product } from '@/lib/supabase';
import { QATooltip } from './QATooltip';
import { testCases } from '@/lib/testCases';
import { format } from 'date-fns';

type InventoryFormProps = {
  qaMode: boolean;
  onSuccess: () => void;
};

export function InventoryForm({ qaMode, onSuccess }: InventoryFormProps) {
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [productUnit, setProductUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [currentStock, setCurrentStock] = useState<number | null>(null);

  // Fetch products for reference
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('id');
    
    if (data) setProducts(data);
  }

  // Auto-fill product name & unit when ID changes
  useEffect(() => {
    if (productId) {
      handleProductIdChange(productId);
    } else {
      setProductName('');
      setProductUnit('');
      setCurrentStock(null);
    }
  }, [productId]);

  async function handleProductIdChange(id: string) {
    // Find product
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (product) {
      setProductName(product.name);
      setProductUnit(product.unit);
      setError('');
      
      // Calculate current stock
      const { data: transactions } = await supabase
        .from('inventory_transactions')
        .select('stock_after')
        .eq('product_id', id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (transactions && transactions.length > 0) {
        setCurrentStock(transactions[0].stock_after);
      } else {
        setCurrentStock(0);
      }
    } else {
      setProductName('');
      setProductUnit('');
      setCurrentStock(null);
      setError('Product ID tidak ditemukan');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (!productId || !quantity || !date) {
        throw new Error('Semua field wajib diisi');
      }

      const qtyNum = parseInt(quantity);
      if (isNaN(qtyNum)) {
        throw new Error('Jumlah harus berupa angka');
      }

      // Date validation
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        throw new Error('Tanggal tidak valid. Hanya dapat input tanggal hari ini atau sebelumnya');
      }

      // Check product exists
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!product) {
        throw new Error('Product ID tidak ditemukan');
      }

      // Calculate new stock
      const stockBefore = currentStock || 0;
      const newStock = stockBefore + qtyNum;

      // Prevent negative stock
      if (newStock < 0) {
        throw new Error(`Stock tidak mencukupi. Stock tersedia: ${stockBefore} ${product.unit}`);
      }

      // Insert transaction
      const { error: insertError } = await supabase
        .from('inventory_transactions')
        .insert({
          product_id: productId,
          quantity: qtyNum,
          date: date,
          stock_after: newStock,
        });

      if (insertError) throw insertError;

      setSuccess('Transaksi berhasil disimpan!');
      
      // Reset form
      setProductId('');
      setProductName('');
      setProductUnit('');
      setQuantity('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setCurrentStock(null);
      
      // Notify parent
      onSuccess();

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Input Transaksi Barang
      </h2>

      {/* Product ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product ID *
        </label>
        <QATooltip testCase={testCases.productIdInput} enabled={qaMode}>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value.toUpperCase())}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent ${
              qaMode ? 'ring-2 ring-blue-200' : 'border-gray-300'
            }`}
            placeholder="e.g., P001"
            disabled={loading}
          />
        </QATooltip>
        
        {/* Product suggestions */}
        {products.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            Available: {products.map(p => p.id).join(', ')}
          </div>
        )}
      </div>

      {/* Product Name (Auto-filled) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nama Produk
        </label>
        <input
          type="text"
          value={productName}
          readOnly
          className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                     bg-gray-50 text-gray-600 cursor-not-allowed"
          placeholder="Auto-filled saat input Product ID"
        />
      </div>

      {/* Unit (Auto-filled) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Satuan
        </label>
        <input
          type="text"
          value={productUnit}
          readOnly
          className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                     bg-gray-50 text-gray-600 cursor-not-allowed"
          placeholder="Auto-filled saat input Product ID"
        />
      </div>

      {/* Current Stock Display */}
      {currentStock !== null && (
        <QATooltip testCase={testCases.stockCalculation} enabled={qaMode}>
          <div className={`p-3 rounded-lg ${
            qaMode ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
          }`}>
            <span className="text-sm font-medium text-gray-700">
              Stock Saat Ini: 
            </span>
            <span className="text-lg font-bold text-gray-900 ml-2">
              {currentStock} {productUnit}
            </span>
          </div>
        </QATooltip>
      )}

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Jumlah * 
          <span className="text-xs text-gray-500 ml-2">
            (Positif = Masuk, Negatif = Keluar)
          </span>
        </label>
        <QATooltip testCase={testCases.quantityPositive} enabled={qaMode}>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent ${
              qaMode ? 'ring-2 ring-blue-200' : 'border-gray-300'
            }`}
            placeholder="e.g., 50 atau -20"
            disabled={loading}
          />
        </QATooltip>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tanggal *
        </label>
        <QATooltip testCase={testCases.dateValidation} enabled={qaMode}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={format(new Date(), 'yyyy-MM-dd')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 
                       focus:border-transparent ${
              qaMode ? 'ring-2 ring-blue-200' : 'border-gray-300'
            }`}
            disabled={loading}
          />
        </QATooltip>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          ✅ {success}
        </div>
      )}

      {/* Submit Button */}
      <QATooltip testCase={testCases.emptyFields} enabled={qaMode}>
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg
                     hover:bg-blue-700 transition-colors disabled:opacity-50 
                     disabled:cursor-not-allowed ${
            qaMode ? 'ring-2 ring-blue-300' : ''
          }`}
        >
          {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
        </button>
      </QATooltip>
    </form>
  );
}