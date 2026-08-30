import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Hero() {
    const navigate = useNavigate();
    const images = [
        'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80'
    ];
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 5000); // Change every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hero" style={{
            backgroundImage: `linear-gradient(rgba(0, 86, 179, 0.6), rgba(0, 198, 255, 0.6)), url("${images[currentImage]}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '100px 20px',
            color: 'white',
            textAlign: 'center',
            borderRadius: '0 0 50px 50px',
            transition: 'background-image 1s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh'
        }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)', maxWidth: '900px' }}>
                Travel Together, Save Together
            </h1>
            <p style={{ fontSize: '1.5rem', marginBottom: '40px', maxWidth: '800px', margin: '0 0 40px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                The smartest way to share rides, reduce costs, and help the environment.
                Join our community today.
            </p>
            <button
                onClick={() => navigate('/get-started')}
                className="btn btn-hero"
            >
                Get Started
            </button>
        </div>
    );
}

export default Hero;
