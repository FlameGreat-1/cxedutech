import React from 'react';

interface ProductCardProps {
    title: string;
    description: string;
    ageRange: string;
    subject: string;
    price: number;
    format: 'physical' | 'printable';
    onAddToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ title, description, ageRange, subject, price, format, onAddToCart }) => {
    return (
        <div className="product-card" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', margin: '16px', backgroundColor: '#fff' }}>
            <h2 style={{ color: '#4CAF50' }}>{title}</h2>
            <p>{description}</p>
            <p><strong>Age Range:</strong> {ageRange}</p>
            <p><strong>Subject:</strong> {subject}</p>
            <p style={{ fontWeight: 'bold', color: '#4CAF50' }}>${price.toFixed(2)}</p>
            <p><strong>Format:</strong> {format}</p>
            <button onClick={onAddToCart} style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', padding: '10px 16px', cursor: 'pointer' }}>
                Add to Cart
            </button>
        </div>
    );
};

export default ProductCard;