
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Eye, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStorage } from "@/hooks/use-storage";
import { ScanResult } from "@/hooks/use-storage";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const History = () => {
  const navigate = useNavigate();
  const { scanHistory, deleteScan, clearHistory, isLoading, error } = useStorage();
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (confidence: number) => {
    if (confidence > 0.8) return 'bg-red-100 text-red-800';
    if (confidence > 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusIcon = (className: string) => {
    if (className.includes('healthy')) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (className: string) => {
    if (className.includes('healthy')) {
      return 'bg-green-100';
    }
    return 'bg-red-100';
  };

  const handleDeleteScan = async (id: string) => {
    if (confirm('Are you sure you want to delete this scan?')) {
      try {
        await deleteScan(id);
      } catch (error) {
        console.error('Failed to delete scan:', error);
        alert('Failed to delete scan');
      }
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear all scan history? This action cannot be undone.')) {
      try {
        await clearHistory();
      } catch (error) {
        console.error('Failed to clear history:', error);
        alert('Failed to clear history');
      }
    }
  };

  const handleViewScan = (scan: ScanResult) => {
    setSelectedScan(scan);
  };

  const handleCloseModal = () => {
    setSelectedScan(null);
  };

  // Summary stats
  const totalScans = scanHistory.length;
  const healthyScans = scanHistory.filter(scan => scan.prediction.className.includes('healthy')).length;
  const diseaseScans = totalScans - healthyScans;
  const classCounts: Record<string, number> = {};
  scanHistory.forEach(scan => {
    const label = scan.prediction.className.split('___')[1] || scan.prediction.className;
    classCounts[label] = (classCounts[label] || 0) + 1;
  });
  const chartData = {
    labels: Object.keys(classCounts),
    datasets: [
      {
        label: 'Scans',
        data: Object.values(classCounts),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
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
            <h1 className="text-xl font-bold text-green-800">Scan History</h1>
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
        {/* Summary Card */}
        {!isLoading && scanHistory.length > 0 && (
          <Card className="bg-white/90 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg">Scan Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700 font-semibold">Total Scans:</span>
                <span>{totalScans}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-700">Healthy:</span>
                <span>{healthyScans}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-700">Disease:</span>
                <span>{diseaseScans}</span>
              </div>
              {/* Simple Bar Chart */}
              {Object.keys(classCounts).length > 1 && (
                <div className="mt-4">
                  <Bar
                    data={chartData}
                    options={{
                      plugins: { legend: { display: false } },
                      scales: { x: { ticks: { color: '#047857' } }, y: { beginAtZero: true } },
                      responsive: true,
                      maintainAspectRatio: false,
                    }}
                    height={180}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {/* Error Display */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-5 w-5 animate-spin text-green-600" />
                <span className="text-gray-700">Loading scan history...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && scanHistory.length === 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-green-200">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Scan History</h3>
              <p className="text-sm text-gray-600 mb-6">
                Your crop analysis history will appear here after you perform your first scan.
              </p>
              <Button
                onClick={() => navigate("/camera")}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                Start First Scan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Scan History List */}
        {!isLoading && scanHistory.length > 0 && (
          <>
            {/* Header with Clear All */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {scanHistory.length} Scan{scanHistory.length !== 1 ? 's' : ''}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearHistory}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Clear All
              </Button>
            </div>

            {/* Scan Items */}
            <div className="space-y-4">
              {scanHistory.map((scan) => (
                <Card key={scan.id} className="bg-white/70 backdrop-blur-sm border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={scan.imageData}
                          alt="Crop scan"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Scan Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {scan.prediction.className.split('___')[1] || scan.prediction.className}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(scan.timestamp)}
                            </p>
                          </div>
                          
                          {/* Status Icon */}
                          <div className={`w-8 h-8 ${getStatusColor(scan.prediction.className)} rounded-full flex items-center justify-center ml-2`}>
                            {getStatusIcon(scan.prediction.className)}
                          </div>
                        </div>

                        {/* Confidence Badge */}
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getSeverityColor(scan.prediction.confidence)}>
                            {Math.round(scan.prediction.confidence * 100)}% Confidence
                          </Badge>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewScan(scan)}
                            className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteScan(scan.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Scan Detail Modal */}
      {selectedScan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Scan Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </div>

              {/* Image */}
              <div className="rounded-lg overflow-hidden">
                <img
                  src={selectedScan.imageData}
                  alt="Crop scan"
                  className="w-full h-48 object-cover"
                />
              </div>

              {/* Analysis Results */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disease:</span>
                      <span className="font-medium">
                        {selectedScan.prediction.className.split('___')[1] || selectedScan.prediction.className}
                      </span>
                    </div>
                                        <div className="flex justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-medium">
                        {Math.round(selectedScan.prediction.confidence * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {formatDate(selectedScan.timestamp)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Symptoms */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Symptoms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedScan.prediction.symptoms}</p>
                  </CardContent>
                </Card>

                {/* Treatment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Treatment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedScan.prediction.treatment}</p>
                  </CardContent>
                </Card>

                {/* Prevention */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Prevention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedScan.prediction.prevention}</p>
                  </CardContent>
                </Card>

                {/* Notes */}
                {selectedScan.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{selectedScan.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => navigate("/camera")}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  New Scan
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
