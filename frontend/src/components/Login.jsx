import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
// import { USER_API_END_POINT } from '@/utils/constant'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser,setWalletBalance } from '@/redux/authSlice'
import { Mail, Lock } from 'react-feather'; // Add this import for the icons
import { USER_API_END_POINT } from '@/utils/constant'

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
    });
    const { loading, user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,

            });
           
        
            if (res.data.success) {

                dispatch(setUser(res.data.user));
                dispatch(setWalletBalance(res.data.user.walletBalance));

                navigate("/home");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        if (user) {
          // If the user is already logged in, navigate to home
          navigate('/home');
        }
      }, [user, navigate]);

    return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Login to EquityTrack</h2>
        </div>
        <form onSubmit={submitHandler}>
        <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
            Email
            </label>
            <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
                type="email"
                value={input.email}
                name="email"
                onChange={changeEventHandler}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Enter your email"
                required
            />
            </div>
        </div>
        <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
            Password
            </label>
            <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
                type="password"
                value={input.password}
                name="password"
                onChange={changeEventHandler}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="Enter your password"
                required
            />
            </div>
        </div>
        <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
            Login
        </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
        Don't have an account?{' '}
        <Link
            to="/signup"
            className="text-blue-600 hover:text-blue-800 font-semibold"
        >
            Sign up
        </Link>
        </p>
    </div>
    </div>

    );
};

export default Login;
