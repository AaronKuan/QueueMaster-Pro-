import React from 'react';
import { Order, OrderStatus } from '../types';

interface OrderCardProps {
  order: Order;
  size: 'large' | 'small';
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, size }) => {
  const isReady = order.status === OrderStatus.READY;

  // Visual variants based on size and status
  const containerClasses = size === 'large'
    ? `p-6 rounded-2xl border-l-8 shadow-lg flex items-center justify-between mb-4 animate-pulse-once
       ${isReady ? 'bg-emerald-900/40 border-emerald-500' : 'bg-slate-800 border-slate-600'}`
    : `p-3 rounded-xl border-l-4 mb-3 flex items-center justify-between
       ${isReady ? 'bg-emerald-900/30 border-emerald-500' : 'bg-slate-800 border-slate-600'}`;

  const textClasses = size === 'large'
    ? 'text-7xl font-bold tracking-tighter'
    : 'text-4xl font-bold tracking-tight';

  const labelClasses = size === 'large'
    ? 'text-2xl font-medium opacity-80'
    : 'text-lg font-medium opacity-70';

  return (
    <div className={`${containerClasses} transition-all duration-300 transform`}>
      <div className="flex flex-col">
        <span className={`${textClasses} ${isReady ? 'text-emerald-400' : 'text-slate-200'}`}>
          {order.number}
        </span>
        {order.type && (
          <span className="text-slate-400 text-sm mt-1 font-mono bg-slate-900/50 px-2 py-0.5 rounded w-fit">
             #{order.type}
          </span>
        )}
      </div>
      
      <div className="flex items-center">
        {isReady && (
           <span className={`${labelClasses} text-emerald-400`}>
             PICK UP
           </span>
        )}
      </div>
    </div>
  );
};