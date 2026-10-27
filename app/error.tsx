'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white border border-gray-100 rounded-3xl max-w-lg mx-auto my-12 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-5 border border-red-100">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h2 className="text-xl font-black text-gray-950 mb-2 tracking-tight">Something went wrong</h2>
      <p className="text-xs text-gray-600 mb-8 max-w-md leading-relaxed">
        {error.message || 'An unexpected error occurred while processing your request. Please try again or return to the main dashboard.'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" onClick={() => reset()} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Back to Directory
        </Button>
      </div>
    </div>
  );
}
