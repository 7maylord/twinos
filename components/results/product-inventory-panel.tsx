'use client';

import { PackageCheck, PackageX, AlertTriangle } from 'lucide-react';

interface ProductInventoryStatus {
  productId: string;
  productName: string;
  daysOfStockRemaining: number | null;
  atRisk: boolean;
  belowReorderPoint: boolean;
}

export function ProductInventoryPanel({ products }: { products: ProductInventoryStatus[] }) {
  if (products.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-black font-medium tracking-tight text-lg mb-4">Per-Product Stockout Risk</h3>
      <div className="space-y-2">
        {products.map((product) => (
          <div
            key={product.productId}
            className={`flex items-center justify-between gap-4 p-3 rounded-xl border ${
              product.atRisk ? 'bg-red-50/60 border-red-200' : product.belowReorderPoint ? 'bg-amber-50/60 border-amber-200' : 'bg-[#F5F5F5] border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {product.atRisk ? (
                <PackageX size={16} className="text-red-600 shrink-0" />
              ) : product.belowReorderPoint ? (
                <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              ) : (
                <PackageCheck size={16} className="text-green-600 shrink-0" />
              )}
              <span className="text-sm font-medium text-black">{product.productName}</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-black">
                {product.daysOfStockRemaining != null ? `${product.daysOfStockRemaining} days of stock` : 'No stock data'}
              </p>
              {product.atRisk && <p className="text-xs text-red-600">Will stock out before reorder arrives</p>}
              {!product.atRisk && product.belowReorderPoint && <p className="text-xs text-amber-600">Below reorder point</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
