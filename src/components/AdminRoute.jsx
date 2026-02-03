import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { adminAuthService } from '../services/adminAuth';

const AdminRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const status = await adminAuthService.checkStatus();
            setAuthenticated(status.authenticated);
            setLoading(false);
        };

        checkAuth();
    }, []);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                backgroundColor: '#0f1419',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid #2d3748',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default AdminRoute;
