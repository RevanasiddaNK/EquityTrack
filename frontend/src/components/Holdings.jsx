import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function Dashboard({ portfolio, onSell, onBuyMore }) {
  const totalInvested = portfolio.reduce((sum, stock) => 
    sum + (stock.buyPrice || 0) * (stock.quantity || 0), 0
  );
  
  const currentValue = portfolio.reduce((sum, stock) => 
    sum + stock.price * (stock.quantity || 0), 0
  );
  
  const totalReturns = currentValue - totalInvested;
  const returnsPercentage = totalInvested ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;

  return (
    <div className="p-6">
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-600">Total Invested</h3>
            <DollarSign className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold">${totalInvested.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-600">Current Value</h3>
            <DollarSign className="text-green-500" />
          </div>
          <p className="text-2xl font-bold">${currentValue.toFixed(2)}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-600">Total Returns</h3>
            {totalReturns >= 0 ? (
              <TrendingUp className="text-green-500" />
            ) : (
              <TrendingDown className="text-red-500" />
            )}
          </div>
          <p className={`text-2xl font-bold ${totalReturns >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${totalReturns.toFixed(2)} ({returnsPercentage.toFixed(2)}%)
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buy Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Returns</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {portfolio.map((stock) => (
              <tr key={stock.id}>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{stock.name}</div>
                    <div className="text-gray-500">{stock.ticker}</div>
                  </div>
                </td>
                <td className="px-6 py-4">{stock.quantity}</td>
                <td className="px-6 py-4">${stock.buyPrice}</td>
                <td className="px-6 py-4">${stock.price}</td>
                <td className="px-6 py-4">
                  <span className={stock.returns && stock.returns >= 0 ? 'text-green-500' : 'text-red-500'}>
                    ${stock.returns?.toFixed(2)} ({stock.returnsPercentage?.toFixed(2)}%)
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onBuyMore(stock)}
                    className="mr-2 text-blue-600 hover:text-blue-800"
                  >
                    Buy More
                  </button>
                  <button
                    onClick={() => onSell(stock.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Sell
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}