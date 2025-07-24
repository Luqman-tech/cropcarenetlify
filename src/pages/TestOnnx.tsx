import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { runAllTests } from "@/lib/test-onnx";

const TestOnnx = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const results = await runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            ONNX Integration Test
          </h1>
          <p className="text-green-600">
            Test ONNX model loading and inference capabilities
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🧪 Model Integration Tests</span>
              <Badge variant="outline">Development</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleRunTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? "Running Tests..." : "Run Integration Tests"}
            </Button>
          </CardContent>
        </Card>

        {testResults && (
          <div className="space-y-4">
            {/* ONNX Test Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🚀 ONNX Model Test</span>
                  <Badge variant={testResults.onnx?.success ? "default" : "destructive"}>
                    {testResults.onnx?.success ? "PASS" : "FAIL"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.onnx?.success ? (
                  <div className="space-y-2">
                    <p><strong>Class Index:</strong> {testResults.onnx.classIndex}</p>
                    <p><strong>Confidence:</strong> {testResults.onnx.confidence?.toFixed(4)}</p>
                    <p><strong>Output Shape:</strong> {testResults.onnx.outputShape?.join(' x ')}</p>
                  </div>
                ) : (
                  <p className="text-red-600">{testResults.onnx?.error}</p>
                )}
              </CardContent>
            </Card>

            {/* TensorFlow.js Test Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🔄 TensorFlow.js Fallback Test</span>
                  <Badge variant={testResults.tensorflow?.success ? "default" : "destructive"}>
                    {testResults.tensorflow?.success ? "PASS" : "FAIL"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResults.tensorflow?.success ? (
                  <div className="space-y-2">
                    <p><strong>Test Result:</strong> {testResults.tensorflow.result?.toFixed(4)}</p>
                  </div>
                ) : (
                  <p className="text-red-600">{testResults.tensorflow?.error}</p>
                )}
              </CardContent>
            </Card>

            {/* Error Display */}
            {testResults.error && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">❌ Test Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-600">{testResults.error}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 Test Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>ONNX Model:</strong> /models/crop_disease_model.onnx</p>
              <p><strong>Input Shape:</strong> [1, 3, 224, 224]</p>
              <p><strong>Output Shape:</strong> [1, 33] (33 disease classes)</p>
              <p><strong>Fallback:</strong> TensorFlow.js if ONNX fails</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestOnnx; 