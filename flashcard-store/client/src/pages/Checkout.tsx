import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Cart } from '../components/Cart';
import { PaymentForm } from '../components/PaymentForm';

const Checkout: React.FC = () => {
    const [shippingDetails, setShippingDetails] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        zip: '',
    });
    const history = useHistory();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShippingDetails({ ...shippingDetails, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Process payment and order submission logic here
        // After successful submission, redirect to order confirmation
        history.push('/order-confirmation');
    };

    return (
        <div className="checkout-container">
            <h1>Checkout</h1>
            <Cart />
            <form onSubmit={handleSubmit}>
                <h2>Shipping Details</h2>
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={shippingDetails.name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={shippingDetails.address}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={shippingDetails.city}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={shippingDetails.state}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="zip"
                    placeholder="Zip Code"
                    value={shippingDetails.zip}
                    onChange={handleChange}
                    required
                />
                <PaymentForm />
                <button type="submit">Complete Order</button>
            </form>
        </div>
    );
};

export default Checkout;