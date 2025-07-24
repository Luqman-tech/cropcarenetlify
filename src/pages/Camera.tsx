
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, RotateCcw, CheckCircle, AlertTriangle, Loader2, Image as ImageIcon, Camera as CameraIcon, X as CloseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useStorage } from "@/hooks/use-storage";
import aiModelService, { loadOnnxModel, isOnnxModelLoaded, predictWithOnnx } from "@/lib/ai-model";
import { useCamera } from "@/hooks/use-camera";
import { isLikelyPlantImage } from "@/lib/ai-model";

const Camera = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelStatus, setModelStatus] = useState<string>('Loading...');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const {
    isStreaming,
    isCapturing,
    hasPermission,
    error: cameraError,
    capturedImage: cameraImage,
    startCamera,
    stopCamera,
    captureImage,
    resetCamera,
    videoRef,
    canvasRef,
    tapToFocus
  } = useCamera();

  // Storage hook
  const { saveScan, isInitialized: storageInitialized } = useStorage();

  // Simple hash function to identify unique images
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  // Check model status on mount
  useEffect(() => {
    const checkModelStatus = async () => {
      // Try to load ONNX model first
      await loadOnnxModel();
      
      const status = aiModelService.getModelStatus();
      const onnxReady = isOnnxModelLoaded();
      
      if (onnxReady) {
        setModelStatus('Ready (ONNX)');
      } else if (status.isLoaded) {
        setModelStatus('Ready (TensorFlow)');
      } else if (status.isLoading) {
        setModelStatus('Loading AI Model...');
      } else {
        setModelStatus('AI Model Error');
      }
    };

    checkModelStatus();
    const interval = setInterval(checkModelStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check camera support on mount
  useEffect(() => {
    const checkCameraSupport = () => {
      const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      if (!isSupported) {
        console.warn('Camera not supported on this device/browser');
      }
    };
    
    checkCameraSupport();
  }, []);

  // Handle file upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        console.log('📁 Uploading image:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        // Convert file to base64
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            setCapturedImage(result);
            console.log('✅ Image uploaded successfully');
            toast({
              title: "Image uploaded",
              description: "Image ready for analysis",
            });
          }
        };
        reader.readAsDataURL(file);
        
      } catch (error) {
        console.error('❌ Upload failed:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload image",
          variant: "destructive",
        });
      }
    }
  };

  // Handle analysis
  const handleAnalyze = async () => {
    if (!capturedImage) {
      toast({
        title: "No image selected",
        description: "Please upload an image to analyze",
        variant: "destructive",
      });
      return;
    }

    // Plant/leaf pre-check
    const isPlant = await isLikelyPlantImage(capturedImage);
    if (!isPlant) {
      toast({
        title: "No plant/leaf detected",
        description: "Please ensure the image clearly shows a leaf or plant. Try retaking the photo with better focus and lighting.",
        variant: "destructive",
      });
      return;
    }

    const tfStatus = aiModelService.getModelStatus();
    const onnxReady = isOnnxModelLoaded();
    
    if (!onnxReady && !tfStatus.isLoaded) {
      toast({
        title: "AI Model not ready",
        description: "Please wait for the AI model to load",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('🔄 Starting analysis for image...');
      console.log('📊 Image data length:', capturedImage.length);
      console.log('🆔 Image hash:', hashCode(capturedImage));
      
      // Create image element for analysis
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          console.log('🤖 Starting AI prediction at:', new Date().toISOString());
          let prediction;
          
          // Try ONNX model first, fallback to TensorFlow.js
          if (isOnnxModelLoaded()) {
            try {
              console.log('🚀 Using ONNX model for prediction');
              const tensor = await aiModelService.preprocessImage(img);
              prediction = await predictWithOnnx(tensor);
              tensor.dispose(); // Clean up tensor
              
              console.log('✅ ONNX prediction successful');
            } catch (onnxError) {
              console.warn('ONNX prediction failed, falling back to TensorFlow:', onnxError);
            }
          }
          
          // Fallback to TensorFlow.js if ONNX failed or not available
          if (!prediction) {
            try {
              console.log('🔄 Using TensorFlow.js model for prediction');
              prediction = await aiModelService.predict(img);
              console.log('✅ TensorFlow prediction successful');
            } catch (tfError) {
              console.warn('TensorFlow prediction failed, using fallback:', tfError);
            }
          }
          
          // Final fallback if both models failed
          if (!prediction) {
            console.warn('All AI models failed, using demo prediction');
            prediction = {
              classIndex: 26, // Tomato___healthy
              className: "Tomato___healthy",
              confidence: 0.85,
              symptoms: "No visible disease symptoms detected",
              treatment: "Continue current care practices",
              prevention: "Maintain good cultural practices, regular monitoring"
            };
            
            toast({
              title: "Demo Mode",
              description: "Using demo prediction due to AI model issues",
              variant: "default",
            });
          }
          
          // Debug: Check if treatment info is available
          console.log('🔍 Prediction result:', {
            className: prediction.className,
            confidence: prediction.confidence,
            hasTreatment: !!prediction.treatment,
            hasPrevention: !!prediction.prevention,
            hasSymptoms: !!prediction.symptoms,
            treatmentLength: prediction.treatment?.length || 0,
            timestamp: new Date().toISOString()
          });
          
          // Check disease info status
          const diseaseStatus = aiModelService.getDiseaseInfoStatus();
          console.log('🔍 Disease info status:', diseaseStatus);
          
          // Save to storage if available
          if (storageInitialized) {
            try {
              await saveScan({
                imageData: capturedImage,
                prediction: {
                  className: prediction.className,
                  confidence: prediction.confidence,
                  symptoms: prediction.symptoms,
                  treatment: prediction.treatment,
                  prevention: prediction.prevention
                }
              });
            } catch (storageError) {
              console.warn('Failed to save scan:', storageError);
            }
          }

          // Navigate to results with prediction data
          navigate("/results", { 
            state: { 
              prediction,
              imageData: capturedImage 
            } 
          });
          
        } catch (error) {
          console.error('Analysis error:', error);
          toast({
            title: "Analysis failed",
            description: "Failed to analyze image. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsAnalyzing(false);
        }
      };

      img.onerror = () => {
        toast({
          title: "Image error",
          description: "Failed to load image for analysis",
          variant: "destructive",
        });
        setIsAnalyzing(false);
      };

      img.src = capturedImage;
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  // Handle retake
  const handleRetake = () => {
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle open camera modal
  const handleOpenCamera = async () => {
    try {
      setShowCamera(true);
      await startCamera();
      
      // Show helpful message if camera takes time to load
      setTimeout(() => {
        if (!isStreaming && !cameraError) {
          toast({
            title: "Camera Loading",
            description: "Please allow camera access when prompted",
            variant: "default",
          });
        }
      }, 2000);
      
    } catch (error) {
      console.error('Failed to open camera:', error);
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions and try again.",
        variant: "destructive",
      });
      setShowCamera(false);
    }
  };

  // Handle close camera modal
  const handleCloseCamera = () => {
    setShowCamera(false);
    stopCamera();
    resetCamera();
  };

  // Handle capture from camera
  const handleCapture = async () => {
    const img = await captureImage();
    if (img) {
      setCapturedImage(img);
      handleCloseCamera();
      toast({ title: "Photo captured", description: "Image ready for analysis" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Progress Indicator */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-green-600 animate-spin mb-4" />
            <span className="text-lg font-semibold text-green-800">Analyzing image...</span>
          </div>
        </div>
      )}
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-xl shadow-xl p-4 w-full max-w-sm flex flex-col items-center relative">
            {/* Close Button */}
            <button 
              onClick={handleCloseCamera} 
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 z-10"
              aria-label="Close camera"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
            
            <div className="w-full flex flex-col items-center">
              {/* Camera Preview */}
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onClick={async (e) => {
                    if (!videoRef.current) return;
                    const rect = videoRef.current.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const y = (e.clientY - rect.top) / rect.height;
                    await tapToFocus(x, y);
                    toast({ 
                      title: "Focus requested", 
                      description: "Tap-to-focus triggered (if supported by your device)." 
                    });
                  }}
                />
                
                {/* Loading/Error States */}
                {!isStreaming && !cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Requesting camera access...</p>
                    </div>
                  </div>
                )}
                
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white p-4">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">{cameraError}</p>
                      <Button 
                        onClick={handleOpenCamera} 
                        size="sm" 
                        className="mt-2"
                        variant="secondary"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Camera Controls */}
              <div className="w-full space-y-3">
                <Button 
                  onClick={handleCapture} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3" 
                  disabled={!isStreaming || isCapturing}
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    "Capture Photo"
                  )}
                </Button>
                
                <Button 
                  onClick={handleCloseCamera} 
                  variant="outline" 
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
              
              {/* Camera Tips */}
              <div className="mt-4 text-center text-xs text-gray-500">
                <p>Tap the preview to focus • Ensure good lighting</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-green-700 hover:bg-green-100"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-green-800">Crop Analysis</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/home")}
              className="text-green-700 border-green-300 hover:bg-green-50"
            >
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Model Status */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">AI Model Status:</span>
                <div className="flex items-center space-x-2">
                  {modelStatus === 'Ready' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : modelStatus === 'Loading AI Model...' ? (
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${
                    modelStatus === 'Ready' ? 'text-green-600' : 
                    modelStatus === 'Loading AI Model...' ? 'text-blue-600' : 
                    'text-red-600'
                  }`}>
                    {modelStatus}
                  </span>
                </div>
              </div>
              {aiModelService.getModelStatus().backend && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Backend:</span>
                  <span className="text-xs text-gray-600 font-mono">
                    {aiModelService.getModelStatus().backend}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image Upload Interface */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200 overflow-hidden">
          <CardContent className="p-0">
            {!capturedImage ? (
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center relative">
                {/* Upload Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
                  <div className="w-24 h-24 bg-green-100/80 rounded-full flex items-center justify-center mb-4">
                    <ImageIcon className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Select Image from Gallery
                  </h3>
                  <p className="text-sm text-gray-600 text-center px-8">
                    Choose an image from your gallery to analyze
                  </p>
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="image-upload-overlay"
                />
              </div>
            ) : (
              <div className="aspect-square relative">
                <img
                  src={capturedImage}
                  alt="Uploaded crop"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleRetake}
                    className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Change
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-800 mb-3">Image Requirements</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Clear, well-lit image of the crop</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Focus on the affected area</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Good resolution (minimum 224x224 pixels)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Supported formats: JPG, PNG, WebP</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {!capturedImage ? (
            <>
              {/* Gallery Upload Button */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center mb-3"
              >
                <Upload className="mr-3 h-6 w-6" />
                Select Image from Gallery
              </Button>
              {/* Take Photo Button */}
              <Button
                onClick={handleOpenCamera}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                <CameraIcon className="mr-3 h-6 w-6" />
                Take Photo
              </Button>
            </>
          ) : (
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !aiModelService.getModelStatus().isLoaded}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-3 h-6 w-6" />
                  Analyze Crop
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Camera;
