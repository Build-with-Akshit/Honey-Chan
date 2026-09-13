"use client";

/**
 * QRScannerWidget — Redesigned HoneyChain Verification Hub.
 * Warm honey & golden amber aesthetic, multi-mode tabs:
 * 1. Live Camera with animated golden laser viewfinder & corner reticles
 * 2. Upload Image with drag-and-drop and instant jsQR decoding
 * 3. Manual Batch ID entry with clickable verified demo chips
 */

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import AppIcon from "@/components/icons/AppIcon";

export interface QRScannerWidgetProps {
  defaultOpen?: boolean;
  activeTabDefault?: "camera" | "upload" | "manual";
  showDemoBatches?: boolean;
  className?: string;
  onScanSuccess?: (batchId: string) => void;
}

export default function QRScannerWidget({
  defaultOpen = false,
  activeTabDefault = "camera",
  showDemoBatches = true,
  className = "",
  onScanSuccess,
}: QRScannerWidgetProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const [scanning, setScanning] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<"camera" | "upload" | "manual">(activeTabDefault);
  const [canFlipCamera, setCanFlipCamera] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [manualId, setManualId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Detect whether the device has multiple cameras (or is mobile)
  useEffect(() => {
    const detectCameras = async () => {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === "videoinput");
          const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

          // Only show Flip Camera if device actually has >1 camera or is a mobile device
          setCanFlipCamera(videoInputs.length > 1 || (isMobileDevice && videoInputs.length > 0));
        }
      } catch {
        const isMobileDevice = typeof navigator !== "undefined" && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        setCanFlipCamera(isMobileDevice);
      }
    };

    detectCameras();
  }, []);

  const handleSuccess = (decodedText: string) => {
    stopCamera();
    setScanning(false);

    let batchId = decodedText.trim();
    if (decodedText.includes("/verify/")) {
      batchId = decodedText.split("/verify/")[1].split("?")[0].split("#")[0];
    } else if (decodedText.includes("/trace/")) {
      batchId = decodedText.split("/trace/")[1].split("?")[0].split("#")[0];
    }

    if (onScanSuccess) {
      onScanSuccess(batchId);
    } else {
      router.push(`/verify/${encodeURIComponent(batchId)}`);
    }
  };

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const id = manualId.trim();
    if (!id) return;
    handleSuccess(id);
  };

  const startCamera = async (overrideFacing?: "environment" | "user") => {
    setErrorMsg("");
    setCameraStarting(true);
    const targetFacing = overrideFacing ?? facingMode;

    // Suppress console.error from third-party library (html5-qrcode) when camera permission is dismissed
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const message = args.map((a) => (typeof a === "object" ? a?.message || String(a) : String(a))).join(" ");
      if (
        message.includes("Error getting userMedia") ||
        message.includes("NotAllowedError") ||
        message.includes("Permission dismissed") ||
        message.includes("Permission denied") ||
        message.includes("NotFoundError") ||
        message.includes("DevicesNotFoundError")
      ) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader-custom");
      }

      setCameraActive(true);

      try {
        await scannerRef.current.start(
          { facingMode: targetFacing },
          { fps: 15 },
          handleSuccess,
          () => {} // ignore stream read misses
        );
      } catch (firstErr) {
        const firstErrStr = String(firstErr ?? "");
        const isPermission =
          firstErrStr.includes("NotAllowedError") ||
          firstErrStr.includes("Permission dismissed") ||
          firstErrStr.includes("Permission denied");

        // If not a permission rejection and device has no environment camera, fallback to default facing
        if (!isPermission && scannerRef.current) {
          await scannerRef.current.start(
            {},
            { fps: 15 },
            handleSuccess,
            () => {}
          );
        } else {
          throw firstErr;
        }
      }
    } catch (err: unknown) {
      const errStr = String(err ?? "");
      const isPermissionDenied =
        errStr.includes("NotAllowedError") ||
        errStr.includes("Permission dismissed") ||
        errStr.includes("Permission denied") ||
        (typeof err === "object" && err !== null && (err as any).name === "NotAllowedError");

      const isNotFound =
        errStr.includes("NotFoundError") ||
        errStr.includes("DevicesNotFoundError") ||
        (typeof err === "object" && err !== null && (err as any).name === "NotFoundError");

      const isNotReadable =
        errStr.includes("NotReadableError") ||
        errStr.includes("TrackStartError") ||
        (typeof err === "object" && err !== null && (err as any).name === "NotReadableError");

      if (isPermissionDenied) {
        setErrorMsg(t("scan.cameraDenied"));
      } else if (isNotFound) {
        setErrorMsg(t("scan.cameraNotFound"));
      } else if (isNotReadable) {
        setErrorMsg(t("scan.cameraInUse"));
      } else {
        setErrorMsg(t("scan.cameraError"));
        console.warn("Camera start encountered an error:", err);
      }

      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch {
          /* noop */
        }
        scannerRef.current = null;
      }
      setCameraActive(false);
    } finally {
      console.error = originalConsoleError;
      setCameraStarting(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        /* noop */
      }
      scannerRef.current = null;
    }
    setCameraActive(false);
    setCameraStarting(false);
  };

  const flipCamera = async () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    await stopCamera();
    startCamera(nextMode);
  };

  const handleTabSwitch = async (tab: "camera" | "upload" | "manual") => {
    setErrorMsg("");
    if (cameraActive) {
      await stopCamera();
    }
    setActiveTab(tab);
  };

  const processImageFile = async (file: File) => {
    setErrorMsg("");
    setIsUploading(true);

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d", { willReadFrequently: true });

          const MAX_WIDTH = 1200;
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
              code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "invertFirst",
              });
            }

            if (code) {
              handleSuccess(code.data);
            } else {
              setErrorMsg(t("scan.notFound"));
            }
          }
        } catch (scanErr) {
          console.error(scanErr);
          setErrorMsg(t("scan.notFound"));
        } finally {
          setIsUploading(false);
          URL.revokeObjectURL(objectUrl);
        }
      };

      img.onerror = () => {
        setErrorMsg(t("scan.notFound"));
        setIsUploading(false);
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;
    } catch (err) {
      console.error(err);
      setErrorMsg(t("scan.notFound"));
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
        try {
          scannerRef.current.clear();
        } catch {
          /* noop */
        }
        scannerRef.current = null;
      }
    };
  }, []);

  /* ── Collapsed trigger for compact pages ── */
  if (!scanning) {
    return (
      <button
        type="button"
        onClick={() => setScanning(true)}
        className={`btn-primary w-full shadow-md hover:shadow-lg transition-all ${className}`}
        aria-label={t("land.cta.scan")}
      >
        <AppIcon name="scan" size={22} />
        <span className="font-bold">{t("land.cta.scan")}</span>
      </button>
    );
  }

  /* ── Redesigned HoneyChain Scanner Panel ── */
  return (
    <div className={`w-full ${className}`}>
      {/* Mode Selector Tabs */}
      <div className="flex rounded-xl bg-amber-100/70 p-1 border border-amber-200/80 mb-5">
        <button
          type="button"
          onClick={() => handleTabSwitch("camera")}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "camera"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs"
              : "text-amber-900/80 hover:text-amber-950 hover:bg-amber-200/50"
          }`}
        >
          <AppIcon name="camera" size={17} />
          <span>{t("scan.tab.camera")}</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch("upload")}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "upload"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs"
              : "text-amber-900/80 hover:text-amber-950 hover:bg-amber-200/50"
          }`}
        >
          <AppIcon name="folder" size={17} />
          <span>{t("scan.tab.upload")}</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabSwitch("manual")}
          className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "manual"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs"
              : "text-amber-900/80 hover:text-amber-950 hover:bg-amber-200/50"
          }`}
        >
          <AppIcon name="keyboard" size={17} />
          <span>{t("scan.tab.manual")}</span>
        </button>
      </div>

      {/* Error alert banner */}
      {errorMsg && (
        <div
          role="alert"
          className="flex items-start gap-3 p-3.5 rounded-xl text-xs sm:text-sm font-medium border border-amber-300 bg-amber-50 text-amber-950 shadow-xs mb-4"
        >
          <div className="shrink-0 mt-0.5 text-amber-700">
            <AppIcon name="warn" size={20} />
          </div>
          <div className="flex-1 space-y-2">
            <p className="leading-snug">{errorMsg}</p>
            <div className="flex flex-wrap items-center gap-2">
              {activeTab === "camera" && !cameraActive && (
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="btn-secondary !min-h-[34px] !text-xs !py-1 !px-3 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <AppIcon name="refresh" size={14} />
                  {t("scan.cameraRetry")}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg("");
                  setActiveTab("manual");
                }}
                className="btn-outline !min-h-[34px] !text-xs !py-1 !px-3 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <AppIcon name="keyboard" size={14} />
                {t("scan.tab.manual")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Live Camera Viewfinder */}
      {activeTab === "camera" && (
        <div className="space-y-4">
          <div className="relative w-full aspect-square max-w-[340px] sm:max-w-[380px] mx-auto overflow-hidden rounded-2xl bg-[#120B05] border-2 border-amber-500/40 shadow-[0_8px_30px_rgba(217,119,6,0.18)] flex items-center justify-center">
            {/* Native html5-qrcode video element container */}
            <div
              id="qr-reader-custom"
              className={`absolute inset-0 w-full h-full overflow-hidden ${
                cameraActive ? "block z-0" : "hidden"
              }`}
            />

            {/* Standby Viewfinder Placeholder (when camera is not active) */}
            {!cameraActive && (
              <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-400/40 shadow-inner">
                  <span className="absolute inset-0 rounded-2xl border border-amber-400/30 animate-ping opacity-30" />
                  <AppIcon name="scan" size={42} className="text-amber-400" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-amber-100 mb-1">
                  {t("scan.cameraReady")}
                </h3>
                <p className="text-xs sm:text-sm text-amber-200/70 max-w-[240px] mb-5 leading-relaxed">
                  {t("scan.cameraReadySub")}
                </p>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  disabled={cameraStarting}
                  className="btn-primary !min-h-[48px] !px-6 !py-2.5 !text-sm !font-bold animate-pulse-honey inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <AppIcon name="camera" size={20} />
                  <span>{cameraStarting ? t("state.loading") : t("scan.startCamera")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabSwitch("manual")}
                  className="mt-3.5 text-xs font-semibold text-amber-300/80 hover:text-amber-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer hover:underline"
                >
                  <AppIcon name="keyboard" size={14} />
                  <span>{t("land.cta.manual")}</span>
                  <span>→</span>
                </button>
              </div>
            )}

            {/* Viewfinder Honey Gold Corner Brackets Overlay */}
            <div className="pointer-events-none absolute inset-4 z-20">
              {/* Top-Left */}
              <span className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-amber-400 rounded-tl-lg shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              {/* Top-Right */}
              <span className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-amber-400 rounded-tr-lg shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              {/* Bottom-Left */}
              <span className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-amber-400 rounded-bl-lg shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              {/* Bottom-Right */}
              <span className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-amber-400 rounded-br-lg shadow-[0_0_10px_rgba(251,191,36,0.8)]" />

              {/* Animated Golden Laser Beam */}
              {cameraActive && (
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_16px_#F59E0B] animate-scan-laser" />
              )}
            </div>

            {/* Status indicator when camera is running */}
            {cameraActive && (
              <div className="absolute top-3 left-3 right-3 z-30 flex justify-center">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-amber-300 text-xs font-semibold border border-amber-500/40 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {t("scan.scanningActive")}
                </span>
              </div>
            )}
          </div>

          {/* Camera controls bar */}
          {cameraActive && (
            <div className="flex items-center justify-center gap-3 pt-1">
              {canFlipCamera && (
                <button
                  type="button"
                  onClick={flipCamera}
                  className="btn-secondary !min-h-[42px] !py-2 !px-4 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <AppIcon name="refresh" size={16} />
                  <span>{t("scan.flipCamera")}</span>
                </button>
              )}
              <button
                type="button"
                onClick={stopCamera}
                className="btn-outline !min-h-[42px] !py-2 !px-4 text-xs font-semibold inline-flex items-center gap-1.5 !text-red-700 !border-red-300 hover:!bg-red-50 cursor-pointer"
              >
                <AppIcon name="cross" size={16} />
                <span>{t("scan.stopCamera")}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Image / QR Upload */}
      {activeTab === "upload" && (
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processImageFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
              dragOver
                ? "border-amber-500 bg-amber-100/70 scale-[1.01]"
                : "border-amber-300/90 bg-amber-50/40 hover:bg-amber-100/50 hover:border-amber-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) processImageFile(e.target.files[0]);
              }}
            />
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-200/70 text-amber-900 mb-3 shadow-xs">
              <AppIcon name="folder" size={32} />
            </div>
            <p className="text-base font-bold text-amber-950 text-center mb-1">
              {t("scan.uploadPrompt")}
            </p>
            <p className="text-xs sm:text-sm text-amber-800/80 text-center max-w-[280px] mb-3">
              {t("scan.uploadSub")}
            </p>
            <span className="text-[11px] text-amber-700/80 font-medium bg-amber-200/50 px-3 py-1 rounded-full">
              {t("scan.uploadFormats")}
            </span>

            {isUploading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-2 z-10">
                <div className="h-8 w-8 animate-spin rounded-full border-3 border-amber-600 border-t-transparent" />
                <span className="text-xs font-bold text-amber-900">{t("state.loading")}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Manual Batch ID Entry */}
      {activeTab === "manual" && (
        <div className="space-y-4">
          <form onSubmit={submitManual} className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-950/80 mb-1.5">
                {t("scan.manualTitle")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder={t("scan.manualPlaceholder")}
                  className="input !h-13 w-full font-mono text-base tracking-wide uppercase font-semibold !border-amber-300 focus:!border-amber-500 focus:!ring-2 focus:!ring-amber-400/30 !pl-4 !pr-20"
                  autoFocus
                />
                {manualId && (
                  <button
                    type="button"
                    onClick={() => setManualId("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-amber-800/60 hover:text-amber-950 cursor-pointer"
                  >
                    <AppIcon name="cross" size={16} />
                  </button>
                )}
              </div>
              <p className="text-xs text-amber-900/70 mt-1.5 leading-normal">
                {t("scan.manualDesc")}
              </p>
            </div>

            <button
              type="submit"
              disabled={!manualId.trim()}
              className="btn-primary w-full !h-12 !text-sm !font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
            >
              <AppIcon name="verify" size={20} />
              <span>{t("scan.manualSubmit")}</span>
            </button>
          </form>

          {/* Clickable Verified Sample Batches */}
          {showDemoBatches && (
            <div className="pt-3 border-t border-amber-200/70">
              <p className="text-xs font-bold text-amber-900/85 mb-2.5">
                {t("scan.demoBatches")}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setManualId("HC-2026-000127");
                    handleSuccess("HC-2026-000127");
                  }}
                  className="flex flex-col items-start p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 hover:border-amber-400 transition-all text-left cursor-pointer group shadow-xs"
                >
                  <span className="font-mono text-xs font-bold text-amber-950 group-hover:text-amber-700">
                    HC-2026-000127
                  </span>
                  <span className="text-[11px] text-amber-800/80 line-clamp-1">
                    {t("scan.demo1")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setManualId("HC-2026-963790");
                    handleSuccess("HC-2026-963790");
                  }}
                  className="flex flex-col items-start p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 hover:border-amber-400 transition-all text-left cursor-pointer group shadow-xs"
                >
                  <span className="font-mono text-xs font-bold text-amber-950 group-hover:text-amber-700">
                    HC-2026-963790
                  </span>
                  <span className="text-[11px] text-amber-800/80 line-clamp-1">
                    {t("scan.demo2")}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setManualId("HC-2026-104821");
                    handleSuccess("HC-2026-104821");
                  }}
                  className="flex flex-col items-start p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 hover:border-amber-400 transition-all text-left cursor-pointer group shadow-xs"
                >
                  <span className="font-mono text-xs font-bold text-amber-950 group-hover:text-amber-700">
                    HC-2026-104821
                  </span>
                  <span className="text-[11px] text-amber-800/80 line-clamp-1">
                    {t("scan.demo3")}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
