import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setStocks, setError, setLoading } from '../redux/stocksSlice';

const useGetStocks = () => {
  const [loading, setLoadingState] = useState(true);
  const [error, setErrorState] = useState(null);
  const dispatch = useDispatch();
  const stocks = useSelector((store) => store.stocks.stocks); // Get stocks from Redux store

  useEffect(() => {
    const fetchAllStocks = async () => {
      try {
        setLoadingState(true);
        const res = await axios.get("http://localhost:5000/api/v1/stocks/", { withCredentials: true });
        console.log(res.data);  // Should print the array of stock objects

        if (res.data) {
          dispatch(setStocks(res.data)); // Dispatch the array to Redux store
        }
      } catch (error) {
        setErrorState("Failed to fetch stocks");
        console.error(error);
        dispatch(setError("Failed to fetch stocks")); // Set error in Redux store
      } finally {
        setLoadingState(false);
        dispatch(setLoading(false)); // Update loading state in Redux
      }
    };

    fetchAllStocks();
  }, [dispatch]);

  return { stocks, loading: loading, error };  // Return loading and error state
};

export default useGetStocks;
