import React, { memo } from 'react';
import SlideBackground from './SlideBackground';

const HeroSection = memo(({ backgroundImages = [] }) => {
  const heroStyle = {
    position: 'relative',
    minHeight: '85vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  };

  const titleStyle = {
    fontSize: '3rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '1rem',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
  };

  const subtitleStyle = {
    fontSize: '1.2rem',
    color: '#fff',
    marginBottom: '2rem',
    fontWeight: '300',
    letterSpacing: '0.5px',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
  };

  return (
    <section style={heroStyle}>
      <SlideBackground 
        images={backgroundImages}
        height="85vh"
        interval={4000}
        overlay={true}
        overlayOpacity={0.3}
      >
        <div style={containerStyle}>
          <h1 style={titleStyle}>NEW ARRIVALS</h1>
          <p style={subtitleStyle}>Discover the latest trends and express your unique style</p>
        </div>
      </SlideBackground>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;