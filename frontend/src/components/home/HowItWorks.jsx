function HowItWorks() {
    const steps = [
        {
            num: '01',
            title: 'Create Account',
            desc: 'Sign up as a driver or passenger in just a few clicks.'
        },
        {
            num: '02',
            title: 'Post or Search',
            desc: 'Drivers post rides; passengers search for destinations.'
        },
        {
            num: '03',
            title: 'Book & Travel',
            desc: 'Book your seat, travel together, and save money!'
        }
    ];

    return (
        <div style={{ padding: '80px 20px', background: 'white' }}>
            <div className="container">
                <h2 style={{ textAlign: 'center', marginBottom: '60px', fontSize: '2.5rem' }}>How It Works</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px' }}>
                    {steps.map((step, index) => (
                        <div key={index} style={{ textAlign: 'center', maxWidth: '300px' }}>
                            <div style={{
                                fontSize: '3rem',
                                fontWeight: 'bold',
                                color: '#e9ecef',
                                marginBottom: '10px'
                            }}>
                                {step.num}
                            </div>
                            <h3 style={{ marginBottom: '15px' }}>{step.title}</h3>
                            <p style={{ color: '#666' }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HowItWorks;
