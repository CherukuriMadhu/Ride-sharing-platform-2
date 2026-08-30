import { useAuth } from '../context/AuthContext';

function AdminTest() {
    const { user, loading } = useAuth();

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Admin Authentication Test</h1>

            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                <h3>Authentication State:</h3>
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                <p><strong>User Exists:</strong> {user ? 'Yes' : 'No'}</p>

                {user && (
                    <>
                        <h3 style={{ marginTop: '20px' }}>User Details:</h3>
                        <pre style={{ background: 'white', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
                            {JSON.stringify(user, null, 2)}
                        </pre>
                    </>
                )}

                <h3 style={{ marginTop: '20px' }}>LocalStorage:</h3>
                <pre style={{ background: 'white', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
                    {JSON.stringify({
                        user: localStorage.getItem('user'),
                        token: localStorage.getItem('token') ? 'exists' : 'missing'
                    }, null, 2)}
                </pre>
            </div>
        </div>
    );
}

export default AdminTest;
