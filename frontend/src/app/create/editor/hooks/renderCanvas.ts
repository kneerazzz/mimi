import { Layer, hexToRgba, formatText } from '../types';

type Filters = { brightness: number; contrast: number; saturate: number; blur: number };

/** Render at native resolution using the preview's untransformed CSS coordinate space. */
export function renderCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  layers: Layer[],
  filters: Filters,
  loadedImages: Map<string, HTMLImageElement>,
  preview: { width: number; height: number },
): boolean {
  if (!(preview.width > 0 && preview.height > 0 && image.naturalWidth > 0 && image.naturalHeight > 0)) return false;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const scaleX = canvas.width / preview.width;
  const scaleY = canvas.height / preview.height;

  ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) blur(${filters.blur * scaleX}px)`;
  ctx.drawImage(image, 0, 0);
  ctx.filter = 'none';
  ctx.scale(scaleX, scaleY);

  for (const layer of layers.filter(layer => layer.isVisible)) {
    ctx.save();
    ctx.globalAlpha = layer.opacity / 100;
    ctx.translate(layer.x / 100 * preview.width, layer.y / 100 * preview.height);
    ctx.rotate(layer.rotation * Math.PI / 180);
    if (layer.type === 'image') {
      const overlay = loadedImages.get(layer.imageUrl);
      // Never produce a successful export that silently drops an image layer.
      if (!overlay || !overlay.complete || overlay.naturalWidth === 0) {
        ctx.restore();
        return false;
      }
      ctx.drawImage(overlay, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
      ctx.restore();
      continue;
    }

    const text = layer;
    ctx.font = `${text.isItalic ? 'italic' : 'normal'} ${text.isBold ? '900' : 'normal'} ${text.fontSize}px ${text.fontFamily}, Arial, sans-serif`;
    ctx.letterSpacing = `${text.letterSpacing}px`;
    ctx.textAlign = text.textAlign;
    ctx.textBaseline = 'alphabetic';
    const padding = text.backgroundOpacity > 0 ? text.backgroundPadding : 0;
    const displayText = formatText(text.text, text.caseFormat);
    const paragraphs = displayText.split('\n');
    const intrinsicWidth = Math.max(...paragraphs.map(line => ctx.measureText(line).width));
    // Tailwind's border-box sizing includes background padding in explicit widths.
    const boxWidth = Math.min(text.width > 0 ? text.width : intrinsicWidth + padding * 2, preview.width);
    const contentWidth = Math.max(0, boxWidth - padding * 2);
    const lines: string[] = [];
    for (const paragraph of paragraphs) {
      let line = '';
      for (const word of paragraph.split(/( +)/)) {
        if (line.trim() && word.trim() && ctx.measureText(line + word).width > contentWidth) {
          lines.push(line.trimEnd());
          line = word;
        } else {
          line += word;
        }
      }
      lines.push(line);
    }
    const lineHeight = text.fontSize * text.lineHeight;
    const naturalHeight = lines.length * lineHeight + padding * 2;
    const boxHeight = text.height > 0 ? Math.min(naturalHeight, text.height) : naturalHeight;
    const left = -boxWidth / 2;
    const top = -boxHeight / 2;

    if (text.backgroundOpacity > 0) {
      ctx.fillStyle = hexToRgba(text.backgroundColor, text.backgroundOpacity);
      ctx.beginPath();
      ctx.roundRect(left, top, boxWidth, boxHeight, text.backgroundRadius);
      ctx.fill();
    }
    // The preview clips text at its box, including an explicit maximum height.
    ctx.beginPath();
    ctx.rect(left, top, boxWidth, boxHeight);
    ctx.clip();
    const textX = text.textAlign === 'left' ? left + padding
      : text.textAlign === 'right' ? boxWidth / 2 - padding : 0;
    const metrics = ctx.measureText('Mg');
    const ascent = metrics.fontBoundingBoxAscent ?? text.fontSize * 0.8;
    const descent = metrics.fontBoundingBoxDescent ?? text.fontSize * 0.2;
    const baseline = top + padding + (lineHeight - ascent - descent) / 2 + ascent;
    lines.forEach((line, index) => {
      const y = baseline + index * lineHeight;
      // CSS creates one shadow for the text. Leaving the Canvas shadow enabled
      // for both strokeText and fillText paints it twice and makes narrow
      // outlines look much heavier after export.
      const hasStroke = text.strokeWidth > 0 && Boolean(text.strokeColor);
      if (text.shadowEnabled) {
        ctx.shadowColor = text.shadowColor;
        // Canvas shadow values are not affected by the current transform.
        ctx.shadowBlur = text.shadowBlur * Math.max(scaleX, scaleY);
        ctx.shadowOffsetX = text.shadowOffsetX * scaleX;
        ctx.shadowOffsetY = text.shadowOffsetY * scaleY;
        if (hasStroke) {
          ctx.strokeStyle = text.strokeColor;
          ctx.lineWidth = text.strokeWidth;
          ctx.strokeText(line, textX, y);
        } else {
          ctx.fillStyle = text.fillColor || '#ffffff';
          ctx.fillText(line, textX, y);
        }
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
      if (hasStroke && !text.shadowEnabled) {
        ctx.strokeStyle = text.strokeColor;
        ctx.lineWidth = text.strokeWidth;
        ctx.strokeText(line, textX, y);
      }
      ctx.fillStyle = text.fillColor || '#ffffff';
      // With no stroke, the shadow pass already painted the fill itself.
      if (!text.shadowEnabled || hasStroke) ctx.fillText(line, textX, y);
    });
    ctx.restore();
  }
  return true;
}
