import React from 'react';
import { ArrowRight, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-[80vh] bg-white text-black">
      
      {/* Hero Section */}
      <div className="relative px-6 py-20 lg:px-12">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-black/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-bold text-black mb-6 leading-tight">
              Learn Smarter with
              <span className="text-gray-600"> WiseLearn</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Discover personalized learning paths powered by artificial intelligence. 
              Get course recommendations tailored to your goals and accelerate your journey to success.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to='/courses'>
              <button className="group px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 hover:scale-105 shadow-xl flex items-center space-x-2">
                <span className="text-lg font-semibold">Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              </Link>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;