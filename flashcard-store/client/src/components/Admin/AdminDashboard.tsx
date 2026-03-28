import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <div className="dashboard-links">
                <Link to="/admin/products" className="dashboard-link">Manage Products</Link>
                <Link to="/admin/orders" className="dashboard-link">Manage Orders</Link>
                <Link to="/admin/users" className="dashboard-link">Manage Users</Link>
            </div>
        </div>
    );
};

export default AdminDashboard;