import React, { memo } from 'react';

const FeatureCards = memo(() => {
  const sectionStyle = {
    padding: '4rem 0',
    backgroundColor: '#fff'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '3rem'
  };

  const cardsContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem'
  };

  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  };

  const cardTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '1rem'
  };

  const cardDescriptionStyle = {
    color: '#666',
    lineHeight: '1.6'
  };

  const features = [
    {
      title: 'Fast Delivery',
      description: 'Get your orders delivered quickly with our express shipping service.'
    },
    {
      title: 'Quality Products',
      description: 'We ensure all products meet our high quality standards before shipping.'
    },
    {
      title: '24/7 Support',
      description: 'Our customer support team is available around the clock to help you.'
    }
  ];

  return (
    <section style={sectionStyle}>
      <div style={containerStyle}>
        <h2 style={titleStyle}>Why Choose Us?</h2>
        <div style={cardsContainerStyle}>
          {features.map((feature, index) => (
            <div 
              key={index}
              style={cardStyle}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
            >
              <h3 style={cardTitleStyle}>{feature.title}</h3>
              <p style={cardDescriptionStyle}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

FeatureCards.displayName = 'FeatureCards';

export default FeatureCards;