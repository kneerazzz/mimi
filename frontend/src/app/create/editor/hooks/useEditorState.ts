
import { useState, useEffect, RefObject } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { getTemplateById, getUserTemplate } from '@/services/templateService';
import { Layer, TextLayer, ImageLayer } from '../types';
import { useHistory } from './useHistory';

const initialLayers: Layer[] = [
    { 
      id: '1', 
      type: 'text' as const,
      text: 'TOP TEXT', 
      x: 50, 
      y: 10, 
      fontSize: 50, 
      fontFamily: 'Impact', 
      textAlign: 'center', 
      letterSpacing: 0, 
      lineHeight: 1.2,
      caseFormat: 'uppercase', 
      isBold: true, 
      isItalic: false,
      fillColor: '#ffffff', 
      strokeColor: '#000000', 
      strokeWidth: 2, 
      opacity: 100, 
      rotation: 0,
      backgroundColor: '#000000', 
      backgroundOpacity: 0, 
      backgroundPadding: 10, 
      backgroundRadius: 0,
      shadowEnabled: true, 
      shadowColor: '#000000', 
      shadowBlur: 10, 
      shadowOffsetX: 2, 
      shadowOffsetY: 2,
      isVisible: true, 
      isLocked: false
    } as TextLayer,
    { 
      id: '2', 
      type: 'text' as const,
      text: 'BOTTOM TEXT', 
      x: 50, 
      y: 90, 
      fontSize: 50, 
      fontFamily: 'Impact', 
      textAlign: 'center', 
      letterSpacing: 0, 
      lineHeight: 1.2,
      caseFormat: 'uppercase', 
      isBold: true, 
      isItalic: false,
      fillColor: '#ffffff', 
      strokeColor: '#000000', 
      strokeWidth: 2, 
      opacity: 100, 
      rotation: 0,
      backgroundColor: '#000000', 
      backgroundOpacity: 0, 
      backgroundPadding: 10, 
      backgroundRadius: 0,
      shadowEnabled: true, 
      shadowColor: '#000000', 
      shadowBlur: 10, 
      shadowOffsetX: 2, 
      shadowOffsetY: 2,
      isVisible: true, 
      isLocked: false
    } as TextLayer,
  ];

export const useEditorState = (containerRef: RefObject<HTMLDivElement | null >) => {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const type = searchParams.get('type') || 'public';

  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<any>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);
  
  const [layers, setLayers] = useState<Layer[]>(initialLayers);
  const [selectedId, setSelectedId] = useState<string>('1');
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100, saturate: 100, blur: 0 });
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [customImage, setCustomImage] = useState<string | null>(null);

  const { saveHistory, undo, redo, history, historyIndex } = useHistory(initialLayers);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return;
      try {
        setLoading(true);
        let data;
        if (type === 'user') {
          const res = await getUserTemplate(templateId as any);
          data = res.data?.template || res.data;
        } else {
          const res = await getTemplateById(templateId as any);
          data = res.data?.template || res.data;
        }
        setTemplate(data);
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = data.imageUrl;
        img.onload = () => { setImageObj(img); setImageLoaded(true); };
      } catch {
        toast.error("Failed to load template");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [templateId, type]);

  const addText = () => {
    const id = Date.now().toString();
    const newTextLayer: TextLayer = { 
      id, 
      type: 'text', 
      text: 'New Text', 
      x: 50, 
      y: 50, 
      fontSize: 40, 
      fontFamily: 'Impact', 
      textAlign: 'center', 
      letterSpacing: 0, 
      lineHeight: 1.2,
      caseFormat: 'none', 
      isBold: true, 
      isItalic: false,
      fillColor: '#ffffff', 
      strokeColor: '#000000', 
      strokeWidth: 2, 
      opacity: 100, 
      rotation: 0,
      backgroundColor: '#000000', 
      backgroundOpacity: 0, 
      backgroundPadding: 10, 
      backgroundRadius: 0,
      shadowEnabled: true, 
      shadowColor: '#000000', 
      shadowBlur: 10, 
      shadowOffsetX: 2, 
      shadowOffsetY: 2,
      isVisible: true, 
      isLocked: false
    };
    const newLayers = [...layers, newTextLayer];
    setLayers(newLayers);
    setSelectedId(id);
    saveHistory(newLayers);
  };

  const handleImageLayerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      
      const img = new Image();
      img.onload = () => {
        const id = Date.now().toString();
        const newLayer: ImageLayer = {
          id,
          type: 'image',
          imageUrl,
          x: 50,
          y: 50,
          width: 200,
          height: 200,
          opacity: 100,
          rotation: 0,
          isVisible: true,
          isLocked: false
        };

        const newLoadedImages = new Map(loadedImages);
        newLoadedImages.set(imageUrl, img);
        setLoadedImages(newLoadedImages);

        const newLayers = [...layers, newLayer];
        setLayers(newLayers);
        setSelectedId(id);
        saveHistory(newLayers);
        toast.success('Image added successfully!');
      };
      img.src = imageUrl;
    };
    
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers(
      layers.map((l) => (l.id === id ? ({ ...l, ...updates } as Layer) : l))
    );
  };

  const deleteLayer = (id: string) => {
    const newLayers = layers.filter(l => l.id !== id);
    setLayers(newLayers);
    setSelectedId(newLayers.length > 0 ? newLayers[newLayers.length - 1].id : '');
    saveHistory(newLayers);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setCustomImage(imageUrl);
      
      const img = new Image();
      img.onload = () => {
        setImageObj(img);
        setImageLoaded(true);
        setTemplate({ imageUrl, name: file.name });
        toast.success('Image uploaded successfully!');
      };
      img.onerror = () => {
        toast.error('Failed to load image');
      };
      img.src = imageUrl;
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer?.isLocked) return;
    e.preventDefault();
    setSelectedId(id);
    setIsDragging(true);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !selectedId || !containerRef.current) return;
    const layer = layers.find(l => l.id === selectedId);
    if (layer?.isLocked) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const rect = containerRef.current.getBoundingClientRect();
    
    let xPercent = ((clientX - rect.left) / rect.width) * 100;
    let yPercent = ((clientY - rect.top) / rect.height) * 100;
    
    xPercent = Math.max(-10, Math.min(110, xPercent));
    yPercent = Math.max(-10, Math.min(110, yPercent));

    updateLayer(selectedId, { x: xPercent, y: yPercent });
  };

  const handleDragEnd = () => {
    if (isDragging) saveHistory(layers);
    setIsDragging(false);
  };

  const selectedLayer = layers.find(l => l.id === selectedId);

  return {
    loading,
    template,
    imageLoaded,
    imageObj,
    advancedMode,
    setAdvancedMode,
    layers,
    setLayers,
    selectedId,
    setSelectedId,
    isDragging,
    zoom,
    setZoom,
    filters,
    setFilters,
    loadedImages,
    customImage,
    setCustomImage,
    addText,
    handleImageLayerUpload,
    updateLayer,
    deleteLayer,
    handleImageUpload,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    selectedLayer,
    undo: () => undo(setLayers),
    redo: () => redo(setLayers),
    historyIndex,
    history,
    templateId
  };
};
