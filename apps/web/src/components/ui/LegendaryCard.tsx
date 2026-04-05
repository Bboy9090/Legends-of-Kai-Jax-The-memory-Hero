import React from 'react';
import '../../styles/design-system.css';

interface LegendaryCardProps {
  children: React.ReactNode;
  elevated?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * LEGENDARY CARD COMPONENT
 * Based on Design Bible - Panel/Card styling
 */
export const LegendaryCard: React.FC<LegendaryCardProps> = ({
  children,
  elevated = false,
  className = '',
  onClick
}) => {
  const cardClass = elevated ? 'card-elevated' : 'card';
  const clickable = onClick ? 'cursor-pointer hover:border-[#FFD700] transition-all duration-200' : '';

  return (
    <div
      className={`${cardClass} ${clickable} ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
    >
      {children}
    </div>
  );
};

export default LegendaryCard;
