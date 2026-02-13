export type TestCase = {
  id: string;
  feature: string;
  scenario: string;
  expected: string;
  priority: 'High' | 'Medium' | 'Critical';
  covered: boolean;
};

export const testCases: Record<string, TestCase> = {
  productIdInput: {
    id: 'TC-WEB-001',
    feature: 'Product ID Input',
    scenario: 'Input valid Product ID, auto-fill nama & satuan',
    expected: 'Nama produk dan satuan terisi otomatis, field menjadi read-only',
    priority: 'High',
    covered: true,
  },
  
  quantityPositive: {
    id: 'TC-WEB-002',
    feature: 'Input Barang Masuk',
    scenario: 'Input jumlah positif (barang masuk)',
    expected: 'Stock bertambah, transaksi tersimpan, notifikasi sukses',
    priority: 'Critical',
    covered: true,
  },
  
  quantityNegative: {
    id: 'TC-WEB-003',
    feature: 'Prevent Negative Stock',
    scenario: 'Input barang keluar melebihi stock',
    expected: 'Error: "Stock tidak mencukupi", transaksi ditolak',
    priority: 'Critical',
    covered: true,
  },
  
  dateValidation: {
    id: 'TC-WEB-004',
    feature: 'Date Validation',
    scenario: 'Input tanggal future (lebih dari hari ini)',
    expected: 'Error: "Tanggal tidak valid", transaksi ditolak',
    priority: 'High',
    covered: true,
  },
  
  invalidProductId: {
    id: 'TC-WEB-005',
    feature: 'Invalid Product ID',
    scenario: 'Input Product ID yang tidak terdaftar',
    expected: 'Error: "Product ID tidak ditemukan"',
    priority: 'High',
    covered: true,
  },
  
  emptyFields: {
    id: 'TC-WEB-006',
    feature: 'Mandatory Field Validation',
    scenario: 'Submit form dengan field kosong',
    expected: 'Error pada setiap field wajib, form tidak submit',
    priority: 'Medium',
    covered: true,
  },
  
  nonNumeric: {
    id: 'TC-WEB-007',
    feature: 'Numeric Validation',
    scenario: 'Input jumlah dengan karakter non-numeric',
    expected: 'Error: "Jumlah harus berupa angka"',
    priority: 'Medium',
    covered: true,
  },
  
  transactionHistory: {
    id: 'TC-WEB-008',
    feature: 'View Transaction History',
    scenario: 'Lihat daftar transaksi',
    expected: 'Semua transaksi ditampilkan, sorted by date DESC',
    priority: 'Medium',
    covered: true,
  },
  
  stockCalculation: {
    id: 'TC-WEB-009',
    feature: 'Stock Calculation',
    scenario: 'Stock dihitung akurat dari transaksi',
    expected: 'Stock akhir = stock awal + masuk - keluar',
    priority: 'Critical',
    covered: true,
  },
};