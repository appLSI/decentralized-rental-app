import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

const AdminLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <AdminNavbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
