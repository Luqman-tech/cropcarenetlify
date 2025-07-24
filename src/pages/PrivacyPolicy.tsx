import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-white/90 shadow-xl border-0 flex flex-col items-center py-12 px-4">
        <CardHeader>
          <CardTitle className="text-2xl text-green-800">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-gray-700 text-sm space-y-4">
          <p>
            <strong>CropCare AI</strong> is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your data.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-left">
            <li>We only collect information necessary for crop disease analysis and app functionality.</li>
            <li>Your images and scan results are stored locally on your device unless you choose to sync or share them.</li>
            <li>We do not sell or share your personal data with third parties.</li>
            <li>All communications with our servers are encrypted.</li>
            <li>You can delete your scan history at any time from the app.</li>
            <li>If you use expert or community features, your shared content may be visible to others.</li>
            <li>We may collect anonymous usage data to improve the app.</li>
          </ul>
          <p>
            For questions or concerns about your privacy, contact us at <a href="mailto:support@cropcareai.com" className="text-green-700 underline">support@cropcareai.com</a>.
          </p>
          <Button onClick={() => navigate("/")} className="w-full mt-6">Back to Home</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy; 