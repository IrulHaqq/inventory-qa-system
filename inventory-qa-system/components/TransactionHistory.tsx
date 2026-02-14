'use client';

import { useState, useEffect } from 'react';
import { supabase, TransactionWithProduct } from '@/lib/supabase';
import { format } from 'date-fns';
import { QATooltip } from './QATooltip';
import { testCases } from '@/lib/testCases';

type TransactionHistoryProps = {
  qaMode: boolean;
  refresh: number; // Used to trigger refresh
};

export function TransactionHistory({ qaMode, refresh }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<TransactionWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTransactions() {
    setLoading(true);
    
    const { data } = await supabase
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

    if (data) {
      setTransactions(data as TransactionWithProduct[]);
    }
    
    setLoading(false);
  }

  useEffect(() => {
    fetchTransactions();
  }, [refresh]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <QATooltip testCase={testCases.transactionHistory} enabled={qaMode}>
      <div className={`bg-white rounded-lg shadow-md p-6 ${
        qaMode ? 'ring-2 ring-blue-200' : ''
      }`}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Riwayat Transaksi
        </h2>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada transaksi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Product ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Nama Produk
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    Jumlah
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Satuan
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    Stock Akhir
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {format(new Date(transaction.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">
                      {transaction.product_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {transaction.products?.name}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      transaction.quantity > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {transaction.products?.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-900">
                      {transaction.stock_after}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </QATooltip>
  );
}