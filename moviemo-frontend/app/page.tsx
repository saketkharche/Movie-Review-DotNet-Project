import { Suspense } from 'react';
import HomePage from './HomePage';

export default function Page() {
  return (
      <Suspense fallback={<div className="text-white p-10 text-center">Loading movies...</div>}>
        <HomePage />
      </Suspense>
  );
}