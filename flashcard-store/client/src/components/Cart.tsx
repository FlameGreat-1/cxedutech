import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, clearCart } from '../redux/cartSlice';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
    const cartItems = useSelector((state: any) => state.cart.items);
    const dispatch = useDispatch();

    const handleRemoveFromCart = (id: string) => {
        dispatch(removeFromCart(id));
    };

    const handleClearCart = () => {
        dispatch(clearCart());
    };

    const totalAmount = cartItems.reduce((total: number, item: any) => total + item.price * item.quantity, 0);

    return (
        <div className="cart-container">
            <h1>Your Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <div>
                    <p>Your cart is empty.</p>
                    <Link to="/store">Go to Store</Link>
                </div>
            ) : (
                <div>
                    <ul>
                        {cartItems.map((item: any) => (
                            <li key={item.id}>
                                <h2>{item.title}</h2>
                                <p>Price: ${item.price}</p>
                                <p>Quantity: {item.quantity}</p>
                                <button onClick={() => handleRemoveFromCart(item.id)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                    <h2>Total Amount: ${totalAmount.toFixed(2)}</h2>
                    <button onClick={handleClearCart}>Clear Cart</button>
                    <Link to="/checkout">Proceed to Checkout</Link>
                </div>
            )}
        </div>
    );
};

export default Cart;