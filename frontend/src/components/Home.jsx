import React, { useEffect, useState } from 'react';
import StockList from './StockList';
import toast from 'react-hot-toast';
import Holdings from './Holdings';
import StockForm from './StockForm';
import UserProfile from './UserProfile';
import { useNavigate } from 'react-router-dom';
import useGetStocks from '../hooks/useGetStocks';
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser } from '@/redux/authSlice'
import axios from 'axios';

function Home() {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redirect to login if user is undefined
  if (user === undefined) {
    navigate('/'); // Redirect to login or home page
  }

  const [view, setView] = useState('home');
  const [portfolio, setPortfolio] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [walletBalance, setWalletBalance] = useState(10000);

  // Use the custom hook inside the component
  useGetStocks(); // This will fetch and set available and owned stocks in Redux

  // Access the stocks from Redux state
  const availableStocks = useSelector((state) => state.stocks.availableStocks);
  const ownedStocks = useSelector((state) => state.stocks.ownedStocks);
  
  // console.log("ownedStocks", ownedStocks);
  // console.log("availableStocks", availableStocks);

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
    console.log("handleBuy", stock);
    setSelectedStock(stock);
  };

  const handleBuyMore = (stock) => {
    console.log("handleBuyMore",stock)
    setSelectedStock(stock);
  };

  const handleBuySubmit = async (shares, buyPrice) => {
    console.log("selectedStock",selectedStock);
    if (!selectedStock) {
      toast.error('No stock selected');
      return;
    }

    const totalCost = shares * buyPrice;

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
      buyPrice,
      totalValue,
      returns,
      returnsPercentage,
    };

    const inputStock = {
      name: selectedStock.name,
      ticker: selectedStock.ticker, // Assuming ticker is same as name here; adjust if needed
      shares,
      avg_price: buyPrice,
      mkt_price: selectedStock.avg_price,
      current: totalValue,
      invested: shares * buyPrice,
      returns,
      returnsPercentage,
    };

    try {
      dispatch(setLoading(true));

      // Sending request to backend
      const res = await axios.post(
        `http://localhost:5000/api/v1/stocks/add/${user._id}`, // Ensure `user` contains a valid ID
        inputStock,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res?.data?.success) {
        toast.success(res.data.message);
        // Update portfolio on success
        setPortfolio((prevPortfolio) => [...prevPortfolio, newStock]);
        setWalletBalance((prevBalance) => prevBalance - totalCost);
        setSelectedStock(null);
      } else {
        toast.error(res?.data?.message || 'Failed to add stock');
      }
    } catch (error) {
      console.error('Error during stock purchase:', error);
      const errorMessage = error.response?.data?.message || 'Something went wrong';
      toast.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSell = (stockId) => {
    const stockToSell = portfolio.find((stock) => stock.id === stockId);
    if (stockToSell) {
      const saleValue = stockToSell.avg_price * stockToSell.shares;
      setWalletBalance((prevBalance) => prevBalance + saleValue);
      setPortfolio(portfolio.filter((stock) => stock.id !== stockId));
    }
  };

  const handleAddFunds = (amount) => {
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    setWalletBalance((prevBalance) => prevBalance + amount);
  };

  const handleWithdraw = (amount) => {
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (amount > walletBalance) {
      alert('Insufficient funds in wallet');
      return;
    }
    setWalletBalance((prevBalance) => prevBalance - amount);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
            <span className="text-xl font-bold text-gray-900">GainGuru</span>
              <div className="ml-8">
                <button
                  onClick={() => setView('home')}
                  className={`inline-flex items-center px-4 py-2 border-b-2 ${
                    view === 'home' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setView('Holdings')}
                  className={`inline-flex items-center px-4 py-2 border-b-2 ${
                    view === 'Holdings' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500'
                  }`}
                >
                  Holdings
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <UserProfile
                balance={walletBalance}
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
          <Holdings portfolio={portfolio} onSell={handleSell} onBuyMore={handleBuyMore} />
        )}

        {selectedStock && (
          <StockForm stock={selectedStock} onSubmit={handleBuySubmit} onClose={() => setSelectedStock(null)} />
        )}
      </main>
    </div>
  );
}

export default Home;
