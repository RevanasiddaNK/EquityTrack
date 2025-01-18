import React, { useState } from 'react';
import { Wallet, ChevronDown, LogOut } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux'

import { setLoading, setUser } from '@/redux/authSlice'
import { setOwnedStocks, setAvailableStocks} from '../redux/stocksSlice'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { USER_API_END_POINT } from '@/utils/constant'

export default function UserProfile({ onAddFunds, onWithdraw, userEmail }) {
  
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [showFundsModal, setShowFundsModal] = useState(false);
  const [transactionType, setTransactionType] = useState('add');

  const walletBalance = useSelector((state) => state.auth.walletBalance);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async (e) => {
    e.preventDefault();
    try {
        dispatch(setLoading(true));
        const res = await axios.post(`${USER_API_END_POINT}/logout`,{
            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true,

        });

        if (res.data.success) {
            dispatch(setUser(null));
            dispatch(setAvailableStocks([]));
            dispatch(setOwnedStocks([]));
            navigate("/")
            //navigate("/home", { state: { user: res.data.user } });
            toast.success(res.data.message);
        }

    } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
    } finally {
        dispatch(setLoading(false));
    }
  };

  const handleTransaction = (e) => {
      e.preventDefault();
      const value = parseFloat(amount);
      if (transactionType === 'add') {
        onAddFunds(value);
      } else{
        onWithdraw(value);
      }
      setAmount('');
      setShowFundsModal(false);
  };

  const openModal = (type) => {
      setTransactionType(type);
      setShowFundsModal(true);
  };

  return (

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
        >
          <div className="flex items-center">
            <Wallet className="h-5 w-5 mr-2 " />
            <span className="text-lg font-semibold">&#8377;{walletBalance?.toFixed(2) || -1000}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 z-20 bg-white rounded-md shadow-lg py-1">
            <div className="px-4 py-2 text-sm font-bold text-gray-700 border-b">
              {userEmail}
            </div>
            <button
              onClick={() => openModal('add')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
            >
              Add Funds
            </button>
            <button
              onClick={() => openModal('withdraw')}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
            >
              Withdraw Funds
            </button>
            <hr className="my-1" />
            <button
              onClick={logoutHandler}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
            >
              <div className="flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </div>
            </button>
          </div>
        )}

        {showFundsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {transactionType === 'add' ? 'Add Funds' : 'Withdraw Funds'}
              </h2>

              <form onSubmit={handleTransaction} className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto transition-transform duration-200 hover:scale-105 hover:shadow-lg">
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-semibold mb-2">
                      Amount (&#8377;)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-200 hover:border-blue-400"
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setShowFundsModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition duration-200 border border-gray-300 rounded-md hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 shadow-md hover:shadow-lg"
                    >
                      Confirm
                    </button>
                  </div>
              </form>
              
            </div>
          </div>
        )}
        
      </div>
  );

}