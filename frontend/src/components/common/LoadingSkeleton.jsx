import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl overflow-hidden animate-pulse">
      <div className="bg-[#1F1F1F] h-72 w-full"></div>
      <div className="p-5 space-y-3">
        <div className="h-3 bg-[#2A2A2A] rounded w-1/3"></div>
        <div className="h-5 bg-[#2A2A2A] rounded w-3/4"></div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-[#2A2A2A] rounded w-1/2"></div>
          <div className="h-8 bg-[#2A2A2A] rounded-full w-8"></div>
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductSkeleton key={idx} />
      ))}
    </div>
  );
}
