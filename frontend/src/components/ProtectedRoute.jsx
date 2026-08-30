import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();

    console.log('[ProtectedRoute] Loading:', loading, '| User:', user, '| Allowed Roles:', allowedRoles);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2rem',
                color: '#666'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        console.log('[ProtectedRoute] No user found, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    if (user.status === 'PENDING') {
        console.log('[ProtectedRoute] User status is PENDING, redirecting to pending-approval');
        return <Navigate to="/pending-approval" replace />;
    }

    if (user.status === 'BANNED' || user.status === 'INACTIVE') {
        console.log('[ProtectedRoute] User status is restricted, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const hasAccess = allowedRoles.includes(user.role);
        console.log('[ProtectedRoute] User role:', user.role, '| Has access:', hasAccess);

        if (!hasAccess) {
            console.log('[ProtectedRoute] Access denied, redirecting to appropriate dashboard');
            const fallback = user.role === 'DRIVER' ? '/driver-dashboard' :
                (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard');
            return <Navigate to={fallback} replace />;
        }
    }

    console.log('[ProtectedRoute] Access granted, rendering children');
    return children;
}

export default ProtectedRoute;
