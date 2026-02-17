import React from 'react';

const ProgressBar = ({ value, total, colorClass, bgClass = 'bg-slate-100' }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className={`h-2 w-full ${bgClass} rounded-full overflow-hidden`}>
      <div 
        className={`h-full ${colorClass} transition-all duration-500 ease-out`} 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
