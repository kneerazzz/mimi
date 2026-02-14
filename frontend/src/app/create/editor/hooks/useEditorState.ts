
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
      width: 400,
      height: 120,
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
      width: 400,
      height: 120,
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

  // Load saved state on mount (only if no templateId in URL)
  useEffect(() => {
    if (templateId) return; // Don't load saved state if editing a template
    
    try {
      const savedData = localStorage.getItem('meme-editor-save');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.layers && Array.isArray(parsed.layers) && parsed.layers.length > 0) {
          setLayers(parsed.layers);
          if (parsed.filters) setFilters(parsed.filters);
          if (parsed.customImage) {
            setCustomImage(parsed.customImage);
            // Load the image
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = parsed.customImage;
            img.onload = () => {
              setImageObj(img);
              setImageLoaded(true);
              if (parsed.template) {
                setTemplate(parsed.template);
              }
            };
          }
          if (parsed.zoom) setZoom(parsed.zoom);
          if (parsed.selectedId) setSelectedId(parsed.selectedId);
          if (parsed.advancedMode !== undefined) setAdvancedMode(parsed.advancedMode);
        }
      }
    } catch (error) {
      console.error('Failed to load saved state:', error);
    }
  }, []); // Only run on mount

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return;
      try {
        setLoading(true);
        let data;
        if (type === 'user') {
          const res = await getUserTemplate(templateId as any);
          // User template structure: directly has imageUrl and name
          data = res.data?.template || res.data;
          // Normalize to have consistent structure (name instead of title)
          if (data && !data.name && data.title) {
            data.name = data.title;
          }
        } else {
          const res = await getTemplateById(templateId as any);
          // Public template structure: might have title property
          data = res.data?.template || res.data;
          // Normalize to have consistent structure
          if (data && !data.name && data.title) {
            data.name = data.title;
          }
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
      width: 320,
      height: 140,
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
    // Use functional update to ensure we're working with latest state
    setLayers((currentLayers) => {
      const newLayers = currentLayers.map((l) => (l.id === id ? ({ ...l, ...updates } as Layer) : l));
      // Save to history so changes persist
      saveHistory(newLayers);
      return newLayers;
    });
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

  const setSelectedLayerId = (id: string) => {
    setSelectedId(id);
  };

  const toggleLayerVisibility = (id: string) => {
    const newLayers = layers.map((l) =>
      l.id === id ? ({ ...l, isVisible: !l.isVisible } as Layer) : l
    );
    setLayers(newLayers);
    saveHistory(newLayers);
  };

  const toggleLayerLock = (id: string) => {
    const newLayers = layers.map((l) =>
      l.id === id ? ({ ...l, isLocked: !l.isLocked } as Layer) : l
    );
    setLayers(newLayers);
    saveHistory(newLayers);
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = layers.findIndex((l) => l.id === id);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    if (targetIndex < 0 || targetIndex >= layers.length) return;

    const newLayers = [...layers];
    const [removed] = newLayers.splice(index, 1);
    newLayers.splice(targetIndex, 0, removed);

    setLayers(newLayers);
    saveHistory(newLayers);
  };

  const bringLayerForward = (id: string) => moveLayer(id, 'up');
  const sendLayerBackward = (id: string) => moveLayer(id, 'down');

  const duplicateLayer = (id: string) => {
    const layer = layers.find((l) => l.id === id);
    if (!layer) return;

    const newId = Date.now().toString();
    const offset = 3;

    const clonedLayer: Layer =
      layer.type === 'text'
        ? ({
            ...(layer as TextLayer),
            id: newId,
            x: layer.x + offset,
            y: layer.y + offset,
          } as TextLayer)
        : ({
            ...(layer as ImageLayer),
            id: newId,
            x: layer.x + offset,
            y: layer.y + offset,
          } as ImageLayer);

    const newLayers = [...layers, clonedLayer];
    setLayers(newLayers);
    setSelectedId(newId);
    saveHistory(newLayers);
    toast.success('Layer duplicated');
  };

  const selectedLayer = layers.find(l => l.id === selectedId);

  const loadSavedState = (savedData: any) => {
    try {
      if (savedData.layers && Array.isArray(savedData.layers) && savedData.layers.length > 0) {
        setLayers(savedData.layers);
        if (savedData.filters) setFilters(savedData.filters);
        if (savedData.customImage) {
          setCustomImage(savedData.customImage);
          // Load the image
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = savedData.customImage;
          img.onload = () => {
            setImageObj(img);
            setImageLoaded(true);
            if (savedData.template) {
              setTemplate(savedData.template);
            }
          };
        } else if (savedData.templateId) {
          // If we have a templateId, fetch the template
          // This will be handled by the existing useEffect
        }
        if (savedData.zoom !== undefined) setZoom(savedData.zoom);
        if (savedData.selectedId) setSelectedId(savedData.selectedId);
        if (savedData.advancedMode !== undefined) setAdvancedMode(savedData.advancedMode);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load saved state:', error);
      return false;
    }
  };

  return {
    loading,
    template,
    imageLoaded,
    setSelectedId,
    imageObj,
    advancedMode,
    setAdvancedMode,
    layers,
    setLayers,
    selectedId,
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
    toggleLayerVisibility,
    toggleLayerLock,
    bringLayerForward,
    sendLayerBackward,
    duplicateLayer,
    loadSavedState,
    undo: () => undo(setLayers),
    redo: () => redo(setLayers),
    historyIndex,
    history,
    templateId,
    type
  };
};
