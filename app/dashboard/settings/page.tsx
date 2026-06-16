'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import DashboardHeader from '@/components/dashboard/header';
import { Plus, Trash2, Tag, Users, ShieldAlert } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'products' | 'employees'>('products');

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

  // Fetch business profile and relations
  const fetchBusiness = async () => {
    try {
      const res = await fetch('/api/business');
      if (res.ok) {
        const data = await res.json();
        setBusiness(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusiness();
  }, []);

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
          </div>

          {/* Products Workspace */}
          {activeTab === 'products' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        </div>
      </main>
    </div>
  );
}
