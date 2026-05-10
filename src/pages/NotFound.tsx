import React from "react";
import { Link } from "react-router";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
          <h1 className="text-8xl font-black text-slate-900 tracking-tighter relative z-10">404</h1>
          <div className="absolute bottom-4 right-12 w-12 h-12 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center -rotate-12 z-20">
            <Search className="w-6 h-6 text-indigo-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Page not found</h2>
          <p className="text-slate-500">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
          <button 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <Link 
            to="/"
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
