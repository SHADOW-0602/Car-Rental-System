import React from 'react';
import { theme } from '../../styles/theme';

const Card = ({ 
  children, 
  padding = 'lg', 
  shadow = 'md', 
  className = '',
  style = {},
  ...props 
}) => {
  const paddings = {
    sm: theme.spacing.md,
    md: theme.spacing.lg,
    lg: theme.spacing.xl,
    xl: theme.spacing.xxl
  };

  const shadows = {
    none: 'none',
    sm: theme.shadows.sm,
    md: theme.shadows.md,
    lg: theme.shadows.lg,
    xl: theme.shadows.xl
  };

  const cardStyle = {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: paddings[padding],
    boxShadow: shadows[shadow],
    border: `1px solid ${theme.colors.secondary[200]}`,
    width: '100%',
    boxSizing: 'border-box',
    ...style
  };

  // Mobile responsive padding
  const mobileStyle = {
    '@media (max-width: 640px)': {
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md
    }
  };

  return (
    <div style={cardStyle} className={className} {...props}>
      {children}
    </div>
  );
};

export default Card;