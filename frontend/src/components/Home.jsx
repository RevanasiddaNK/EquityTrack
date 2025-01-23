import React, { useEffect, useState } from 'react';
import StockList from './StockList';
import toast from 'react-hot-toast';
import Holdings from './Holdings';
import StockForm from './StockForm';
import UserProfile from './UserProfile';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import useGetStocks from '../hooks/useGetStocks';
import { useDispatch, useSelector } from 'react-redux'
import {  setWalletBalance } from '@/redux/authSlice'
import { setLoading,setOwnedStocks, setAvailableStocks} from '../redux/stocksSlice'
import { TrendingUp } from 'lucide-react';
import axios from 'axios';

import { USER_API_END_POINT } from '@/utils/constant.js'
import { STOCK_API_END_POINT } from '@/utils/constant.js'


function Home() {
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useGetStocks();

  const { user } = useSelector((store) => store.auth);
  if(user === undefined) {
    navigate('/');
  }

  const [view, setView] = useState('home');
  const [portfolio, setPortfolio] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');


  const availableStocks = useSelector((state) => state.stocks.availableStocks);
  const ownedStocks = useSelector((state) => state.stocks.ownedStocks);
  const walletBalance = useSelector((state) => state.stocks.walletBalance);

  useEffect(()=>{
    setPortfolio(ownedStocks);
  },[ownedStocks]);

  // Filter stocks based on search query
  const filterStocks = () => {
    if (!availableStocks || availableStocks.length === 0) {
      return []; // Return an empty array if stocks are not defined or empty
    }

    return availableStocks.filter(
      (stock) =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleBuy = (stock) => {
    //console.log("handleBuy", stock);
    setSelectedStock(stock);
  };

  const handleBuyMore = (stock) => {
    //console.log("handleBuyMore",stock)
    setSelectedStock({
      ...stock.stock,
      avg_price : stock.avg_price
    });
  };

  const handleBuySubmit = async (shares) => {
    //console.log("selectedStock",selectedStock);
    if (!selectedStock) {
      toast.error('No stock selected');
      return;
    }

    const totalCost = shares * selectedStock.avg_price;

    if (totalCost > walletBalance) {
      toast.error('Insufficient funds in wallet');
      return;
    }

    const totalValue = shares * selectedStock.avg_price;
    const returns = totalValue - totalCost;
    const returnsPercentage = (returns / totalCost) * 100;

    const newStock = {
      ...selectedStock,
      shares,
      buyPrice : selectedStock.avg_price,
      totalValue,
      returns,
      returnsPercentage,
    };

    const inputStock = {
      name: selectedStock.name,
      ticker: selectedStock.ticker, // Assuming ticker is same as name here; adjust if needed
      shares,
      avg_price: selectedStock.avg_price,
      mkt_price: selectedStock.avg_price,
    };

    try {
      dispatch(setLoading(true));

      // Sending request to backend
      const res = await axios.post(
        `${STOCK_API_END_POINT}/add/${user._id}`,
        inputStock,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res?.data?.success) {
        toast.success(res.data.message);
        dispatch(setWalletBalance(res.data.walletBalance));
        setSelectedStock(null);
        dispatch(setOwnedStocks([]))
      } else {
        toast.error(res?.data?.error || 'Failed to add stock');
      }
    } catch (error) {
      console.error('Error during stock purchase:', error);
      const errorMessage = error.response?.data?.error || 'Something went wrong';
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
    
  };

  const handleAddFunds = async (amount) => {

    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }


    try {
          dispatch(setLoading(true));

          // Sending request to backend
          const res = await axios.post(
            `${USER_API_END_POINT}/add`,
            {
              userId : user._id, amountToAdd : amount
            },
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );

          if (res?.data?.success) {
            toast.success(res.data.message);
            dispatch(setWalletBalance(res.data.walletBalance));
            setSelectedStock(null);
          } 
          else{
            toast.error(res?.data?.error || 'Failed to add stock');
          }
    } 
    catch (error) {
      console.error('Error during stock purchase:', error);
      const errorMessage = error.response?.data?.error || 'Something went wrong';
      toast.error(errorMessage);
    } 
    finally {
      dispatch(setLoading(false));
    }

  };

  const handleWithdraw  = async (amount) => {

    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
          dispatch(setLoading(true));

          // Sending request to backend
          const res = await axios.post(
            `${USER_API_END_POINT}/withdraw`,
            {
              userId : user._id, amountToWithdraw : amount
            },
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );

          if (res?.data?.success) {
            toast.success(res.data.message);
            dispatch(setWalletBalance(res.data.walletBalance));
            setSelectedStock(null);
          } 
          else {
            toast.error(res?.data?.error || 'Failed to add stock');
          }
    } 
    catch (error) {
      console.error('Error during stock purchase:', error);
      const errorMessage = error.response?.data?.error || 'Something went wrong';
      toast.error(errorMessage);
    } 
    finally {
      dispatch(setLoading(false));
    }

  };

 

  return (


<div className="min-h-screen flex flex-col bg-gray-100">
  <div className="flex-grow">
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4"> {/* Reduced padding */}
        <div className="flex justify-between items-center h-12"> {/* Reduced height */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-10 w-10 text-blue-500 transform transition duration-300 hover:scale-110" /> {/* Reduced icon size */}
              <span className="text-3xl font-bold text-gray-700 tracking-tight hover:text-gray-800 transition duration-200"> {/* Reduced font size */}
                EquityTrack
              </span>
            </div>

            <div className="ml-8 hidden md:flex space-x-4"> {/* Adjusted spacing */}
              <button
                onClick={() => setView('home')}
                className={`inline-flex items-center px-3 py-1.5 text-lg font-semibold rounded-md transition duration-200 ${
                  view === 'home' ? 'border-b-2 border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setView('Holdings')}
                className={`inline-flex items-center px-3 py-1.5 text-lg font-semibold rounded-md transition duration-200 ${
                  view === 'Holdings' ? 'border-b-2 border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Holdings
              </button>
            </div>
          </div>
          <div className="flex items-center">
            <UserProfile
              walletBalance={walletBalance}
              onAddFunds={handleAddFunds}
              onWithdraw={handleWithdraw}
              userEmail={user?.email}
            />
          </div>
        </div>
      </div>
    </nav>

    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {view === 'home' ? (
        <StockList
          stocks={filterStocks()}
          onBuy={handleBuy}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      ) : (
        <Holdings portfolio={portfolio} onBuyMore={handleBuyMore} />
      )}

      {selectedStock && (
        <StockForm stock={selectedStock} onSubmit={handleBuySubmit} onClose={() => setSelectedStock(null)} />
      )}
    </main>

    {/* Responsive Navigation for Mobile */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-around py-2">
        <button
          onClick={() => setView('home')}
          className={`flex flex-col items-center text-sm ${
            view === 'home' ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          <span>Home</span>
        </button>
        <button
          onClick={() => setView('Holdings')}
          className={`flex flex-col items-center text-sm ${
            view === 'Holdings' ? 'text-blue-500' : 'text-gray-500'
          }`}
        >
          <span>Holdings</span>
        </button>
      </div>
    </div>
  </div>

  <Footer /> {/* This will always be at the bottom */}
</div>



  );

}

export default Home;
