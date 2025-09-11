import React from 'react';
import { theme } from '../../styles/theme';

const Badge = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const variants = {
    primary: {
      backgroundColor: theme.colors.primary[100],
      color: theme.colors.primary[700]
    },
    success: {
      backgroundColor: theme.colors.success[50],
      color: theme.colors.success[700]
    },
    warning: {
      backgroundColor: theme.colors.warning[50],
      color: theme.colors.warning[700]
    },
    error: {
      backgroundColor: theme.colors.error[50],
      color: theme.colors.error[700]
    },
    secondary: {
      backgroundColor: theme.colors.secondary[100],
      color: theme.colors.secondary[700]
    }
  };

  const sizes = {
    sm: {
      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
      fontSize: theme.typography.fontSize.xs,
      borderRadius: theme.borderRadius.sm
    },
    md: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: theme.typography.fontSize.sm,
      borderRadius: theme.borderRadius.md
    }
  };

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    ...variants[variant],
    ...sizes[size]
  };

  return (
    <span style={badgeStyle} className={className} {...props}>
      {children}
    </span>
  );
};

export default Badge;