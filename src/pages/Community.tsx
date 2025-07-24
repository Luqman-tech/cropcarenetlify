import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Community = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white/90 shadow-xl border-0 flex flex-col items-center py-12 px-4">
        <CardHeader>
          <CardTitle className="text-2xl text-green-800">Community</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <p className="text-gray-700 text-center mb-6">
            Welcome to the CropCare AI Community!<br />
            Here you’ll soon be able to ask questions, share results, and connect with other users and experts.
          </p>
          <div className="text-gray-500 text-sm mb-8">Community features coming soon...</div>
          <Button onClick={() => navigate("/")} className="w-full">Back to Home</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Community; 