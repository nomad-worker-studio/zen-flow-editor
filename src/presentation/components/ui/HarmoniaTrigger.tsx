import React from 'react';
import './HarmoniaTrigger.css';

interface HarmoniaTriggerProps {
  onClick: () => void;
  visible: boolean;
}

export const HarmoniaTrigger: React.FC<HarmoniaTriggerProps> = ({ onClick, visible }) => {
  if (!visible) return null;

  return (
    <button 
      className="harmonia-trigger breathe" 
      onClick={onClick}
      title="思考の壁を越える（ハルモニアを呼ぶ）"
    >
      <div className="harmonia-icon">✨</div>
      <span className="harmonia-label">Hit a Wall</span>
    </button>
  );
};
