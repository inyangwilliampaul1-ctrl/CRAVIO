import React from 'react';
import { Order } from '../../types';
import { Package, Clock, ChevronRight, MapPin, Loader2 } from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
}

const OrdersView: React.FC<OrdersViewProps> = ({ orders }) => {
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'PLACED' && o.status !== 'PAYMENT_PENDING').reverse(); 
  const pastOrders = orders.filter(o => o.status === 'DELIVERED').reverse();
  const placedOrders = orders.filter(o => o.status === 'PLACED').reverse();
  const pendingOrders = orders.filter(o => o.status === 'PAYMENT_PENDING').reverse();

  // Combine active for display (pending + placed + in progress)
  const currentOrders = [...pendingOrders, ...placedOrders, ...activeOrders];

  return (
    <div className="p-4 pb-24 space-y-6">
      <h1 className="text-2xl font-bold">Your Orders</h1>

      {/* Active Orders Section */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Active</h2>
        {currentOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm">No active orders. Hungry?</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentOrders.map(order => (
              <div key={order.id} className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="font-bold text-lg">Order #{order.id.slice(-4)}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} /> 
                            {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>
                    {order.status === 'PAYMENT_PENDING' ? (
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Loader2 size={10} className="animate-spin" /> Verifying...
                        </span>
                    ) : (
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                            {order.status.replace('_', ' ')}
                        </span>
                    )}
                </div>
                
                <div className="mb-4">
                     {order.items.slice(0, 2).map((item, i) => (
                        <p key={i} className="text-sm text-gray-600 truncate">
                            {item.quantity}x {item.item.name}
                        </p>
                     ))}
                     {order.items.length > 2 && <p className="text-xs text-gray-400">+{order.items.length - 2} more items</p>}
                </div>

                {/* Tracking Visual */}
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                        <MapPin size={16} className="text-orange-600" />
                    </div>
                    <div className="flex-1">
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${order.status === 'PAYMENT_PENDING' ? 'bg-yellow-400' : 'bg-orange-500'}`}
                                style={{
                                    width: order.status === 'PAYMENT_PENDING' ? '5%' :
                                           order.status === 'PLACED' ? '10%' : 
                                           order.status === 'ACCEPTED' ? '25%' :
                                           order.status === 'PREPARING' ? '50%' :
                                           order.status === 'READY' ? '75%' :
                                           order.status === 'ASSIGNED' ? '80%' :
                                           order.status === 'PICKED_UP' ? '90%' : '100%'
                                }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {order.status === 'PAYMENT_PENDING' && 'Confirming receipt of funds...'}
                            {order.status === 'PLACED' && 'Pending Acceptance'}
                            {order.status === 'ACCEPTED' && 'Restaurant Notified'}
                            {order.status === 'PREPARING' && 'Kitchen is preparing'}
                            {order.status === 'READY' && 'Looking for rider...'}
                            {order.status === 'ASSIGNED' && 'Rider heading to restaurant'}
                            {order.status === 'PICKED_UP' && 'Rider heading to you'}
                            {order.status === 'ON_WAY' && 'Arriving soon'}
                        </p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Orders Section */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">History</h2>
        {pastOrders.length === 0 ? (
            <p className="text-sm text-gray-400">No past orders yet.</p>
        ) : (
            <div className="space-y-3">
                {pastOrders.map(order => (
                    <div key={order.id} className="bg-white rounded-xl p-4 border border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-full">
                                <Package size={20} className="text-gray-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">Order #{order.id.slice(-4)}</p>
                                <p className="text-xs text-gray-500">{order.items.length} items • ₦{order.totalAmount.toLocaleString()}</p>
                            </div>
                        </div>
                        <button className="text-orange-600 text-sm font-semibold flex items-center">
                            Reorder <ChevronRight size={16} />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default OrdersView;