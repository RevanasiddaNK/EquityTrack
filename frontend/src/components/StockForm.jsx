import React, { useState } from 'react';

export default function StockForm({ stock, onSubmit, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [buyPrice, setBuyPrice] = useState(stock.avg_price);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(quantity, buyPrice);
  };

  return (

    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Buy {stock.name} ({stock.ticker})</h2>
            <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto transition-transform duration-200 hover:scale-105 hover:shadow-lg">
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="quantity">
                    Quantity
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400 hover:border-blue-400"
                    aria-describedby="quantityHelp"
                    placeholder="Enter quantity"
                    required
                  />
                  <p id="quantityHelp" className="text-gray-500 text-xs mt-1">
                    Please enter a quantity of at least 1.
                  </p>
                </div>

                  {/* Uncomment if you want to include Buy Price input
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="buyPrice">
                      Buy Price ($)
                    </label>
                    <input
                      id="buyPrice"
                      type="number"
                      step="0.01"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(Number(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400 hover:border-blue-400"
                    />
                  </div>
                  */}

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition duration-200 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg"
                    >
                      Confirm Purchase
                    </button>
                  </div>
                  
            </form>
        </div>
    </div>

  );
}