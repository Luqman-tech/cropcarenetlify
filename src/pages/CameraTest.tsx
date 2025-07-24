import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCamera } from "@/hooks/use-camera";
import { ArrowLeft, Camera, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CameraTest = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState<any>(null);
  
  const {
    isStreaming,
    isCapturing,
    hasPermission,
    error: cameraError,
    capturedImage,
    startCamera,
    stopCamera,
    captureImage,
    resetCamera,
    videoRef,
    canvasRef,
    tapToFocus
  } = useCamera();

  const runCameraTest = async () => {
    setTestResults(null);
    
    try {
      console.log('🧪 Starting camera test...');
      
      // Test 1: Check camera support
      const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      console.log('📱 Camera supported:', isSupported);
      
      if (!isSupported) {
        setTestResults({
          success: false,
          error: 'Camera not supported on this device/browser'
        });
        return;
      }
      
      // Test 2: Start camera
      console.log('📹 Starting camera...');
      await startCamera();
      
      // Wait a bit for camera to initialize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test 3: Check if streaming
      console.log('📺 Camera streaming:', isStreaming);
      
      if (!isStreaming) {
        setTestResults({
          success: false,
          error: 'Camera failed to start streaming'
        });
        return;
      }
      
      // Test 4: Capture image
      console.log('📸 Capturing image...');
      const captured = await captureImage();
      
      if (!captured) {
        setTestResults({
          success: false,
          error: 'Failed to capture image'
        });
        return;
      }
      
      // Test 5: Stop camera
      stopCamera();
      
      setTestResults({
        success: true,
        message: 'Camera test completed successfully',
        capturedImage: captured
      });
      
    } catch (error) {
      console.error('❌ Camera test failed:', error);
      setTestResults({
        success: false,
        error: error.message
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-green-700 hover:bg-green-100 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-green-800">Camera Test</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🧪 Camera Test</span>
                <Badge variant="outline">Development</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runCameraTest} 
                className="w-full"
                disabled={isStreaming}
              >
                {isStreaming ? "Testing..." : "Run Camera Test"}
              </Button>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Camera Support:</span>
                  <Badge variant={!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? "default" : "destructive"}>
                    {!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? "Supported" : "Not Supported"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Permission:</span>
                  <Badge variant={hasPermission ? "default" : "secondary"}>
                    {hasPermission ? "Granted" : "Not Granted"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Streaming:</span>
                  <Badge variant={isStreaming ? "default" : "secondary"}>
                    {isStreaming ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    testResults.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {testResults.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-semibold ${
                        testResults.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {testResults.success ? 'Test Passed' : 'Test Failed'}
                      </span>
                    </div>
                    
                    {testResults.message && (
                      <p className="text-green-700">{testResults.message}</p>
                    )}
                    
                    {testResults.error && (
                      <p className="text-red-700">{testResults.error}</p>
                    )}
                  </div>
                  
                  {testResults.capturedImage && (
                    <div>
                      <h4 className="font-semibold mb-2">Captured Image:</h4>
                      <img 
                        src={testResults.capturedImage} 
                        alt="Test capture" 
                        className="w-full max-w-xs rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Click "Run Camera Test" to start testing
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Camera Preview */}
        {isStreaming && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>📹 Live Camera Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-w-md mx-auto rounded-lg border"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {cameraError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700">{cameraError}</p>
                  </div>
                )}
                
                <div className="mt-4 flex gap-2 justify-center">
                  <Button 
                    onClick={captureImage}
                    disabled={!isStreaming || isCapturing}
                    size="sm"
                  >
                    {isCapturing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Capturing...
                      </>
                    ) : (
                      <>
                        <Camera className="mr-2 h-4 w-4" />
                        Capture
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    onClick={stopCamera}
                    variant="outline"
                    size="sm"
                  >
                    Stop Camera
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Browser Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🌐 Browser Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>User Agent:</strong>
                <p className="text-gray-600 break-all">{navigator.userAgent}</p>
              </div>
              <div>
                <strong>Platform:</strong>
                <p className="text-gray-600">{navigator.platform}</p>
              </div>
              <div>
                <strong>Media Devices:</strong>
                <p className="text-gray-600">{navigator.mediaDevices ? 'Available' : 'Not Available'}</p>
              </div>
              <div>
                <strong>HTTPS:</strong>
                <p className="text-gray-600">{window.location.protocol === 'https:' ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CameraTest; 