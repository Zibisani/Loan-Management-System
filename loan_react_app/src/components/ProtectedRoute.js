// src/components/ProtectedRoute.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const role = localStorage.getItem('role'); // Assuming role is stored in localStorage
        if (!token || !['admin', 'loan_officer'].includes(role)) {
            navigate('/login');
        }
    }, [navigate]);

    return children;
};

export default ProtectedRoute;
