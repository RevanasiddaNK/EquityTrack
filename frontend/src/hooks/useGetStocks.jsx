import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socket } from "../App";

import { setAvailableStocks, setOwnedStocks, setError, setLoading } from '../redux/stocksSlice';

const useGetStocks = () => {
  const { user } = useSelector((store) => store.auth);
  const [loading, setLoadingState] = useState(true);
  const [error, setErrorState] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?._id) return;

    dispatch(setLoading(true));
    setLoadingState(true);

    // Emit request to server to join user's room or request initial data
    socket.emit('subscribeToStocks', { userId: user._id });

    // Listen for stock data from server
    socket.on('stockData', (data) => {
      if (data?.availableStocks && data?.ownedStocks) {
        dispatch(setAvailableStocks(data.availableStocks));
        dispatch(setOwnedStocks(data.ownedStocks));
        setErrorState(null);
      } else {
        const errMsg = 'Invalid stock data from socket';
        dispatch(setError(errMsg));
        setErrorState(errMsg);
      }
      dispatch(setLoading(false));
      setLoadingState(false);
    });

    socket.on('connect_error', (err) => {
      const errMsg = 'Socket connection failed';
      console.error(errMsg, err);
      dispatch(setError(errMsg));
      setErrorState(errMsg);
      dispatch(setLoading(false));
      setLoadingState(false);
    });

    return () => {
      socket.off('stockData');
      socket.emit('unsubscribeFromStocks', { userId: user._id }); // Optional: clean up on server
    };
  }, [user, dispatch]);

};

export default useGetStocks;
