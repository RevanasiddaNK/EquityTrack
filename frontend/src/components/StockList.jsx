import React from 'react';
import { Search } from 'lucide-react';

export default function StockList({ stocks, onBuy, searchQuery, onSearchChange }) {
  return (

<div className="p-6 bg-gray-100 min-h-screen">
  <div className="mb-6 relative">
    <div className="relative z-10">
      <input
        type="text"
        placeholder="Search stocks..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out shadow-sm hover:shadow-md"
      />
      <Search className="absolute left-3 top-3 text-gray-400" size={20} />
    </div>
  </div>
  
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {stocks.map((stock) => (
          <div key={stock.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl text-gray-800">{stock.name}</h3>
              <p className="text-gray-500 text-sm">{stock.ticker}</p>
            </div>
            <span className={`text-xl font-bold ${stock.priceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
            &#8377;{stock.avg_price}
            </span>
          </div>
          <button
            onClick={() => onBuy(stock)}
            className="w-full mt-4 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors duration-200 ease-in-out shadow-md hover:shadow-lg"
          >
            Buy Stock
          </button>
          </div>
    ))}
  </div>
</div>

  );
}