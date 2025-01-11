import React from 'react'
import { TrendingUp } from 'lucide-react';

export const Navbar = () => {
    return (
       
          <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-600 mr-2" />
                  <span className="text-xl font-bold text-gray-900">GainGuru</span>
                </div>
              </div>
            </div>
          </nav>
      
      );
}
