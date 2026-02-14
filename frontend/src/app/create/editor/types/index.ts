
export interface TextLayer {
    id: string;
    type: 'text';
    text: string;
    width: number;
    height: number;
    x: number;
    y: number;
    // Typography
    fontSize: number;
    fontFamily: string;
    textAlign: 'left' | 'center' | 'right';
    letterSpacing: number;
    lineHeight: number;
    caseFormat: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
    isBold: boolean;
    isItalic: boolean;
    // Appearance
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    opacity: number;
    rotation: number;
    // Background
    backgroundColor: string;
    backgroundOpacity: number;
    backgroundPadding: number;
    backgroundRadius: number;
    // Shadow
    shadowEnabled: boolean;
    shadowColor: string;
    shadowBlur: number;
    shadowOffsetX: number;
    shadowOffsetY: number;
    // State
    isVisible: boolean;
    isLocked: boolean;
  }
  
  export interface ImageLayer {
    id: string;
    type: 'image';
    imageUrl: string;
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
    rotation: number;
    isVisible: boolean;
    isLocked: boolean;
  }
  
  export type Layer = TextLayer | ImageLayer;
  
  export const FONTS = [
    'Impact', 'Arial', 'Helvetica', 'Comic Sans MS', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Trebuchet MS', 'Brush Script MT'
  ];
  
  export const COLORS = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080'];
  
  // --- Helper for hex to rgba ---
 export const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  };

  export const formatText = (text: string, format: string) => {
    switch (format) {
      case 'uppercase': return text.toUpperCase();
      case 'lowercase': return text.toLowerCase();
      case 'capitalize': return text.replace(/\b\w/g, l => l.toUpperCase());
      default: return text;
    }
  };
