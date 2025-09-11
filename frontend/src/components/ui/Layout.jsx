import React from 'react';
import { theme } from '../../styles/theme';

const Layout = ({ children, maxWidth = '1200px', padding = true }) => {
  const layoutStyle = {
    minHeight: '100vh',
    backgroundColor: theme.colors.secondary[50]
  };

  const containerStyle = {
    maxWidth,
    margin: '0 auto',
    padding: padding ? `${theme.spacing.lg} ${theme.spacing.md}` : 0
  };

  return (
    <div style={layoutStyle}>
      <div style={containerStyle}>
        {children}
      </div>
    </div>
  );
};

export default Layout;