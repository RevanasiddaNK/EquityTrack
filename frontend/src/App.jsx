// src/App.jsx

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Home from './components/Home';

import { io } from 'socket.io-client';

// ✅ Named export
export const socket = io("https://equitytrack.onrender.com", {
  withCredentials: true,
});


const appRouter = createBrowserRouter([
  {
    path: '/home',
    element: <Home />
  },
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
]);

// ✅ Default export
function App() {
  return (
    <div>
      <RouterProvider router={appRouter} future={{ v7_startTransition: true }} />
    </div>
  );
}

export default App;
