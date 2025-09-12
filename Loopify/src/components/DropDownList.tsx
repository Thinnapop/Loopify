import React, { useState, useRef, useEffect, type ReactNode, type MouseEventHandler } from 'react';

const dropdownStyles = `
  /* --- AnimatedList Styles --- */
  .scroll-list-container { position: relative; width: 100%; }
  .scroll-list { max-height: 400px; overflow-y: auto; padding: 8px; }
  .scroll-list::-webkit-scrollbar { width: 8px; }
  .scroll-list::-webkit-scrollbar-track { background: #181818; }
  .scroll-list::-webkit-scrollbar-thumb { background: #535353; border-radius: 4px; }
  .item { 
    padding: 12px 16px; 
    background-color: transparent; 
    border-radius: 4px; 
    margin-bottom: 4px; 
    transition: background-color 0.2s ease, opacity 0.3s ease; 
    opacity: 0; /* Start as invisible for the animation */
    animation: fadeIn 0.5s ease forwards;
  }
  .item:hover { background-color: #3e3e3e; }
  .item.selected { background-color: #3e3e3e; }
  .item-text { color: white; margin: 0; font-size: 14px; }

  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
`;

// --- The Main DropDownList Component ---
interface DropDownListProps { 
  items?: string[]; 
}

const DropDownList: React.FC<DropDownListProps> = ({ items = [] }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  return (
    <>
      <style>{dropdownStyles}</style>
      <div className="scroll-list-container">
        <div className="scroll-list">
          {items.map((item, index) => (
            <div 
              key={index} 
              className={`item ${selectedIndex === index ? 'selected' : ''}`}
              style={{ animationDelay: `${index * 0.05}s` }} // Stagger the animation
              onClick={() => setSelectedIndex(index)}
            >
              <p className="item-text">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DropDownList;

