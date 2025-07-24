import { useState, useRef, useCallback } from 'react';

export interface CameraState {
  isStreaming: boolean;
  isCapturing: boolean;
  hasPermission: boolean;
  error: string | null;
  capturedImage: string | null;
}

export interface CameraActions {
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  captureImage: () => Promise<string | null>;
  uploadImage: (file: File) => Promise<string>;
  resetCamera: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  tapToFocus: (x: number, y: number) => Promise<void>;
}

export const useCamera = (): CameraState & CameraActions => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
        setHasPermission(true);
      }
      
    } catch (err) {
      console.error('Camera error:', err);
      setError(err instanceof Error ? err.message : 'Failed to access camera');
      setHasPermission(false);
      setIsStreaming(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
  }, []);

  const captureImage = useCallback(async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      setError('Camera not ready');
      return null;
    }

    try {
      setIsCapturing(true);
      setError(null);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64 image
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      setCapturedImage(imageData);
      setIsCapturing(false);
      
      return imageData;
      
    } catch (err) {
      console.error('Capture error:', err);
      setError(err instanceof Error ? err.message : 'Failed to capture image');
      setIsCapturing(false);
      return null;
    }
  }, [isStreaming]);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setCapturedImage(result);
          resolve(result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    });
  }, []);

  const resetCamera = useCallback(() => {
    setCapturedImage(null);
    setError(null);
    setIsCapturing(false);
  }, []);

  // Tap-to-focus support (where available)
  const tapToFocus = useCallback(async (x: number, y: number) => {
    if (!videoRef.current || !streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    // @ts-expect-error: ImageCapture is not always in TS lib, browser support varies
    if (window.ImageCapture && track) {
      // @ts-expect-error: ImageCapture constructor is not always in TS lib
      const imageCapture = new window.ImageCapture(track);
      if (imageCapture && imageCapture.focusMode === 'single-shot') {
        try {
          await imageCapture.setFocusPoint({ x, y });
        } catch (e) {
          console.warn('Tap-to-focus not supported:', e);
        }
      }
    }
  }, []);

  return {
    // State
    isStreaming,
    isCapturing,
    hasPermission,
    error,
    capturedImage,
    
    // Actions
    startCamera,
    stopCamera,
    captureImage,
    uploadImage,
    resetCamera,
    tapToFocus,
    
    // Refs (for component use)
    videoRef,
    canvasRef
  };
}; 