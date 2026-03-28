import React from 'react';
import AdminDashboard from '../components/Admin/AdminDashboard';
import ProductForm from '../components/Admin/ProductForm';
import OrderManager from '../components/Admin/OrderManager';

const AdminPanel: React.FC = () => {
    return (
        <div className="admin-panel">
            <h1>Admin Panel</h1>
            <AdminDashboard />
            <ProductForm />
            <OrderManager />
        </div>
    );
};

export default AdminPanel;