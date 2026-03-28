import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch product');
                }
                const data = await response.json();
                setProduct(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="product-detail">
            <Navbar />
            <div className="product-info">
                <h1>{product.title}</h1>
                <p>{product.description}</p>
                <p>Age Range: {product.ageRange}</p>
                <p>Subject: {product.subject}</p>
                <p>Focus Area: {product.focusArea}</p>
                <p>Price: ${product.price}</p>
                <button>Add to Cart</button>
            </div>
            <Footer />
        </div>
    );
};

export default ProductDetail;