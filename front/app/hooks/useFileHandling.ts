import { useRef, useCallback } from 'react';

interface UseFileHandlingProps {
   onFileSelect: (file: File) => void;
}

export const useFileHandling = ({ onFileSelect }: UseFileHandlingProps) => {
   const fileInputRef = useRef<HTMLInputElement | null>(null);

   // File input handler
   const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
         onFileSelect(files[0]);
      }
   }, [onFileSelect]);

   // Drag and drop handlers
   const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
         const file = e.dataTransfer.files[0];
         if (fileInputRef.current) fileInputRef.current.value = '';
         onFileSelect(file);
      }
   }, [onFileSelect]);

   const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
   }, []);

   const triggerFileSelect = useCallback(() => {
      if (fileInputRef.current) {
         fileInputRef.current.click();
      }
   }, []);

   return {
      fileInputRef,
      handleFileChange,
      handleDrop,
      handleDragOver,
      triggerFileSelect
   };
};
