import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { availableStocks } from '../data/mockStocks';
import StockList from './StockList';
import Holdings from './Holdings';
import StockForm from './StockForm';
import UserProfile from './UserProfile';

import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

function Home() {
  
  const { user } = useSelector(store => store.auth);

  const [view, setView] = useState('home');
  const [portfolio, setPortfolio] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [walletBalance, setWalletBalance] = useState(10000);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  const handleLogout = () => {
    console.log("user Loggedout!");
  };

  const filteredStocks = availableStocks.filter(stock =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuy = (stock) => {
    setSelectedStock(stock);
  };

  const handleBuySubmit = (quantity, buyPrice) => {
    if (selectedStock) {
      const totalCost = quantity * buyPrice;
      
      if (totalCost > walletBalance) {
        alert('Insufficient funds in wallet');
        return;
      }

      const totalValue = quantity * selectedStock.price;
      const returns = totalValue - (quantity * buyPrice);
      const returnsPercentage = (returns / (quantity * buyPrice)) * 100;

      const newStock = {
        ...selectedStock,
        quantity,
        buyPrice,
        totalValue,
        returns,
        returnsPercentage,
      };

      setPortfolio([...portfolio, newStock]);
      setWalletBalance(prevBalance => prevBalance - totalCost);
      setSelectedStock(null);
    }
  };

  const handleSell = (stockId) => {
    const stockToSell = portfolio.find(stock => stock.id === stockId);
    if (stockToSell) {
      const saleValue = stockToSell.price * stockToSell.quantity;
      setWalletBalance(prevBalance => prevBalance + saleValue);
      setPortfolio(portfolio.filter(stock => stock.id !== stockId));
    }
  };

  const handleBuyMore = (stock) => {
    setSelectedStock(stock);
  };

  const handleAddFunds = (amount) => {
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    setWalletBalance(prevBalance => prevBalance + amount);
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
    setWalletBalance(prevBalance => prevBalance - amount);
  };



  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-2" />
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
            stocks={filteredStocks}
            onBuy={handleBuy}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        ) : (
          <Holdings
            portfolio={portfolio}
            onSell={handleSell}
            onBuyMore={handleBuyMore}
          />
        )}

        {selectedStock && (
          <StockForm
            stock={selectedStock}
            onSubmit={handleBuySubmit}
            onClose={() => setSelectedStock(null)}
          />
        )}
      </main>
    </div>
  );
}

export default Home;