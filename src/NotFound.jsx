import { Link } from "react-router-dom";
import { ArrowLeft, Puzzle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-md">
        <h1 className="text-7xl font-bold text-indigo-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn’t exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to={-1}
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 
            text-gray-800 px-4 py-2 rounded-xl font-medium transition"
          >
            <ArrowLeft size={18} />
            Go Back
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 
  text-white px-4 py-2 rounded-xl font-medium transition shadow"
          >
            <Puzzle size={18} />
            Sudoku
          </Link>
        </div>
      </div>
    </div>
  );
}
