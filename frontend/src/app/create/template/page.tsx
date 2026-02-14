'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2, AlertCircle, RotateCw, Maximize2, Sun, Contrast } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { createTemplate } from '@/services/templateService';

export default function UploadTemplatePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [templateName, setTemplateName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image editing states
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [scale, setScale] = useState(1);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setOriginalImage(imageData);
      setPreviewUrl(imageData);
      setIsEditing(true);
      // Reset editing values
      setRotation(0);
      setBrightness(100);
      setContrast(100);
      setScale(1);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setOriginalImage('');
    setPreviewUrl('');
    setIsEditing(false);
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setScale(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyImageEdits = () => {
    if (!canvasRef.current || !originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Apply transformations
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      ctx.restore();

      // Update preview
      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.src = originalImage;
  };

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
  };

  const handleReset = () => {
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setScale(1);
    setPreviewUrl(originalImage);
  };

  const handleBrightnessChange = (value: number[]) => {
    setBrightness(value[0]);
  };

  const handleContrastChange = (value: number[]) => {
    setContrast(value[0]);
  };

  const handleZoomChange = (value: number[]) => {
    setScale(value[0]);
  };

  const updatePreviewWithEdits = () => {
    if (!canvasRef.current || !originalImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      ctx.restore();

      setPreviewUrl(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.src = originalImage;
  };

  // Update preview when editing values change
  React.useEffect(() => {
    if (isEditing && originalImage) {
      updatePreviewWithEdits();
    }
  }, [rotation, brightness, contrast, scale]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({ target: fileInputRef.current } as any);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!selectedFile && !previewUrl) {
      setError('Please select a template image');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      
      // Convert edited image back to file if editing was done
      if (isEditing && previewUrl && previewUrl !== originalImage) {
        const blob = await fetch(previewUrl).then(r => r.blob());
        const editedFile = new File([blob], selectedFile?.name || 'template.jpg', { type: 'image/jpeg' });
        formData.append('templatePic', editedFile);
      } else {
        formData.append('templatePic', selectedFile!);
      }

      if (templateName.trim()) {
        formData.append('name', templateName);
      }

      const response = await createTemplate(formData);
      
      if (response.success || response.data?.template) {
        setSuccess(true);
        setTemplateName('');
        handleRemoveFile();
        
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      } else {
        setError(response.message || 'Failed to upload template');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.message || 
        'An error occurred while uploading the template'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 bg-linear-to-r from-zinc-400 via-zinc-400 to-zinc-500 bg-clip-text text-transparent">
            Upload Your Template
          </h1>
          <p className="text-xs sm:text-base md:text-lg text-zinc-400">
            Create and upload custom templates. Only you can access them from your profile.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-xs sm:text-sm md:text-base text-emerald-400 font-medium">
              Template uploaded successfully! Redirecting to your profile...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm md:text-base text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Template Name */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-2 sm:mb-3">
              Template Name (Optional)
            </label>
            <Input
              type="text"
              placeholder="My Awesome Template"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="h-10 sm:h-12 bg-zinc-900/80 border-zinc-800 focus:border-zinc-500/50 focus:ring-2 focus:ring-zinc-500/20 rounded-xl text-sm sm:text-base"
              disabled={isLoading}
            />
            <p className="text-xs text-zinc-500 mt-1 sm:mt-2">
              If left empty, your username will be used as the template name.
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-zinc-300 mb-2 sm:mb-3">
              Upload Image
            </label>

            {!selectedFile ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 rounded-2xl p-12 cursor-pointer transition-all hover:border-zinc-500/50 hover:bg-zinc-500/5 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isLoading}
                />
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-zinc-500/10 flex items-center justify-center mb-4 group-hover:bg-zinc-500/20 transition-colors">
                    <Upload className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                    Drop your image here
                  </h3>
                  <p className="text-zinc-400 mb-1">or click to browse</p>
                  <p className="text-xs text-zinc-500">
                    PNG, JPG, GIF (max 5MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden space-y-4 p-4">
                {/* Image Preview */}
                <div className="relative rounded-xl overflow-hidden bg-zinc-950">
                  <img
                    src={previewUrl || undefined}
                    alt="Template preview"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 hover:bg-red-600 transition-colors"
                      disabled={isLoading}
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>

                {/* File Info */}
                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-sm text-zinc-400">
                    <span className="font-medium text-zinc-300">{selectedFile.name}</span>
                    {' '}
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                  </p>
                </div>

                {/* Image Editing Controls */}
                {isEditing && (
                  <div className="border-t border-zinc-800 pt-4 space-y-4">
                    <h4 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                      <Maximize2 className="w-4 h-4" />
                      Edit Image
                    </h4>

                    {/* Rotation */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-zinc-400 flex items-center gap-2">
                          <RotateCw className="w-3.5 h-3.5" />
                          Rotate
                        </label>
                        <span className="text-xs text-zinc-500">{rotation}°</span>
                      </div>
                      <Button
                        type="button"
                        onClick={handleRotate}
                        variant="outline"
                        className="w-full h-8 text-xs"
                      >
                        <RotateCw className="w-3.5 h-3.5 mr-2" />
                        Rotate 90°
                      </Button>
                    </div>

                    {/* Brightness */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-zinc-400 flex items-center gap-2">
                          <Sun className="w-3.5 h-3.5" />
                          Brightness
                        </label>
                        <span className="text-xs text-zinc-500">{brightness}%</span>
                      </div>
                      <Slider
                        value={[brightness]}
                        onValueChange={handleBrightnessChange}
                        min={50}
                        max={150}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Contrast */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-zinc-400 flex items-center gap-2">
                          <Contrast className="w-3.5 h-3.5" />
                          Contrast
                        </label>
                        <span className="text-xs text-zinc-500">{contrast}%</span>
                      </div>
                      <Slider
                        value={[contrast]}
                        onValueChange={handleContrastChange}
                        min={50}
                        max={150}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Zoom */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-zinc-400">Zoom</label>
                        <span className="text-xs text-zinc-500">{(scale * 100).toFixed(0)}%</span>
                      </div>
                      <Slider
                        value={[scale]}
                        onValueChange={handleZoomChange}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    {/* Reset Button */}
                    <Button
                      type="button"
                      onClick={handleReset}
                      variant="ghost"
                      className="w-full h-8 text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Reset Edits
                    </Button>
                  </div>
                )}

                {/* Hidden Canvas for Processing */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="flex-1 h-12 rounded-xl font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Template
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-8 h-12 rounded-xl font-semibold"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Info Section */}
        <div className="mt-12 p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <h3 className="font-semibold text-zinc-100 mb-3">About Your Templates</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">•</span>
              <span>Your uploaded templates are private and only accessible to you</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">•</span>
              <span>Use them anytime to create custom memes</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">•</span>
              <span>Manage your templates from your profile</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-400 font-bold">•</span>
              <span>Supported formats: PNG, JPG, GIF (max 5MB)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
