import { useNavigate } from 'react-router-dom';
import './RoleSelection.css';

function RoleSelection() {
    const navigate = useNavigate();

    const handleSelect = (role) => {
        navigate('/register', { state: { role } });
    };

    return (
        <div className="role-selection-container">
            <div className="role-header">
                <h1>How do you want to join?</h1>
                <p>Choose your primary role to get started with SmartRide.</p>
            </div>

            <div className="role-cards">
                <div className="role-card passenger" onClick={() => handleSelect('PASSENGER')}>
                    <div className="card-decoration"></div>
                    <span className="role-icon">👤</span>
                    <h3>Passenger</h3>
                    <p>Book rides instantly, track your driver, and travel in comfort.</p>
                </div>

                <div className="role-card driver" onClick={() => handleSelect('DRIVER')}>
                    <div className="card-decoration"></div>
                    <span className="role-icon">🚘</span>
                    <h3>Driver</h3>
                    <p>Share your ride, earn money, and meet new people on your commute.</p>
                </div>
            </div>
        </div>
    );
}

export default RoleSelection;
