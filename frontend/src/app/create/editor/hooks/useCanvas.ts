
import { useEffect, RefObject } from 'react';
import { Layer, TextLayer, ImageLayer, hexToRgba, formatText } from '../types';

export const useCanvas = (
  canvasRef: RefObject<HTMLCanvasElement>,
  imageObj: HTMLImageElement | null,
  imageLoaded: boolean,
  layers: Layer[],
  filters: { brightness: number; contrast: number; saturate: number; blur: number },
  loadedImages: Map<string, HTMLImageElement>
) => {

  const generateCanvas = () => {
    if (!canvasRef.current || !imageObj || !imageLoaded) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas to image size
    canvas.width = imageObj.naturalWidth;
    canvas.height = imageObj.naturalHeight;

    // Apply filters to background image
    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) blur(${filters.blur}px)`;
    ctx.drawImage(imageObj, 0, 0);
    ctx.filter = 'none';

    // Scale calculations based on canvas height
    const scale = canvas.height / 500;

    layers.filter(l => l.isVisible).forEach(layer => {
      if (layer.type === 'image') {
        // Render image layer
        const cachedImg = loadedImages.get(layer.imageUrl);
        if (!cachedImg) return; // Skip if image not loaded yet

        ctx.save();
        ctx.globalAlpha = layer.opacity / 100;

        const x = (layer.x / 100) * canvas.width;
        const y = (layer.y / 100) * canvas.height;
        const width = layer.width * scale;
        const height = layer.height * scale;

        ctx.translate(x, y);
        ctx.rotate((layer.rotation * Math.PI) / 180);

        ctx.drawImage(cachedImg, -width / 2, -height / 2, width, height);

        ctx.restore();
      } else {
        // Render text layer
        const text = layer as TextLayer;
        ctx.save();
        ctx.globalAlpha = text.opacity / 100;
        
        const fontSize = text.fontSize * scale;
        const lineHeight = fontSize * text.lineHeight;
        const padding = text.backgroundPadding * scale;
        const radius = text.backgroundRadius * scale;
        
        ctx.font = `${text.isItalic ? 'italic' : 'normal'} ${text.isBold ? '900' : 'normal'} ${fontSize}px ${text.fontFamily}`;
        ctx.textAlign = text.textAlign;
        ctx.textBaseline = 'middle';

        const x = (text.x / 100) * canvas.width;
        const y = (text.y / 100) * canvas.height;
        
        ctx.translate(x, y);
        ctx.rotate((text.rotation * Math.PI) / 180);

        // Multi-line support
        const displayText = formatText(text.text, text.caseFormat);
        const lines = displayText.split('\n');

        // Calculate metrics for all lines
        let maxWidth = 0;
        lines.forEach(line => {
          const metrics = ctx.measureText(line);
          if (metrics.width > maxWidth) maxWidth = metrics.width;
        });

        const totalHeight = lines.length * lineHeight;

        // 1. Draw Background Box (FIXED)
        if (text.backgroundOpacity > 0) {
          const boxWidth = maxWidth + (padding * 2);
          const boxHeight = totalHeight + (padding * 2);

          // Calculate Box X based on alignment
          let boxX = -padding;
          if (text.textAlign === 'center') boxX = -(maxWidth / 2) - padding;
          if (text.textAlign === 'right') boxX = -maxWidth - padding;

          // Center box vertically around the text anchor point
          const boxY = -(totalHeight / 2) - padding;

          ctx.fillStyle = hexToRgba(text.backgroundColor, text.backgroundOpacity);
          
          // Draw rounded rectangle
          ctx.beginPath();
          if (radius > 0) {
            // Manual rounded rect for better browser support
            ctx.moveTo(boxX + radius, boxY);
            ctx.lineTo(boxX + boxWidth - radius, boxY);
            ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + radius);
            ctx.lineTo(boxX + boxWidth, boxY + boxHeight - radius);
            ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - radius, boxY + boxHeight);
            ctx.lineTo(boxX + radius, boxY + boxHeight);
            ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - radius);
            ctx.lineTo(boxX, boxY + radius);
            ctx.quadraticCurveTo(boxX, boxY, boxX + radius, boxY);
            ctx.closePath();
          } else {
            ctx.rect(boxX, boxY, boxWidth, boxHeight);
          }
          ctx.fill();
        }

        // 2. Draw Text Layers
        lines.forEach((line, i) => {
          const lineYOffset = (i - (lines.length - 1) / 2) * lineHeight;

          // Shadow
          if (text.shadowEnabled) {
            ctx.shadowColor = text.shadowColor;
            ctx.shadowBlur = text.shadowBlur * scale;
            ctx.shadowOffsetX = text.shadowOffsetX * scale;
            ctx.shadowOffsetY = text.shadowOffsetY * scale;
          } else {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }

          // Stroke
          if (text.strokeWidth > 0) {
            ctx.strokeStyle = text.strokeColor;
            ctx.lineWidth = text.strokeWidth * scale;
            ctx.strokeText(line, 0, lineYOffset);
          }

          // Fill
          ctx.fillStyle = text.fillColor;
          ctx.fillText(line, 0, lineYOffset);
        });
        
        ctx.restore();
      }
    });
  };

  useEffect(() => {
    if (imageLoaded) {
      generateCanvas();
    }
  }, [layers, filters, imageLoaded, loadedImages]);

  return { generateCanvas };
};
