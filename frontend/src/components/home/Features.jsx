function Features() {
    const features = [
        {
            icon: "🚗",
            title: "For Drivers",
            desc: "Share your empty seats and cut down your fuel costs. Meet interesting people on your daily commute."
        },
        {
            icon: "👥",
            title: "For Passengers",
            desc: "Travel comfortably at a fraction of the cost of a taxi. Find rides that match your schedule."
        },
        {
            icon: "🌱",
            title: "Eco-Friendly",
            desc: "Reduce carbon footprint by carpooling. Every shared ride contributes to a greener planet."
        }
    ];

    return (
        <div className="container" style={{ padding: '80px 20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '2.5rem', color: '#333' }}>
                Why Choose SmartRide?
            </h2>
            <div className="features-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '40px'
            }}>
                {features.map((feature, index) => (
                    <div key={index} className="feature-card" style={{
                        padding: '40px',
                        borderRadius: '20px',
                        background: 'white',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                        textAlign: 'center',
                        transition: 'transform 0.3s ease'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>{feature.icon}</div>
                        <h3 style={{ color: '#007bff', marginBottom: '15px' }}>{feature.title}</h3>
                        <p style={{ color: '#666', lineHeight: '1.6' }}>{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Features;
