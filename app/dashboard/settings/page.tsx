'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import DashboardHeader from '@/components/dashboard/header';
import { Plus, Trash2, Tag, Users, ShieldAlert, Upload, Download, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  salary: number;
}

interface Business {
  id: string;
  name: string;
  industry: string;
  baselineRevenue: number;
  baselineMarketing: number;
  baselineInventory: number;
  baselineFixedCosts: number;
  products: Product[];
  employees: Employee[];
}

export default function SettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'employees' | 'integrations'>('products');

  // Product Form states
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCost, setProdCost] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);

  // Employee Form states
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('Barista');
  const [empSalary, setEmpSalary] = useState('');
  const [addingEmployee, setAddingEmployee] = useState(false);

  // CSV Import States
  const [prodCsvFile, setProdCsvFile] = useState<File | null>(null);
  const [prodParsed, setProdParsed] = useState<any[] | null>(null);
  const [prodParseError, setProdParseError] = useState<string | null>(null);
  const [importingProd, setImportingProd] = useState(false);

  const [empCsvFile, setEmpCsvFile] = useState<File | null>(null);
  const [empParsed, setEmpParsed] = useState<any[] | null>(null);
  const [empParseError, setEmpParseError] = useState<string | null>(null);
  const [importingEmp, setImportingEmp] = useState(false);

  // Integrations states
  const [syncingQbo, setSyncingQbo] = useState(false);
  const [syncingShopify, setSyncingShopify] = useState(false);
  const [syncingSquare, setSyncingSquare] = useState(false);
  
  const [shopifyStore, setShopifyStore] = useState('');
  const [qboConnected, setQboConnected] = useState(false);
  const [shopifyConnected, setShopifyConnected] = useState(false);
  const [squareConnected, setSquareConnected] = useState(false);

  const handleSyncQbo = async () => {
    if (!qboConnected) {
      if (business) {
        window.location.href = `/api/integrations/quickbooks/connect?businessId=${business.id}`;
      }
      return;
    }

    setSyncingQbo(true);
    try {
      const res = await fetch('/api/integrations/quickbooks/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business?.id })
      });
      if (res.ok) {
        await fetchBusiness();
        alert('QuickBooks Financial Reports (P&L, Overheads) successfully synced! Your twin baseline revenue, marketing, inventory, and fixed costs have been updated.');
      } else {
        alert('Failed to sync with QuickBooks.');
      }
    } catch (err) {
      console.error(err);
      alert('Error syncing QuickBooks.');
    } finally {
      setSyncingQbo(false);
    }
  };

  const handleSyncShopify = async () => {
    setSyncingShopify(true);
    try {
      const res = await fetch('/api/integrations/shopify/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopifyStoreDomain: shopifyStore, businessId: business?.id })
      });
      if (res.ok) {
        setShopifyConnected(true);
        await fetchBusiness();
        alert('Shopify Product Catalog synced! Products have been imported into your catalog.');
      } else {
        alert('Failed to sync with Shopify.');
      }
    } catch (err) {
      console.error(err);
      alert('Error syncing Shopify.');
    } finally {
      setSyncingShopify(false);
    }
  };

  const handleSyncSquare = async () => {
    setSyncingSquare(true);
    try {
      const res = await fetch('/api/integrations/square/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business?.id })
      });
      if (res.ok) {
        setSquareConnected(true);
        await fetchBusiness();
        alert('Square POS Labor Logs synced! Shift logs have been imported into your payroll roster.');
      } else {
        alert('Failed to sync with Square POS.');
      }
    } catch (err) {
      console.error(err);
      alert('Error syncing Square POS.');
    } finally {
      setSyncingSquare(false);
    }
  };

  // Fetch business profile and relations
  const fetchBusiness = async () => {
    try {
      const res = await fetch('/api/business');
      if (res.ok) {
        const data = await res.json();
        setBusiness(data);
        setQboConnected(!!data.qboAccessToken);
        setShopifyConnected(!!data.shopifyAccessToken);
        setSquareConnected(!!data.squareAccessToken);
        if (data.shopifyStoreDomain) {
          setShopifyStore(data.shopifyStoreDomain);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusiness();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'integrations' || tab === 'products' || tab === 'employees') {
        setActiveTab(tab as any);
      }

      const status = params.get('status');
      if (status === 'success') {
        alert('QuickBooks successfully connected!');
      } else if (status === 'error') {
        const msg = params.get('message');
        alert(`Failed to connect QuickBooks: ${msg || 'Unknown error'}`);
      }
    }
  }, []);

  // CSV Parsing and File download/import helpers
  const downloadSampleCSV = (type: 'products' | 'employees') => {
    const csvContent = type === 'products'
      ? 'name,price,cost\nFilter Coffee,4.50,1.10\nAvocado Toast,12.00,3.50\nCroissant,3.75,0.90\nCold Brew,5.00,1.25'
      : 'name,role,salary\nAlice Smith,Barista,3200\nBob Johnson,Chef,4200\nCharlie Brown,Shift Supervisor,4800\nDiana Prince,Manager,5500';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}_sample.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string, type: 'products' | 'employees') => {
    // Split into lines and filter empty ones
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (lines.length < 2) {
      throw new Error('CSV file is empty or only contains a header row.');
    }

    // Parse header row, strip quotes, lowercase and trim
    const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

    // Validate headers
    if (type === 'products') {
      const hasName = headers.includes('name');
      const hasPrice = headers.includes('price');
      const hasCost = headers.includes('cost');
      if (!hasName || !hasPrice || !hasCost) {
        throw new Error('Invalid CSV headers. Required: name, price, cost');
      }
    } else {
      const hasName = headers.includes('name');
      const hasRole = headers.includes('role');
      const hasSalary = headers.includes('salary');
      if (!hasName || !hasRole || !hasSalary) {
        throw new Error('Invalid CSV headers. Required: name, role, salary');
      }
    }

    const records: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values: string[] = [];
      let currentVal = '';
      let insideQuotes = false;
      
      for (let charIdx = 0; charIdx < line.length; charIdx++) {
        const char = line[charIdx];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentVal.trim());
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim());

      const record: Record<string, any> = {};
      headers.forEach((header, idx) => {
        let val = values[idx] || '';
        val = val.replace(/^["']|["']$/g, '').trim();
        record[header] = val;
      });

      if (!record.name) {
        throw new Error(`Line ${i + 1}: Name is required.`);
      }

      if (type === 'products') {
        const price = Number(record.price);
        const cost = Number(record.cost);
        if (isNaN(price) || record.price === '') {
          throw new Error(`Line ${i + 1}: Price must be a valid number.`);
        }
        if (isNaN(cost) || record.cost === '') {
          throw new Error(`Line ${i + 1}: Cost must be a valid number.`);
        }
        records.push({
          name: record.name,
          price: price,
          cost: cost
        });
      } else {
        const salary = Number(record.salary);
        if (isNaN(salary) || record.salary === '') {
          throw new Error(`Line ${i + 1}: Salary must be a valid number.`);
        }
        records.push({
          name: record.name,
          role: record.role || 'Barista',
          salary: salary
        });
      }
    }

    return records;
  };

  const handleProductCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProdCsvFile(file);
    setProdParseError(null);
    setProdParsed(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = parseCSV(text, 'products');
        setProdParsed(parsed);
      } catch (err: any) {
        setProdParseError(err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleEmployeeCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEmpCsvFile(file);
    setEmpParseError(null);
    setEmpParsed(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const parsed = parseCSV(text, 'employees');
        setEmpParsed(parsed);
      } catch (err: any) {
        setEmpParseError(err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleImportProducts = async () => {
    if (!prodParsed || prodParsed.length === 0) return;
    setImportingProd(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodParsed),
      });

      if (res.ok) {
        setProdCsvFile(null);
        setProdParsed(null);
        fetchBusiness();
        alert('Products imported successfully.');
      } else {
        const err = await res.json();
        alert(`Failed to import products: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error importing products.');
    } finally {
      setImportingProd(false);
    }
  };

  const handleImportEmployees = async () => {
    if (!empParsed || empParsed.length === 0) return;
    setImportingEmp(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empParsed),
      });

      if (res.ok) {
        setEmpCsvFile(null);
        setEmpParsed(null);
        fetchBusiness();
        alert('Employees imported successfully.');
      } else {
        const err = await res.json();
        alert(`Failed to import employees: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error importing employees.');
    } finally {
      setImportingEmp(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice || !prodCost) return;
    setAddingProduct(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prodName,
          price: Number(prodPrice),
          cost: Number(prodCost),
          businessId: business?.id,
        }),
      });
      if (res.ok) {
        setProdName('');
        setProdPrice('');
        setProdCost('');
        fetchBusiness();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchBusiness();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim() || !empRole || !empSalary) return;
    setAddingEmployee(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: empName,
          role: empRole,
          salary: Number(empSalary),
          businessId: business?.id,
        }),
      });
      if (res.ok) {
        setEmpName('');
        setEmpSalary('');
        fetchBusiness();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingEmployee(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Are you sure you want to remove this employee?')) return;
    try {
      const res = await fetch(`/api/employees?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchBusiness();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F5F5F5] text-black overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <DashboardHeader />
          <div className="p-6 lg:p-8 flex items-center justify-center h-[calc(100vh-100px)]">
            <p className="font-semibold text-lg animate-pulse">Loading Twin Workspace...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex h-screen bg-[#F5F5F5] text-black overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <DashboardHeader />
          <div className="p-6 lg:p-8 flex items-center justify-center h-[calc(100vh-100px)]">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md text-center shadow-sm">
              <h2 className="text-xl font-semibold mb-2">No Digital Twin Found</h2>
              <p className="text-gray-500 mb-6 text-sm">Create a digital twin representation first.</p>
              <button 
                onClick={() => window.location.href = '/onboarding'}
                className="py-3 px-6 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Go to Onboarding
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F5F5] text-black overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DashboardHeader />
        <div className="p-6 lg:p-8 space-y-8 max-w-5xl">
          {/* Header section */}
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-black mb-2" style={{ letterSpacing: '-0.03em' }}>
              Twin Builder Workspace
            </h1>
            <p className="text-gray-500 text-sm">
              Modify the baseline elements of **{business.name}** ({business.industry}) to dynamically alter simulation outcomes.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <Tag size={16} />
              Products & Menu Pricing ({business.products.length})
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'employees'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <Users size={16} />
              Staff & Payroll ({business.employees.length})
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'integrations'
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <FileSpreadsheet size={16} />
              Accounting & ERP Integrations
            </button>
          </div>

          {/* Products Workspace */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                {/* Product Form */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-fit">
                  <h3 className="text-lg font-medium text-black mb-4">Add Product</h3>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Product Name
                      </label>
                      <input
                        type="text"
                        required
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="e.g. Filter Coffee"
                        className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Sale Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        placeholder="e.g. 4.50"
                        className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Unit Cost ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={prodCost}
                        onChange={(e) => setProdCost(e.target.value)}
                        placeholder="e.g. 1.10"
                        className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={addingProduct}
                      className="w-full py-2.5 px-4 bg-black text-white hover:bg-gray-800 rounded-full font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus size={16} />
                      Add Product
                    </button>
                  </form>
                </div>

                {/* CSV Import */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-black">Bulk Import Products</h3>
                    <button 
                      onClick={() => downloadSampleCSV('products')}
                      className="text-xs text-gray-500 hover:text-black flex items-center gap-1.5 transition-colors font-medium animate-fadeIn"
                      type="button"
                    >
                      <Download size={14} />
                      Get Template
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border border-dashed border-gray-200 hover:border-gray-300 rounded-xl p-6 text-center cursor-pointer relative transition-colors bg-[#F5F5F5]/40 hover:bg-[#F5F5F5]/70">
                      <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleProductCsvChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2 flex flex-col items-center justify-center">
                        <FileSpreadsheet className="text-gray-400 w-8 h-8" />
                        <p className="text-xs font-semibold text-gray-700">
                          {prodCsvFile ? prodCsvFile.name : 'Choose CSV file or drag here'}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Required headers: name, price, cost
                        </p>
                      </div>
                    </div>

                    {prodParseError && (
                      <div className="flex gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{prodParseError}</span>
                      </div>
                    )}

                    {prodParsed && (
                      <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-xs text-green-700 font-medium space-y-1">
                        <p className="font-semibold text-green-800">File parsed successfully!</p>
                        <p>Detected {prodParsed.length} product(s) ready for import.</p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleImportProducts}
                      disabled={!prodParsed || importingProd}
                      className="w-full py-2.5 px-4 bg-[#2B2644] hover:bg-[#1f1b33] text-white disabled:bg-gray-200 disabled:text-gray-400 rounded-full font-medium flex items-center justify-center gap-2 transition-colors duration-200 text-sm"
                    >
                      <Upload size={16} />
                      {importingProd ? 'Importing...' : 'Import Products'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Product list */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-medium text-black mb-4">Active Products</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-400 font-semibold uppercase">
                        <th className="pb-3">Product</th>
                        <th className="pb-3 text-right">Price</th>
                        <th className="pb-3 text-right">Cost</th>
                        <th className="pb-3 text-right">Margin</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {business.products.map((product) => {
                        const margin = ((product.price - product.cost) / (product.price || 1)) * 100;
                        return (
                          <tr key={product.id} className="text-sm">
                            <td className="py-3.5 font-medium text-black">{product.name}</td>
                            <td className="py-3.5 text-right font-medium text-black">${product.price.toFixed(2)}</td>
                            <td className="py-3.5 text-right text-gray-500">${product.cost.toFixed(2)}</td>
                            <td className="py-3.5 text-right text-green-600 font-semibold">{margin.toFixed(0)}%</td>
                            <td className="py-3.5 text-right">
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 transition-colors inline-block"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {business.products.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                            No products defined. Add products using the form on the left.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Employees Workspace */}
          {activeTab === 'employees' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                {/* Employee Form */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-fit">
                  <h3 className="text-lg font-medium text-black mb-4">Add Employee</h3>
                  <form onSubmit={handleAddEmployee} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={empName}
                        onChange={(e) => setEmpName(e.target.value)}
                        placeholder="e.g. Sarah Connor"
                        className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Role / Position
                      </label>
                      <select
                        value={empRole}
                        onChange={(e) => setEmpRole(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black focus:outline-none focus:border-black transition-colors"
                      >
                        <option value="Barista">Barista</option>
                        <option value="Chef">Chef</option>
                        <option value="Shift Supervisor">Shift Supervisor</option>
                        <option value="Manager">Manager</option>
                        <option value="Associate">Sales Associate</option>
                        <option value="Other">Other Position</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Monthly Salary ($)
                      </label>
                      <input
                        type="number"
                        required
                        value={empSalary}
                        onChange={(e) => setEmpSalary(e.target.value)}
                        placeholder="e.g. 3500"
                        className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-gray-200 rounded-xl text-black focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={addingEmployee}
                      className="w-full py-2.5 px-4 bg-black text-white hover:bg-gray-800 rounded-full font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus size={16} />
                      Add Staff Member
                    </button>
                  </form>
                </div>

                {/* CSV Import */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-black">Bulk Import Staff</h3>
                    <button 
                      onClick={() => downloadSampleCSV('employees')}
                      className="text-xs text-gray-500 hover:text-black flex items-center gap-1.5 transition-colors font-medium animate-fadeIn"
                      type="button"
                    >
                      <Download size={14} />
                      Get Template
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border border-dashed border-gray-200 hover:border-gray-300 rounded-xl p-6 text-center cursor-pointer relative transition-colors bg-[#F5F5F5]/40 hover:bg-[#F5F5F5]/70">
                      <input 
                        type="file" 
                        accept=".csv"
                        onChange={handleEmployeeCsvChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2 flex flex-col items-center justify-center">
                        <FileSpreadsheet className="text-gray-400 w-8 h-8" />
                        <p className="text-xs font-semibold text-gray-700">
                          {empCsvFile ? empCsvFile.name : 'Choose CSV file or drag here'}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Required headers: name, role, salary
                        </p>
                      </div>
                    </div>

                    {empParseError && (
                      <div className="flex gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-medium">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{empParseError}</span>
                      </div>
                    )}

                    {empParsed && (
                      <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-xs text-green-700 font-medium space-y-1">
                        <p className="font-semibold text-green-800">File parsed successfully!</p>
                        <p>Detected {empParsed.length} staff member(s) ready for import.</p>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleImportEmployees}
                      disabled={!empParsed || importingEmp}
                      className="w-full py-2.5 px-4 bg-[#2B2644] hover:bg-[#1f1b33] text-white disabled:bg-gray-200 disabled:text-gray-400 rounded-full font-medium flex items-center justify-center gap-2 transition-colors duration-200 text-sm"
                    >
                      <Upload size={16} />
                      {importingEmp ? 'Importing...' : 'Import Staff'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Employee list */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-medium text-black mb-4">Active Staff Members</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs text-gray-400 font-semibold uppercase">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Role</th>
                        <th className="pb-3 text-right">Monthly Salary</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {business.employees.map((employee) => (
                        <tr key={employee.id} className="text-sm">
                          <td className="py-3.5 font-medium text-black">{employee.name}</td>
                          <td className="py-3.5 text-gray-600">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#2B2644]/10 text-[#2B2644]">
                              {employee.role}
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-medium text-black">${employee.salary.toLocaleString()}</td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors inline-block"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {business.employees.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                            No employees defined. Add employees using the form on the left.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Workspace */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-medium text-black mb-2">Connected Accounts & Automations</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Sync financial and catalog baselines from QuickBooks, Shopify, and POS registers to keep your business twin accurate.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* QuickBooks Online */}
                  <div className="border border-gray-200 rounded-xl p-6 bg-[#F5F5F5]/20 flex flex-col justify-between h-[280px]">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-gray-800 text-sm">QuickBooks Online</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          qboConnected ? 'bg-green-100 text-green-700' : 'bg-gray-150 text-gray-550'
                        }`}>
                          {qboConnected ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Syncs Balance Sheet and Profit & Loss statements to populate baseline revenue, operating overheads, marketing spends, and inventory reserves automatically.
                      </p>
                    </div>
                    <button
                      onClick={handleSyncQbo}
                      disabled={syncingQbo}
                      className={`w-full py-2.5 px-4 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                        qboConnected
                          ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                          : 'bg-black hover:bg-gray-850 text-white'
                      }`}
                    >
                      {syncingQbo ? 'Syncing...' : qboConnected ? 'Re-sync Account' : 'Connect QuickBooks'}
                    </button>
                  </div>

                  {/* Shopify */}
                  <div className="border border-gray-200 rounded-xl p-6 bg-[#F5F5F5]/20 flex flex-col justify-between h-[280px]">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-gray-800 text-sm">Shopify Admin</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          shopifyConnected ? 'bg-green-100 text-green-700' : 'bg-gray-150 text-gray-550'
                        }`}>
                          {shopifyConnected ? 'Active webhook' : 'Inactive'}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500 leading-relaxed">
                          Imports active products and unit costs to sync your menu catalog and maps historical order volumes to compute dynamic price elasticity levels.
                        </p>
                        {!shopifyConnected && (
                          <input
                            type="text"
                            placeholder="my-store.myshopify.com"
                            value={shopifyStore}
                            onChange={(e) => setShopifyStore(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none"
                          />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleSyncShopify}
                      disabled={syncingShopify}
                      className={`w-full py-2.5 px-4 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                        shopifyConnected
                          ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                          : 'bg-black hover:bg-gray-850 text-white'
                      }`}
                    >
                      {syncingShopify ? 'Syncing...' : shopifyConnected ? 'Sync Products' : 'Enable Shopify Sync'}
                    </button>
                  </div>

                  {/* Square POS */}
                  <div className="border border-gray-200 rounded-xl p-6 bg-[#F5F5F5]/20 flex flex-col justify-between h-[280px]">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-gray-800 text-sm">Square POS</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          squareConnected ? 'bg-green-100 text-green-700' : 'bg-gray-150 text-gray-550'
                        }`}>
                          {squareConnected ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Imports shift scheduling, active employee logs, and hourly labor rates. Refines baseline seasonality calculations with precise daily transactions.
                      </p>
                    </div>
                    <button
                      onClick={handleSyncSquare}
                      disabled={syncingSquare}
                      className={`w-full py-2.5 px-4 rounded-full font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                        squareConnected
                          ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                          : 'bg-black hover:bg-gray-850 text-white'
                      }`}
                    >
                      {syncingSquare ? 'Syncing...' : squareConnected ? 'Re-sync Shifts' : 'Connect Square POS'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
