import { useState, useEffect } from 'react';

export default function Accounts() {
  return (
    <div className="bg-white border border-slate-200 rounded flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
        <h3 className="text-sm font-bold text-slate-900">Accounts & Transactions</h3>
      </div>

      <div className="flex-1 p-6 flex items-center justify-center text-slate-500 text-sm">
        <p>Accounting module mapping to General Ledger to be implemented.</p>
      </div>
    </div>
  );
}
