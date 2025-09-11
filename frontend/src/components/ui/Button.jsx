import React from 'react';
import { theme } from '../../styles/theme';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  icon,
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const variants = {
    primary: {
      backgroundColor: disabled ? theme.colors.secondary[500] : theme.colors.primary[500], // Electric Blue
      color: theme.colors.white,
      border: 'none'
    },
    secondary: {
      backgroundColor: theme.colors.white,
      color: theme.colors.secondary[900], // Charcoal Gray
      border: `1px solid ${theme.colors.secondary[500]}` // Silver
    },
    success: {
      backgroundColor: disabled ? theme.colors.secondary[300] : theme.colors.success[600],
      color: theme.colors.white,
      border: 'none'
    },
    warning: {
      backgroundColor: disabled ? theme.colors.secondary[300] : theme.colors.warning[600],
      color: theme.colors.white,
      border: 'none'
    },
    error: {
      backgroundColor: disabled ? theme.colors.secondary[300] : theme.colors.error[600],
      color: theme.colors.white,
      border: 'none'
    }
  };

  const sizes = {
    sm: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: theme.typography.fontSize.sm,
      borderRadius: theme.borderRadius.md,
      minHeight: '36px'
    },
    md: {
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      fontSize: theme.typography.fontSize.base,
      borderRadius: theme.borderRadius.md,
      minHeight: '44px' // Touch-friendly height
    },
    lg: {
      padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
      fontSize: theme.typography.fontSize.lg,
      borderRadius: theme.borderRadius.lg,
      minHeight: '52px'
    }
  };

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    border: 'none',
    textDecoration: 'none',
    userSelect: 'none',
    WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
    ...variants[variant],
    ...sizes[size]
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={baseStyle}
      className={className}
      {...props}
    >
      {loading && <span>⏳</span>}
      {icon && !loading && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;