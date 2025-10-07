import React, { memo } from 'react';

const Footer = memo(() => {
  const footerStyle = {
    backgroundColor: '#2c2c2c',
    color: '#fff',
    padding: '3rem 0 1rem 0'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem'
  };

  const newsletterSectionStyle = {
    textAlign: 'center',
    marginBottom: '3rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #444'
  };

  const newsletterTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '300',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '2px'
  };

  const newsletterSubtitleStyle = {
    fontSize: '0.9rem',
    color: '#ccc',
    marginBottom: '1.5rem',
    fontWeight: '300'
  };

  const emailFormStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    maxWidth: '400px',
    margin: '0 auto'
  };

  const emailInputStyle = {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '1px solid #555',
    backgroundColor: '#3c3c3c',
    color: '#fff',
    borderRadius: '2px',
    fontSize: '0.9rem'
  };

  const subscribeButtonStyle = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '2px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'background-color 0.3s ease'
  };

  const linksGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem'
  };

  const linkColumnStyle = {
    display: 'flex',
    flexDirection: 'column'
  };

  const linkTitleStyle = {
    fontSize: '0.9rem',
    fontWeight: '500',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#fff'
  };

  const linkItemStyle = {
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '0.8rem',
    marginBottom: '0.5rem',
    cursor: 'pointer',
    transition: 'color 0.3s ease'
  };

  const copyrightStyle = {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: '#999',
    paddingTop: '1rem',
    borderTop: '1px solid #444'
  };

  const linkColumns = [
    {
      title: 'CIDER',
      links: ['About Us', 'Careers', 'Press', 'Sustainability']
    },
    {
      title: 'SHOP',
      links: ['New Arrivals', 'Clothing', 'Accessories', 'Sale']
    },
    {
      title: 'SUPPORT',
      links: ['Contact Us', 'Size Guide', 'Shipping', 'FAQ']
    },
    {
      title: 'CONNECT',
      links: ['Instagram', 'TikTok', 'Facebook', 'Pinterest']
    }
  ];

  const handleLinkHover = (e, isHover) => {
    e.target.style.color = isHover ? '#fff' : '#ccc';
  };

  const handleSubscribeHover = (e, isHover) => {
    e.target.style.backgroundColor = isHover ? '#f0f0f0' : '#fff';
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        {/* Newsletter Section */}
        <div style={newsletterSectionStyle}>
          <h2 style={newsletterTitleStyle}>STAY IN THE LOOP</h2>
          <p style={newsletterSubtitleStyle}>
            Be the first to know about new arrivals, exclusive offers, and style tips
          </p>
          <div style={emailFormStyle}>
            <input
              type="email"
              placeholder="Enter your email"
              style={emailInputStyle}
            />
            <button
              style={subscribeButtonStyle}
              onMouseEnter={(e) => handleSubscribeHover(e, true)}
              onMouseLeave={(e) => handleSubscribeHover(e, false)}
            >
              SUBSCRIBE
            </button>
          </div>
        </div>

        {/* Links Grid */}
        <div style={linksGridStyle}>
          {linkColumns.map((column, index) => (
            <div key={index} style={linkColumnStyle}>
              <h3 style={linkTitleStyle}>{column.title}</h3>
              {column.links.map((link, linkIndex) => (
                <a
                  key={linkIndex}
                  href="#"
                  style={linkItemStyle}
                  onMouseEnter={(e) => handleLinkHover(e, true)}
                  onMouseLeave={(e) => handleLinkHover(e, false)}
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div style={copyrightStyle}>
          © 2024 CIDER. All rights reserved.
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;