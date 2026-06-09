import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-[#ededae] flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-[120px] font-bold text-gray-200 leading-none select-none">404</p>
        <h1 className="text-xl font-semibold text-gray-900 mt-2 mb-2">Page not found</h1>
        <p className="text-[14px] text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1e4a79] text-white rounded-xl text-[14px] font-semibold hover:bg-[#1e4a79]/90 transition-colors shadow-sm"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
