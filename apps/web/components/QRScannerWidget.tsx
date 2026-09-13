"use client";

/**
 * QRScannerWidget — v2 restyle (design.md §5.6, content.md §4.1).
 * Icon-first monochrome scanner: no emoji, localized labels,
 * 56px+ targets, manual batch-ID fallback for damaged labels.
 * Scanning logic unchanged (html5-qrcode + jsQR image fallback).
 */

import { useEffect, useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import jsQR from "jsqr";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import AppIcon from "@/components/icons/AppIcon";

export default function QRScannerWidget() {
  const router = useRouter();
  const { t } = useLanguage();
  const [scanning, setScanning] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualId, setManualId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const handleSuccess = (decodedText: string) => {
    stopCamera();
    setScanning(false);

    let batchId = decodedText;
    if (decodedText.includes("/verify/")) {
      batchId = decodedText.split("/verify/")[1];
    } else if (decodedText.includes("/trace/")) {
      batchId = decodedText.split("/trace/")[1];
    }

    router.push(`/verify/${batchId}`);
  };

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const id = manualId.trim();
    if (!id) return;
    router.push(`/verify/${encodeURIComponent(id)}`);
  };

  const startCamera = async () => {
    setErrorMsg("");
    setCameraActive(true);

    // Suppress console.error from third-party library (html5-qrcode) when camera permission is denied/dismissed
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
      try {
        await scannerRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleSuccess,
          () => {} // ignore stream errors
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
            { fps: 10, qrbox: { width: 250, height: 250 } },
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
        setManualOpen(true);
      } else if (isNotFound) {
        setErrorMsg(t("scan.cameraNotFound"));
        setManualOpen(true);
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
        URL.revokeObjectURL(objectUrl);
      };

      img.onerror = () => {
        setErrorMsg(t("scan.notFound"));
        URL.revokeObjectURL(objectUrl);
      };

      img.src = objectUrl;
    } catch (err) {
      console.error(err);
      setErrorMsg(t("scan.notFound"));
    }

    e.target.value = "";
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

  /* ── Entry: single primary 64px button (design.md §5.1) ── */
  if (!scanning) {
    return (
      <button
        onClick={() => setScanning(true)}
        className="btn-primary w-full"
        aria-label={t("land.cta.scan")}
      >
        <AppIcon name="scan" size={24} ariaLabel="" />
        {t("land.cta.scan")}
      </button>
    );
  }

  /* ── Open scanner panel ── */
  return (
    <div className="card w-full mt-4 overflow-hidden p-0">
      <div className="space-y-4 p-4">
        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-3 p-3.5 text-[15px] font-medium"
            style={{
              border: "1px solid var(--danger)",
              borderRadius: "var(--radius-md)",
              color: "var(--danger)",
              background: "var(--paper)",
            }}
          >
            <div className="shrink-0 mt-0.5">
              <AppIcon name="warn" size={20} ariaLabel="" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="leading-snug">{errorMsg}</p>
              {!cameraActive && (
                <button
                  type="button"
                  onClick={startCamera}
                  className="btn-secondary text-[13px] py-1.5 px-3 inline-flex items-center gap-1.5"
                  style={{ minHeight: "36px" }}
                >
                  <AppIcon name="refresh" size={16} ariaLabel="" />
                  {t("scan.cameraRetry")}
                </button>
              )}
            </div>
          </div>
        )}

        <div
          id="qr-reader-custom"
          className={`w-full overflow-hidden ${cameraActive ? "block" : "hidden"}`}
          style={{ borderRadius: "var(--radius-lg)", background: "#111111" }}
        ></div>

        {!cameraActive ? (
          <>
            <button
              onClick={startCamera}
              className="btn-secondary w-full"
            >
              <AppIcon name="camera" size={24} ariaLabel="" />
              {t("scan.hint")}
            </button>

            {/* Manual batch-ID fallback (design.md §5.6) */}
            {manualOpen ? (
              <form onSubmit={submitManual} className="space-y-2">
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder={t("scan.manualPlaceholder")}
                  className="input"
                  aria-label={t("scan.manual")}
                  autoFocus
                />
                <button type="submit" className="btn-primary w-full">
                  <AppIcon name="keyboard" size={20} ariaLabel="" />
                  {t("scan.manualSubmit")}
                </button>
              </form>
            ) : (
              <button
                onClick={() => setManualOpen(true)}
                className="btn-ghost w-full"
              >
                <AppIcon name="keyboard" size={20} ariaLabel="" />
                {t("scan.manual")}
              </button>
            )}

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: "1px solid var(--line)" }} />
              </div>
              <div className="relative flex justify-center">
                <span
                  className="px-2 text-[14px] font-semibold"
                  style={{ background: "var(--paper)", color: "var(--ink-mute)" }}
                >
                  {t("scan.manual")}
                </span>
              </div>
            </div>

            <label
              className="flex w-full cursor-pointer flex-col items-center justify-center gap-1 py-4"
              style={{
                border: "1px dashed var(--line-strong)",
                borderRadius: "var(--radius-md)",
                color: "var(--ink-soft)",
                minHeight: "var(--tap-comfort)",
              }}
            >
              <AppIcon name="folder" size={24} ariaLabel="" />
              <span className="text-[15px] font-semibold">{t("scan.manualSubmit")}</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </>
        ) : (
          <button
            onClick={stopCamera}
            className="btn-secondary w-full"
          >
            <AppIcon name="cross" size={20} ariaLabel="" />
            {t("action.close")}
          </button>
        )}
      </div>

      <div style={{ borderTop: "1px solid var(--line)" }} className="p-3">
        <button
          onClick={() => {
            stopCamera();
            setScanning(false);
          }}
          className="btn-ghost w-full"
        >
          {t("action.close")}
        </button>
      </div>
    </div>
  );
}
