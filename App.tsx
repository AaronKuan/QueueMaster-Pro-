import React, { useState, useEffect, useCallback } from 'react';
import { ChefHat, ShoppingBag, Activity } from 'lucide-react';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import { useSound } from './hooks/useSound';
import { Order, OrderStatus, ScanResult } from './types';
import { STORAGE_KEY, STATUS_CODE_MAP } from './constants';
import { Clock } from './components/Clock';
import { OrderCard } from './components/OrderCard';

const App: React.FC = () => {
  // --- State ---
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { playDing } = useSound();

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  // --- Logic ---
  const handleScan = useCallback((result: ScanResult) => {
    const { number, type, explicitStatus } = result;

    setOrders((prevOrders) => {
      const existingOrderIndex = prevOrders.findIndex((o) => o.number === number);
      const newOrders = [...prevOrders];
      const now = Date.now();

      // Case 1: Explicit Status Provided in Barcode (e.g. 666,1,3)
      if (explicitStatus && STATUS_CODE_MAP[explicitStatus]) {
         const targetStatus = STATUS_CODE_MAP[explicitStatus] as OrderStatus;
         
         // If status is COMPLETED, remove it
         if (targetStatus === OrderStatus.COMPLETED) {
            return prevOrders.filter(o => o.number !== number);
         }

         // Otherwise update or create
         if (existingOrderIndex >= 0) {
            newOrders[existingOrderIndex] = {
                ...newOrders[existingOrderIndex],
                status: targetStatus,
                updatedAt: now,
                type: type || newOrders[existingOrderIndex].type
            };
            if (targetStatus === OrderStatus.READY) playDing();
         } else {
             newOrders.push({
                 id: crypto.randomUUID(),
                 number,
                 type: type,
                 status: targetStatus,
                 updatedAt: now
             });
             if (targetStatus === OrderStatus.READY) playDing();
         }
         return newOrders;
      }

      // Case 2: Cycle Logic (No explicit status)
      if (existingOrderIndex === -1) {
        // Step 1: New Number -> Preparing
        newOrders.push({
          id: crypto.randomUUID(),
          number,
          type: type,
          status: OrderStatus.PREPARING,
          updatedAt: now
        });
      } else {
        const currentOrder = newOrders[existingOrderIndex];
        
        if (currentOrder.status === OrderStatus.PREPARING) {
          // Step 2: Preparing -> Ready
          newOrders[existingOrderIndex] = {
            ...currentOrder,
            status: OrderStatus.READY,
            updatedAt: now,
            type: type || currentOrder.type // Update type if provided on second scan
          };
          playDing();
        } else if (currentOrder.status === OrderStatus.READY) {
          // Step 3: Ready -> Completed (Remove)
          return prevOrders.filter((_, idx) => idx !== existingOrderIndex);
        }
      }

      // Sort: Ready orders first, then by updated time
      return newOrders.sort((a, b) => {
          if (a.status === b.status) return b.updatedAt - a.updatedAt;
          return a.status === OrderStatus.READY ? -1 : 1;
      });
    });
  }, [playDing]);

  // Hook connection
  const { buffer, lastAction } = useBarcodeScanner({ onScan: handleScan });

  // Filtered lists for display
  const readyOrders = orders.filter(o => o.status === OrderStatus.READY);
  const preparingOrders = orders.filter(o => o.status === OrderStatus.PREPARING);

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col overflow-hidden font-sans">
      
      {/* --- Header --- */}
      <header className="h-20 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <ChefHat className="w-10 h-10 text-emerald-500" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">QueueMaster <span className="text-emerald-500">Pro</span></h1>
          </div>
        </div>
        <Clock />
      </header>

      {/* --- Main Content (Grid) --- */}
      <main className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        
        {/* Left Column: READY (Major focus) */}
        <section className="col-span-7 bg-slate-900/50 p-6 flex flex-col border-r border-slate-800 h-full">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <ShoppingBag className="w-8 h-8 text-emerald-400" />
            <h2 className="text-4xl font-bold text-emerald-400 uppercase tracking-widest">
              Please Pick Up
            </h2>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            {/* Using a mask for smooth cutoff if list is long (though we hide scrollbars) */}
            <div className="absolute inset-0 overflow-y-auto pb-20 scrollbar-hide">
              {readyOrders.length === 0 ? (
                <div className="h-full flex items-center justify-center opacity-20">
                    <span className="text-4xl font-light text-slate-500">No Orders Ready</span>
                </div>
              ) : (
                readyOrders.map(order => (
                  <OrderCard key={order.id} order={order} size="large" />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right Column: PREPARING (Minor focus) */}
        <section className="col-span-5 bg-slate-950/30 p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <Activity className="w-6 h-6 text-slate-400" />
            <h2 className="text-2xl font-bold text-slate-400 uppercase tracking-widest">
              Preparing
            </h2>
          </div>

          <div className="flex-1 overflow-hidden relative">
             <div className="absolute inset-0 overflow-y-auto pb-20 scrollbar-hide">
              {preparingOrders.length === 0 ? (
                  <div className="h-full flex items-center justify-center opacity-20">
                      <span className="text-2xl font-light text-slate-500">Kitchen Clear</span>
                  </div>
                ) : (
                  preparingOrders.map(order => (
                    <OrderCard key={order.id} order={order} size="small" />
                  ))
                )}
             </div>
          </div>
        </section>
      </main>

      {/* --- Debug Footer (Sticky) --- */}
      <footer className="h-12 bg-black border-t border-slate-800 flex items-center px-4 shrink-0 font-mono text-xs md:text-sm text-slate-500 gap-4">
         <div className="flex items-center gap-2">
            <span className="uppercase font-bold text-slate-600">Buffer:</span>
            <span className="text-yellow-500 bg-slate-900 px-2 py-1 rounded min-w-[50px]">{buffer}</span>
         </div>
         <div className="w-px h-6 bg-slate-800 mx-2"></div>
         <div className="flex items-center gap-2 flex-1">
            <span className="uppercase font-bold text-slate-600">Last Action:</span>
            <span className="text-slate-300 truncate">{lastAction}</span>
         </div>
         <div className="text-slate-700">v1.0.0</div>
      </footer>
    </div>
  );
};

export default App;