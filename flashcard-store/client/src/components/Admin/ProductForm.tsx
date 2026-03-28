import React, { useState, useEffect } from 'react';

const ProductForm = ({ product, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ageRange, setAgeRange] = useState('');
    const [subject, setSubject] = useState('');
    const [focusArea, setFocusArea] = useState('');
    const [price, setPrice] = useState('');
    const [format, setFormat] = useState('physical');
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (product) {
            setTitle(product.title);
            setDescription(product.description);
            setAgeRange(product.ageRange);
            setSubject(product.subject);
            setFocusArea(product.focusArea);
            setPrice(product.price);
            setFormat(product.format);
            setPreview(product.preview);
        }
    }, [product]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const productData = {
            title,
            description,
            ageRange,
            subject,
            focusArea,
            price,
            format,
            preview,
        };
        onSubmit(productData);
    };

    return (
        <form onSubmit={handleSubmit} className="product-form">
            <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
            <div>
                <label>Title:</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Description:</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Age Range:</label>
                <input
                    type="text"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Subject:</label>
                <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Focus Area:</label>
                <input
                    type="text"
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Price:</label>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Format:</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)}>
                    <option value="physical">Physical</option>
                    <option value="printable">Printable</option>
                </select>
            </div>
            <div>
                <label>Preview:</label>
                <input
                    type="file"
                    onChange={(e) => setPreview(e.target.files[0])}
                />
            </div>
            <button type="submit">{product ? 'Update Product' : 'Add Product'}</button>
        </form>
    );
};

export default ProductForm;