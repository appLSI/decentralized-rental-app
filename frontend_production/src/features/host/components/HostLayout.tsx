import React from 'react';
import { Outlet } from 'react-router-dom';
import HostNavBar from './HostNavBar';

const HostLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <HostNavBar />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default HostLayout;
