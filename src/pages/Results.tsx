
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Leaf, Droplets, Calendar, Camera, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStorage } from "@/hooks/use-storage";
import { DiseasePrediction } from "@/lib/ai-model";
import React, { useState } from "react";
import { getUserRoleFromToken } from "@/lib/auth";
import { useEffect } from "react";
import deploymentConfig from "../../deploy.config.js";
const API_BASE = deploymentConfig.getApiUrl();

interface LocationState {
  prediction: DiseasePrediction;
  imageData: string;
}

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveScan } = useStorage();

  // Get prediction data from navigation state
  const state = location.state as LocationState;
  const prediction = state?.prediction;
  const imageData = state?.imageData;

  // Fallback to mock data if no real prediction
  const result = prediction ? {
    disease: prediction.className.split('___')[1] || prediction.className,
    confidence: Math.round(prediction.confidence * 100),
    severity: prediction.confidence > 0.8 ? "High" : prediction.confidence > 0.6 ? "Medium" : "Low",
    status: prediction.className.includes('healthy') ? "Healthy" : "Disease Detected",
    recommendations: prediction.treatment ? prediction.treatment.split('. ').filter(Boolean) : ["Treatment information not available"],
    preventiveMeasures: prediction.prevention ? prediction.prevention.split('. ').filter(Boolean) : ["Prevention information not available"],
    symptoms: prediction.symptoms || "Symptoms information not available"
  } : {
    disease: "Tomato Late Blight",
    confidence: 87,
    severity: "Medium",
    status: "Disease Detected",
    recommendations: [
      "Apply fungicides (chlorothalonil, mancozeb) immediately",
      "Remove infected plants completely",
      "Improve air circulation around remaining plants",
      "Avoid overhead irrigation",
      "Monitor weather conditions and apply preventive treatments"
    ],
    preventiveMeasures: [
      "Plant resistant varieties",
      "Avoid overhead irrigation",
      "Proper spacing between plants",
      "Monitor weather conditions",
      "Remove plant debris regularly"
    ],
    symptoms: "Dark, water-soaked lesions on leaves and stems, white fungal growth in humid conditions"
  };

  // Add uncertain threshold
  const UNCERTAIN_THRESHOLD = 60;
  const isUncertain = prediction && Math.round(prediction.confidence * 100) < UNCERTAIN_THRESHOLD;

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  const getStatusIcon = (status: string) => {
    if (status === "Healthy") {
      return <CheckCircle className="h-8 w-8 text-green-600" />;
    }
    return <AlertTriangle className="h-8 w-8 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    if (status === "Healthy") {
      return "bg-green-100";
    }
    return "bg-red-100";
  };

  const handleSaveToHistory = async () => {
    if (prediction && imageData) {
      try {
        await saveScan({
          imageData,
          prediction: {
            className: prediction.className,
            confidence: prediction.confidence,
            symptoms: prediction.symptoms,
            treatment: prediction.treatment,
            prevention: prediction.prevention
          }
        });
        
        // Show success message
        alert("Scan saved to history!");
      } catch (error) {
        console.error('Failed to save scan:', error);
        alert("Failed to save scan to history");
      }
    }
  };

  const [showExpertModal, setShowExpertModal] = useState(false);
  const [expertMessage, setExpertMessage] = useState("");
  const [expertSent, setExpertSent] = useState(false);
  const [askExpertLoading, setAskExpertLoading] = useState(false);
  const [askExpertError, setAskExpertError] = useState<string | null>(null);

  // Redirect to signin if not authenticated
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Ask an Expert Modal */}
      {showExpertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs flex flex-col items-center relative">
            <button onClick={() => setShowExpertModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-600">✕</button>
            <h2 className="text-lg font-bold text-green-800 mb-2">Ask an Expert</h2>
            {expertSent ? (
              <div className="text-green-700 text-center">Your question has been sent! An expert will respond soon.</div>
            ) : (
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  setAskExpertLoading(true);
                  setAskExpertError(null);
                  try {
                    const token = localStorage.getItem("token");
                    console.log("Ask Expert token:", token); // Debug log
                    if (!token) throw new Error("Not authenticated");
                    const res = await fetch(`${API_BASE}/api/expert/questions`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                      },
                      body: JSON.stringify({ questionText: expertMessage })
                    });
                    let data = {};
                    try {
                      const text = await res.text();
                      data = text ? JSON.parse(text) : {};
                    } catch {
                      data = {};
                    }
                    if (res.ok) {
                      setExpertSent(true);
                      setTimeout(() => {
                        setShowExpertModal(false);
                        setExpertSent(false);
                        setExpertMessage("");
                      }, 2000);
                    } else {
                      setAskExpertError(data.message || "Failed to send question");
                    }
                  } catch (err: any) {
                    setAskExpertError(err.message || "Failed to send question");
                  } finally {
                    setAskExpertLoading(false);
                  }
                }}
                className="w-full flex flex-col gap-3"
              >
                <textarea
                  className="w-full rounded-lg border border-green-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  rows={3}
                  placeholder="Describe your question or concern for the expert..."
                  value={expertMessage}
                  onChange={e => setExpertMessage(e.target.value)}
                  required
                />
                {askExpertError && <div className="text-red-600 text-xs">{askExpertError}</div>}
                <Button type="submit" className="w-full py-2 rounded-lg mt-2" disabled={askExpertLoading}>
                  {askExpertLoading ? "Sending..." : "Send to Expert"}
                </Button>
              </form>
            )}
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
              onClick={() => navigate(-1)}
              className="text-green-700 hover:bg-green-100"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-green-800">Analysis Results</h1>
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
        {/* Captured Image */}
        {imageData && (
          <Card className="bg-white/70 backdrop-blur-sm border-green-200 overflow-hidden">
            <CardContent className="p-0">
              <img
                src={imageData}
                alt="Analyzed crop"
                className="w-full h-48 object-cover"
              />
            </CardContent>
          </Card>
        )}

        {/* Result Overview */}
        <Card className={`bg-white/70 backdrop-blur-sm ${getStatusColor(result.status)}`}>
          <CardHeader className="text-center">
            <div className={`w-16 h-16 ${getStatusColor(result.status)} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {getStatusIcon(result.status)}
            </div>
            <CardTitle className="text-2xl text-gray-800">{isUncertain ? "Uncertain Result" : result.disease}</CardTitle>
            
            {/* Simplified Confidence Display */}
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-center space-x-4">
                <Badge className={getSeverityColor(result.severity)}>
                  {result.severity} Severity
                </Badge>
                <Badge variant="outline" className="border-green-300 text-green-700">
                  {result.confidence}% Confidence
                </Badge>
              </div>
              
              {/* Confidence Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${result.confidence}%` }}
                ></div>
              </div>
            </div>
            {isUncertain && (
              <div className="mt-4 text-orange-700 bg-orange-100 rounded-lg px-4 py-2 text-sm font-medium">
                The AI is not confident in this result. Please retake the photo or try a different angle for better accuracy.
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Only show details if not uncertain */}
        {!isUncertain && <>
        {/* Ask an Expert Button */}
        <div className="flex justify-end mb-2">
          <Button variant="outline" onClick={() => setShowExpertModal(true)}>
            Ask an Expert
          </Button>
        </div>
        {/* Symptoms */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-gray-800">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Symptoms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{result.symptoms}</p>
          </CardContent>
        </Card>

        {/* Immediate Actions */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-gray-800">
              <Droplets className="h-5 w-5 mr-2 text-blue-600" />
              Immediate Treatment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <span className="text-xs font-semibold text-green-600">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Prevention */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-gray-800">
              <Leaf className="h-5 w-5 mr-2 text-green-600" />
              Prevention Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.preventiveMeasures.map((measure, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-gray-700">{measure}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-white/70 backdrop-blur-sm border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-gray-800">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Follow-up Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Day 1-3: Apply treatment</p>
                <p className="text-xs text-gray-600">Follow immediate treatment steps</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Day 7: Monitor progress</p>
                <p className="text-xs text-gray-600">Take new photos to track improvement</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-800">Day 14: Reassess</p>
                <p className="text-xs text-gray-600">Evaluate treatment effectiveness</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Model Info */}
        {prediction && (
          <Card className="bg-white/70 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-lg text-gray-800">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                AI Analysis Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Model:</span>
                <span className="text-gray-800">MobileNetV2</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing Time:</span>
                <span className="text-gray-800">~2 seconds</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Offline Capable:</span>
                <span className="text-green-600">✓ Yes</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => navigate("/camera")}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Camera className="mr-3 h-6 w-6" />
            Scan Another Crop
          </Button>
          
          {prediction && (
            <Button
              onClick={handleSaveToHistory}
              variant="outline"
              className="w-full border-green-300 text-green-700 hover:bg-green-50 py-6 text-lg rounded-xl font-semibold transition-all duration-300"
            >
              Save to History
            </Button>
          )}
        </div>
        </>}
      </div>
    </div>
  );
};

export default Results;
