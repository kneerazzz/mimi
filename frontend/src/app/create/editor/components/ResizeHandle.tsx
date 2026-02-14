
'use client';

import React from 'react';

interface ResizeHandleProps {
  position: 'tl' | 'tc' | 'tr' | 'ml' | 'mr' | 'bl' | 'bc' | 'br';
  onMouseDown: (e: React.MouseEvent, position: string) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ position, onMouseDown }) => {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    width: '10px',
    height: '10px',
    backgroundColor: '#8b5cf6',
    border: '1px solid white',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
  };

  const positionStyles: { [key: string]: React.CSSProperties } = {
    tl: { top: '0', left: '0', cursor: 'nwse-resize' },
    tc: { top: '0', left: '50%', cursor: 'ns-resize' },
    tr: { top: '0', right: '0', cursor: 'nesw-resize' },
    ml: { top: '50%', left: '0', cursor: 'ew-resize' },
    mr: { top: '50%', right: '0', cursor: 'ew-resize' },
    bl: { bottom: '0', left: '0', cursor: 'nesw-resize' },
    bc: { bottom: '0', left: '50%', cursor: 'ns-resize' },
    br: { bottom: '0', right: '0', cursor: 'nwse-resize' },
  };

  return (
    <div
      style={{ ...baseStyle, ...positionStyles[position] }}
      onMouseDown={(e) => onMouseDown(e, position)}
    />
  );
};
