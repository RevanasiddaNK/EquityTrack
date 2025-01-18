import React, { useState } from 'react';

export default function SellForm({ stock, onSubmit, onClose }) {
    
  const [quantity, setQuantity] = useState(1);
  const [sellPrice, setSellPrice] = useState(stock.avg_price);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(quantity, sellPrice);
  };

  return (

    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
                Sell {stock.stock.name} ({stock.stock.ticker})
              </h2>
            
                <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto transition-transform duration-200 hover:scale-105 hover:shadow-lg">
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="quantity">
                      Quantity
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 placeholder-gray-400 hover:border-red-400"
                      placeholder="Enter quantity"
                      required
                    />
                  </div>
              {/* Uncomment if you want to include Sell Price input
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="sellPrice">
                  Sell Price (&#8377;)
                </label>
                <input
                  id="sellPrice"
                  type="number"
                  step="0.01"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 placeholder-gray-400 hover:border-red-400"
                  placeholder="Enter sell price"
                  required
                />
              </div>
              */}
                    <div className="flex justify-end gap-4 mt-6">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold transition duration-200 border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200 shadow-md hover:shadow-lg"
                      >
                        Confirm Sell
                      </button>
                    </div>
                </form>
          </div>
    </div>

  );
}
