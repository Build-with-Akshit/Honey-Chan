"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";

export default function QRScannerWidget() {
  const router = useRouter();
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!scanning) return;

    // Initialize scanner with responsive config
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        // Stop scanning after success
        scanner.clear();
        setScanning(false);
        
        // Handle URL or raw Batch ID
        let batchId = decodedText;
        if (decodedText.includes('/verify/')) {
          batchId = decodedText.split('/verify/')[1];
        } else if (decodedText.includes('/trace/')) {
          batchId = decodedText.split('/trace/')[1];
        }
        
        router.push(`/verify/${batchId}`);
      },
      (error) => {
        // Ignore continuous stream errors
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [scanning, router]);

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
      {/* HTML5 QR Code injects its own UI here */}
      <div id="qr-reader" className="w-full border-none"></div>
      
      <div className="p-3 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => setScanning(false)}
          className="w-full px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Cancel Scanning
        </button>
      </div>
    </div>
  );
}
