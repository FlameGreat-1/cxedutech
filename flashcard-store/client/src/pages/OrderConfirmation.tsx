import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrderConfirmation: React.FC = () => {
    const location = useLocation();
    const { orderId } = location.state || { orderId: null };

    return (
        <div className="order-confirmation">
            <Navbar />
            <div className="confirmation-container">
                <h1>Thank You for Your Order!</h1>
                {orderId ? (
                    <p>Your order ID is: <strong>{orderId}</strong></p>
                ) : (
                    <p>We could not retrieve your order details. Please check your email for confirmation.</p>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default OrderConfirmation;