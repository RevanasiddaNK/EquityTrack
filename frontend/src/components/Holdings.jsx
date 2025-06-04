import React from 'react';
import { TrendingUp, TrendingDown, IndianRupee  } from 'lucide-react';
import SellForm from './SellForm';
import { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux'
import { setLoading,  setWalletBalance } from '@/redux/authSlice'
import axios from "axios";
import toast from 'react-hot-toast';
import { STOCK_API_END_POINT } from '@/utils/constant.js'

export default function Holdings({ portfolio, onBuyMore }) {

  const [isSellingStock, setIsSellingStock] = useState(null);
  const dispatch = useDispatch();


  const handleSellClickedStock = (stock) => {
    setIsSellingStock(stock);
  };

  const handleClose = () => {
    setIsSellingStock(null);
  };

  const { user } = useSelector((store) => store.auth);

  const handleSellSubmit = async (quantity, sellPrice) => {
   
    
    if (!isSellingStock) {
      toast.error('No stock selected');
      return;
    }

    try {
      dispatch(setLoading(true));

      const sellData = {
        quantity,
        stockTicker : isSellingStock.stock.ticker,
        currentPrice : isSellingStock.mkt_price,
      }
      
      // Sending request to backend
      const res = await axios.post(
        `${STOCK_API_END_POINT}/sell/${user._id}`,
        sellData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res?.data?.success) {
        toast.success(res.data.message);

        dispatch(setWalletBalance(res.data.walletBalance));
        setIsSellingStock(null);
      } else {
        toast.error(res?.data?.error || 'Failed to sell shares');
      }
    } catch (error) {
      toast.error( error.response?.data?.error || 'Failed to sell shares');
      console.error('Error during stock purchase:', error);
      const errorMessage = error.response?.data?.error || 'Something went wrong';
    } finally {
      dispatch(setLoading(false));
    }
  };

  const totalInvested = portfolio.reduce((sum, stock) => 
    sum + (stock.invested || 0),0
  );

  const currentValue = portfolio.reduce((sum, stock) => 
    sum + (stock.current || 0), 0
  );
  
  const totalReturns = currentValue - totalInvested;
  const returnsPercentage = totalInvested ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;

  return (

    <div className="p-6">

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-600 text-lg font-semibold">Total Invested</h3>
              <IndianRupee className="text-blue-500 h-6 w-6" />
            </div>
            <p className="text-3xl font-bold text-gray-900">&#8377;{totalInvested.toFixed(2)}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-600 text-lg font-semibold">Current Value</h3>
              <IndianRupee  className="text-green-500 h-6 w-6" />
            </div>
            <p className="text-3xl font-bold text-gray-900">&#8377;{currentValue.toFixed(2)}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md transition-transform transform hover:scale-105">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-600 text-lg font-semibold">Total Returns</h3>
              {totalReturns >= 0 ? (
                <TrendingUp className="text-green-500 h-6 w-6" />
              ) : (
                <TrendingDown className="text-red-500 h-6 w-6" />
              )}
            </div>
            <p className={`text-3xl font-bold ${totalReturns >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            &#8377;{totalReturns.toFixed(2)} ({returnsPercentage.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-md font-bold text-gray-700 uppercase tracking-wider">Stock</th>
          <th className="px-6 py-3 text-left text-md font-bold text-gray-700 uppercase tracking-wider">Shares</th>
          <th className="px-6 py-3 text-left text-md font-bold text-gray-700 uppercase tracking-wider">AVG. Price</th>
          <th className="px-6 py-3 text-left text-md font-bold text-gray-700 uppercase tracking-wider">MKT. Price</th>
          <th className="px-6 py-3 text-left text-md font-bold text-gray-700 uppercase tracking-wider">Total Returns</th>
          <th className="px-6 py-3 text-left text-md font-bold text-gray-700 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {portfolio.map((stock) => (
          <tr key={stock._id} className="hover:bg-gray-100 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
              <div>
                <div className="font-medium text-gray-900">{stock.stock.name}</div>
                <div className="text-gray-500">{stock.stock.ticker}</div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">{stock.shares}</td>
            <td className="px-6 py-4 whitespace-nowrap">&#8377;{stock.avg_price}</td>
            <td className="px-6 py-4 whitespace-nowrap">&#8377;{stock.mkt_price}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={stock.returns && stock.returns >= 0 ? 'text-green-500' : 'text-red-500'}>
                &#8377;{stock.returns?.toFixed(2)} ({stock.returnsPercentage?.toFixed(2)}%)
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
              <button
                onClick={() => onBuyMore(stock)}
                className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-4 py-2 transition duration-200"
              >
                Buy
              </button>
              <button
                onClick={() => { handleSellClickedStock(stock); }}
                className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-4 py-2 transition duration-200"
              >
                Sell
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  {isSellingStock && (
    <SellForm
      stock={isSellingStock}
      onSubmit={handleSellSubmit}
      onClose={handleClose}
    />
  )}
      </div>
      
    </div>
    
  );
}