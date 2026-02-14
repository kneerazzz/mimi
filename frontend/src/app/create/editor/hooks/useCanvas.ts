import { useEffect, RefObject } from 'react';
import { Layer, TextLayer, hexToRgba, formatText } from '../types';

export const useCanvas = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
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

    // 1. CALCULATE SCALE FACTOR -------------------------------------------
    // This is the magic fix. We compare the "Real Image Size" vs "Screen Size".
    // If image is 2000px wide but shown at 500px on screen, scale is 4.
    const displayWidth = canvas.clientWidth || imageObj.naturalWidth;
    const scale = imageObj.naturalWidth / displayWidth;
    // ---------------------------------------------------------------------

    // Set canvas to full resolution
    canvas.width = imageObj.naturalWidth;
    canvas.height = imageObj.naturalHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply filters
    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) blur(${filters.blur}px)`;
    ctx.drawImage(imageObj, 0, 0);
    ctx.filter = 'none';

    for (const layer of layers.filter(l => l.isVisible)) {
      if (layer.type === 'image') {
        // ... (Your existing image layer code is fine as-is) ...
        // ... (Keep the image loading logic you had) ...
        
        // Use your existing logic, but just ensure loadedImages handles the loading
        let imgToDraw = loadedImages.get(layer.imageUrl);
        if (!imgToDraw) continue; 

        ctx.save();
        ctx.globalAlpha = layer.opacity / 100;

        const x = Math.floor((layer.x / 100) * canvas.width);
        const y = Math.floor((layer.y / 100) * canvas.height);
        // Note: Image width/height usually need scaling too if they were set in pixels
        // But if layer.width is percentage (0-100), this calculation is correct:
        const width = Math.floor((layer.width / 100) * canvas.width); 
        const height = Math.floor((layer.height / 100) * canvas.height);

        ctx.translate(x, y);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.drawImage(imgToDraw, -width / 2, -height / 2, width, height);
        ctx.restore();

      } else {
        // --- TEXT LAYER RENDERING (FIXED WITH SCALING) ---
        const text = layer as TextLayer;
        ctx.save();
        ctx.globalAlpha = text.opacity / 100;
        
        // 2. APPLY SCALE TO PROPERTIES ------------------------------------
        const scaledFontSize = text.fontSize * scale;
        const scaledLineHeight = scaledFontSize * text.lineHeight;
        const scaledPadding = text.backgroundPadding * scale;
        const scaledRadius = text.backgroundRadius * scale;
        const scaledStrokeWidth = text.strokeWidth * scale;
        const scaledShadowBlur = text.shadowBlur * scale;
        const scaledShadowOffX = text.shadowOffsetX * scale;
        const scaledShadowOffY = text.shadowOffsetY * scale;
        // -----------------------------------------------------------------

        const fontWeight = text.isBold ? '900' : 'normal';
        const fontStyle = text.isItalic ? 'italic' : 'normal';
        
        // Use SCALED font size
        ctx.font = `${fontStyle} ${fontWeight} ${scaledFontSize}px ${text.fontFamily}, Arial, sans-serif`;
        ctx.textAlign = text.textAlign;
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = text.fillColor || '#ffffff';

        // Coordinates are percentage based, so they scale automatically (Good!)
        const x = Math.floor((text.x / 100) * canvas.width);
        const y = Math.floor((text.y / 100) * canvas.height);

        ctx.translate(x, y);
        ctx.rotate((text.rotation * Math.PI) / 180);

        const displayText = formatText(text.text, text.caseFormat);
        let lines: string[] = [];

        // Scale the max width box if it exists
        const hasBoxWidth = typeof text.width === 'number' && text.width > 0;
        const hasBoxHeight = typeof text.height === 'number' && text.height > 0;
        
        // CRITICAL: If text.width is in pixels, scale it. If percentage, calc it.
        // Assuming text.width is pixels from editor:
        const maxLineWidth = hasBoxWidth ? (text.width * scale) : undefined;

        // ... (Your existing word wrap logic, using maxLineWidth) ...
        if (hasBoxWidth && maxLineWidth) {
           // Reuse your exact word wrapping logic here...
           const words = displayText.split(/\s+/);
           let currentLine = '';
           words.forEach((word, idx) => {
             const testLine = currentLine ? `${currentLine} ${word}` : word;
             const metrics = ctx.measureText(testLine);
             if (metrics.width > maxLineWidth) {
               if (currentLine) { lines.push(currentLine); currentLine = word; }
               else { lines.push(word); currentLine = ''; }
             } else { currentLine = testLine; }
             if (idx === words.length - 1 && currentLine) lines.push(currentLine);
           });
           if (lines.length === 0) lines = [displayText];
        } else {
           lines = displayText.split('\n');
        }

        // ... (Rest of logic using SCALED values) ...

        let maxWidth = 0;
        lines.forEach(line => {
          const metrics = ctx.measureText(line);
          if (metrics.width > maxWidth) maxWidth = metrics.width;
        });

        const totalHeight = lines.length * scaledLineHeight; // Use Scaled LH

        // Draw Background Box
        if (text.backgroundOpacity > 0) {
          const effectiveWidth = hasBoxWidth && maxLineWidth ? maxLineWidth : maxWidth;
          const boxWidth = effectiveWidth + scaledPadding * 2; // Scaled Padding
          const boxHeight = totalHeight + scaledPadding * 2;

          let boxX = -scaledPadding;
          if (text.textAlign === 'center') boxX = -(effectiveWidth / 2) - scaledPadding;
          if (text.textAlign === 'right') boxX = -effectiveWidth - scaledPadding;
          
          // Adjust vertical centering using scaled height
          const boxY = -(totalHeight / 2) - scaledPadding + (scaledFontSize * 0.1); // Fine tune centering

          ctx.fillStyle = hexToRgba(text.backgroundColor, text.backgroundOpacity);
          
          // Draw rect using scaledRadius
          ctx.beginPath();
          if (scaledRadius > 0) {
             ctx.roundRect(boxX, boxY, boxWidth, boxHeight, scaledRadius);
          } else {
             ctx.rect(boxX, boxY, boxWidth, boxHeight);
          }
          ctx.fill();
        }

        // Draw Lines
        lines.forEach((line, i) => {
          const lineYOffset = (i - (lines.length - 1) / 2) * scaledLineHeight;
          // Note: Add a small adjustment for 'alphabetic' baseline if needed:
          // + (scaledFontSize * 0.35) often helps center visually

          if (text.shadowEnabled) {
            ctx.shadowColor = text.shadowColor;
            ctx.shadowBlur = scaledShadowBlur;
            ctx.shadowOffsetX = scaledShadowOffX;
            ctx.shadowOffsetY = scaledShadowOffY;
          } else {
            ctx.shadowColor = 'transparent';
          }

          if (text.strokeWidth > 0 && text.strokeColor) {
            ctx.strokeStyle = text.strokeColor;
            ctx.lineWidth = scaledStrokeWidth;
            ctx.strokeText(line, 0, lineYOffset);
          }

          ctx.fillStyle = text.fillColor || '#ffffff';
          ctx.fillText(line, 0, lineYOffset);
        });
        
        ctx.restore();
      }
    }
  };

  useEffect(() => {
    // Debounce this if it lags
    if (imageLoaded) {
      // Small timeout allows the canvas DOM element to size itself correctly first
      const t = setTimeout(() => generateCanvas(), 0);
      return () => clearTimeout(t);
    }
  }, [layers, filters, imageLoaded, loadedImages]);

  return { generateCanvas };
};