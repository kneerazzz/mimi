import { useCallback, useEffect, RefObject } from 'react';
import { Layer } from '../types';
import { renderCanvas } from './renderCanvas';

export const useCanvas = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  imageObj: HTMLImageElement | null,
  imageLoaded: boolean,
  layers: Layer[],
  filters: { brightness: number; contrast: number; saturate: number; blur: number },
  loadedImages: Map<string, HTMLImageElement>
) => {
  const generateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const preview = containerRef.current;
    if (!canvas || !preview || !imageObj || !imageLoaded) return false;
    // client dimensions ignore the editor's CSS zoom transform and are read fresh
    // for every export. The hidden export canvas has no display dimensions.
    return renderCanvas(canvas, imageObj, layers, filters, loadedImages, {
      width: preview.clientWidth,
      height: preview.clientHeight,
    });
  }, [canvasRef, containerRef, imageObj, imageLoaded, layers, filters, loadedImages]);

  useEffect(() => {
    if (!imageLoaded) return;
    generateCanvas();
    const preview = containerRef.current;
    if (!preview) return;
    const observer = new ResizeObserver(() => generateCanvas());
    observer.observe(preview);
    return () => observer.disconnect();
  }, [generateCanvas, containerRef, imageLoaded]);

  return { generateCanvas };
};
