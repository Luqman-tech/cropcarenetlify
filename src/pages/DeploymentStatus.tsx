import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, CheckCircle, AlertTriangle, Info, Settings, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import updateManager from "@/lib/update-manager";
import deploymentConfig from "../../deploy.config.js";

interface SystemStatus {
  environment: string;
  version: string;
  buildNumber: string;
  lastUpdateCheck: Date;
  hasUpdate: boolean;
  updateInfo?: any;
  services: {
    ai: boolean;
    camera: boolean;
    storage: boolean;
    offline: boolean;
  };
}

const DeploymentStatus = () => {
  const navigate = useNavigate();
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setIsLoading(true);
    try {
      // Get deployment configuration
      const config = deploymentConfig.getConfig();
      const buildInfo = deploymentConfig.getBuildInfo();
      
      // Check for updates
      const updateStatus = await updateManager.checkForUpdates();
      
      // Check service availability
      const services = {
        ai: await checkAIService(),
        camera: await checkCameraService(),
        storage: await checkStorageService(),
        offline: await checkOfflineService()
      };

      setSystemStatus({
        environment: config.name,
        version: buildInfo.version,
        buildNumber: buildInfo.buildNumber,
        lastUpdateCheck: updateStatus.lastChecked,
        hasUpdate: updateStatus.hasUpdate,
        updateInfo: updateStatus.updateInfo,
        services
      });
    } catch (error) {
      console.error('Failed to check system status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAIService = async (): Promise<boolean> => {
    try {
      // Check if AI model files are accessible
      const response = await fetch('/models/crop_disease_model.onnx');
      return response.ok;
    } catch {
      return false;
    }
  };

  const checkCameraService = async (): Promise<boolean> => {
    try {
      // Check if camera API is available
      return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    } catch {
      return false;
    }
  };

  const checkStorageService = async (): Promise<boolean> => {
    try {
      // Check if IndexedDB is available
      return 'indexedDB' in window;
    } catch {
      return false;
    }
  };

  const checkOfflineService = async (): Promise<boolean> => {
    try {
      // Check if service worker is registered
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleForceUpdateCheck = async () => {
    setIsChecking(true);
    try {
      await updateManager.forceCheckForUpdates();
      await checkSystemStatus();
    } catch (error) {
      console.error('Failed to force update check:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleApplyUpdate = async () => {
    if (systemStatus?.hasUpdate) {
      updateManager.applyUpdate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-green-800">Checking system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-green-700 hover:bg-green-100 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-green-800">Deployment Status</h1>
          </div>
          <Button
            onClick={handleForceUpdateCheck}
            disabled={isChecking}
            className="bg-green-600 hover:bg-green-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Updates'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deployment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Deployment Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Environment:</span>
                <Badge variant="outline">{systemStatus?.environment}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Version:</span>
                <span className="text-sm">{systemStatus?.version}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Build Number:</span>
                <span className="text-sm">{systemStatus?.buildNumber}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Update Check:</span>
                <span className="text-sm">
                  {systemStatus?.lastUpdateCheck.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Update Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Update Available:</span>
                <Badge variant={systemStatus?.hasUpdate ? "default" : "secondary"}>
                  {systemStatus?.hasUpdate ? "Yes" : "No"}
                </Badge>
              </div>
              
              {systemStatus?.hasUpdate && systemStatus?.updateInfo && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Latest Version:</span>
                    <span className="text-sm">{systemStatus.updateInfo.version}</span>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">What's New:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {systemStatus.updateInfo.changelog.map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button
                    onClick={handleApplyUpdate}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Apply Update
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Service Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Service Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemStatus?.services && Object.entries(systemStatus.services).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{service} Service:</span>
                  <div className="flex items-center gap-2">
                    {status ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <Badge variant={status ? "default" : "destructive"}>
                      {status ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User Agent:</span>
                <span className="text-xs text-gray-600 max-w-xs truncate">
                  {navigator.userAgent}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Platform:</span>
                <span className="text-sm">{navigator.platform}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Language:</span>
                <span className="text-sm">{navigator.language}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Online:</span>
                <Badge variant={navigator.onLine ? "default" : "destructive"}>
                  {navigator.onLine ? "Yes" : "No"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">PWA Support:</span>
                <Badge variant="outline">
                  {('serviceWorker' in navigator) ? "Supported" : "Not Supported"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Environment Configuration */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {deploymentConfig.getEnvironmentSettings() && 
                Object.entries(deploymentConfig.getEnvironmentSettings()).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{key}:</span>
                    <Badge variant={value ? "default" : "secondary"}>
                      {value ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeploymentStatus; 