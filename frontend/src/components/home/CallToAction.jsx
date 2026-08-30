import { useNavigate } from 'react-router-dom';

function CallToAction() {
    const navigate = useNavigate();

    return (
        <div style={{ backgroundColor: '#f8f9fa', padding: '80px 20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Ready to hit the road?</h2>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '40px' }}>
                Join thousands of users who are saving money and making friends.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
                    Sign Up Now
                </button>
                <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
                    Login
                </button>
            </div>
        </div>
    );
}

export default CallToAction;
