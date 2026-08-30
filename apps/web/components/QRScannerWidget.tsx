"use client";

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import { useRouter } from "next/navigation";

export default function QRScannerWidget() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const handleSuccess = (decodedText: string) => {
    stopCamera();
    setScanning(false);
    
    let batchId = decodedText;
    if (decodedText.includes('/verify/')) {
      batchId = decodedText.split('/verify/')[1];
    } else if (decodedText.includes('/trace/')) {
      batchId = decodedText.split('/trace/')[1];
    }
    
    router.push(`/verify/${batchId}`);
  };

  const startCamera = async () => {
    setErrorMsg("");
    setCameraActive(true);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader-custom");
      }
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleSuccess,
        () => {} // ignore stream errors
      );
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Camera access denied or unavailable.");
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {}
    }
    setCameraActive(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setErrorMsg("");
    const file = e.target.files[0];
    
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });
        
        // Scale down if image is too large
        const MAX_WIDTH = 1000;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        if (context) {
          context.drawImage(img, 0, 0, width, height);
          const imageData = context.getImageData(0, 0, width, height);
          
          let code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (!code) {
            // Try with inversion for better contrast support
            code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "invertFirst",
            });
          }

          if (code) {
            handleSuccess(code.data);
          } else {
            setErrorMsg("No valid QR code found in the image. Please try another clear image.");
          }
        }
        URL.revokeObjectURL(objectUrl);
      };
      
      img.onerror = () => {
        setErrorMsg("Failed to load image. Please try a different file.");
        URL.revokeObjectURL(objectUrl);
      };
      
      img.src = objectUrl;
    } catch (err) {
      console.error(err);
      setErrorMsg("Error processing image.");
    }
    
    // reset input
    e.target.value = "";
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  if (!scanning) {
    return (
      <button
        onClick={() => setScanning(true)}
        className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 w-full"
      >
        <span>📷</span> Scan QR / Upload Image
      </button>
    );
  }

  return (
    <div className="w-full mt-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 space-y-4">
        {errorMsg && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-200 font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        <div id="qr-reader-custom" className={`w-full overflow-hidden rounded-lg bg-black ${cameraActive ? 'block' : 'hidden'}`}></div>

        {!cameraActive ? (
          <div className="space-y-4">
            <button
              onClick={startCamera}
              className="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-amber-300"
            >
              <span>📹</span> Open Camera to Scan
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400 font-semibold text-xs uppercase">OR</span>
              </div>
            </div>

            <label className="w-full cursor-pointer bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-300 hover:border-amber-400 text-gray-700 font-bold py-4 rounded-lg flex flex-col items-center justify-center gap-1 transition-all">
              <span className="text-xl">📁</span>
              <span>Upload QR Image</span>
              <span className="text-[10px] text-gray-400 font-normal">JPG, PNG supported</span>
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </label>
          </div>
        ) : (
          <button
            onClick={stopCamera}
            className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 rounded-lg flex items-center justify-center gap-2 border border-red-200 transition-colors"
          >
            Stop Camera
          </button>
        )}
      </div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => {
            stopCamera();
            setScanning(false);
          }}
          className="w-full px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
