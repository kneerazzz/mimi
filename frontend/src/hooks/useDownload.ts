import { useState } from 'react';
import { toast } from 'sonner';

export const useDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      setIsDownloading(true);
      
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();

      // 2. Create a temporary, invisible link in the browser memory
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'meme.jpg'; // The name the file will have on PC

      // 3. Programmatically "click" it
      document.body.appendChild(link);
      link.click();

      // 4. Cleanup (remove the link and free memory)
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success("Download started!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download image.");
    } finally {
      setIsDownloading(false);
    }
  };

  return { downloadImage, isDownloading };
};