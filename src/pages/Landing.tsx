import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const Landing: React.FC = () => {
  const [fadeIn, setFadeIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFadeIn(true);
    const timer = setTimeout(() => {
      navigate("/signin");
    }, 30000); // 30 seconds
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Card className="w-full max-w-md bg-white/90 shadow-xl border-0 flex flex-col items-center py-16 px-4">
        <CardContent className="flex flex-col items-center justify-center p-0">
          <div className="flex flex-col items-center justify-center" style={{ width: 240, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="/CropCareAIlogo%20.png"
              alt="CropCare AI Logo"
              style={{
                opacity: fadeIn ? 1 : 0,
                transition: "opacity 2s cubic-bezier(0.4, 0, 0.2, 1)",
                width: 200,
                height: 'auto',
                maxHeight: 200,
                objectFit: 'contain',
                display: "block"
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Landing; 