import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OrderManager: React.FC = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('/api/orders');
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const updateOrderStatus = async (orderId: string, status: string) => {
        try {
            await axios.put(`/api/orders/${orderId}`, { status });
            setOrders(orders.map(order => (order.id === orderId ? { ...order, status } : order)));
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    if (loading) {
        return <div>Loading orders...</div>;
    }

    return (
        <div>
            <h1>Order Manager</h1>
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.status}</td>
                            <td>
                                <button onClick={() => updateOrderStatus(order.id, 'Shipped')}>Ship</button>
                                <button onClick={() => updateOrderStatus(order.id, 'Cancelled')}>Cancel</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderManager;