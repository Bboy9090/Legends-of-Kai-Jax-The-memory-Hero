import React from 'react';
import '../../styles/design-system.css';

interface LegendaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * LEGENDARY BUTTON COMPONENT
 * Based on Design Bible - Beast Form Style
 */
export const LegendaryButton: React.FC<LegendaryButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  style = {}
}) => {
  const baseClasses = 'text-ui-button text-white uppercase tracking-wider cursor-pointer transition-all duration-200';
  
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
};

export default LegendaryButton;
