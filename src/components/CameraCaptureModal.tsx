import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle, Sparkles, SwitchCamera, Upload } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string, fileName: string) => void;
  title?: string;
  guideType?: 'document' | 'property' | 'general';
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Kamera Pengambilan Foto',
  guideType = 'document',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);

  // Stop camera stream safely
  const stopCameraStream = (mediaStream?: MediaStream | null) => {
    const s = mediaStream || stream;
    if (s) {
      s.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
    }
  };

  // Start device camera automatically when modal opens
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    setErrorMsg(null);
    setCapturedImage(null);
    setIsCapturing(true);

    // Check mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Peramban web ini tidak mendukung akses kamera langsung (getUserMedia). Silakan gunakan tombol unggah atau pilih file.');
      setIsCapturing(false);
      return;
    }

    try {
      // Check available devices for switch camera button
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      } catch {
        // ignore device listing error
      }

      // Stop previous stream if any
      stopCameraStream();

      let newStream: MediaStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        // Fallback for laptops / desktop webcams that don't support facingMode constraint
        newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
        };
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setErrorMsg('Izin akses kamera ditolak oleh peramban. Harap izinkan akses kamera di pengaturan browser Anda, atau gunakan opsi pilih file.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setErrorMsg('Perangkat kamera tidak ditemukan pada laptop/HP ini. Anda dapat mengunggah berkas foto secara manual.');
      } else {
        setErrorMsg(`Tidak dapat mengakses kamera: ${error.message || 'Kendala izin perangkat'}. Silakan gunakan kamera bawaan HP / file.`);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCameraStream();
      setCapturedImage(null);
      setErrorMsg(null);
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen]);

  // Switch between front and rear cameras (useful on smartphones)
  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Trigger snapshot capture
  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trigger visual flash shutter animation
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    // If using user-facing camera (selfie/laptop), flip horizontally for natural mirror look
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);

    // Stop video tracks while previewing photo
    stopCameraStream();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  // Confirm photo
  const handleConfirmPhoto = () => {
    if (!capturedImage) return;
    const timeStamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const fileName = `Kamera_Aetra_${timeStamp}.jpg`;
    onCapture(capturedImage, fileName);
    stopCameraStream();
    onClose();
  };

  // Native input fallback handler
  const handleNativeFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onCapture(dataUrl, file.name);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="bg-slate-800/90 px-4 py-3 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#005DAA] flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white">{title}</h4>
              <p className="text-[10px] text-slate-400">Kamera otomatis aktif (Mendukung Laptop &amp; HP)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative bg-black flex items-center justify-center min-h-[340px] sm:min-h-[420px] overflow-hidden">
          {/* Flash Effect on capture */}
          {flashEffect && (
            <div className="absolute inset-0 bg-white z-30 opacity-80 animate-out fade-out duration-200 pointer-events-none" />
          )}

          {/* Captured Image Preview State */}
          {capturedImage ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
              <img
                src={capturedImage}
                alt="Hasil Jepretan Kamera"
                className="max-h-[380px] w-auto object-contain rounded-xl border border-slate-700 shadow-lg"
              />
              <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-xs text-white px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Pratinjau Hasil Foto</span>
              </div>
            </div>
          ) : errorMsg ? (
            /* Error / Permission Fallback State */
            <div className="p-6 text-center max-w-md space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-sm text-red-400">Kamera Tidak Dapat Dibuka</h5>
                <p className="text-xs text-slate-300 leading-relaxed">{errorMsg}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 justify-center">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Coba Akses Lagi
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold border border-slate-700 transition text-slate-200"
                >
                  <Upload className="w-3.5 h-3.5 text-[#F37021]" />
                  Buka Kamera HP / Galeri
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Stream View */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover max-h-[460px] ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Guide Overlay for Documents or Property */}
              {guideType === 'document' ? (
                <div className="absolute inset-x-8 inset-y-10 sm:inset-x-12 sm:inset-y-12 border-2 border-dashed border-white/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                  <div className="flex justify-between text-[10px] font-mono text-white/80 bg-black/40 px-2 py-0.5 rounded backdrop-blur-2xs self-center">
                    Posisikan KTP / KK / Berkas Pas di Dalam Kotak
                  </div>
                  <div className="flex justify-between text-[10px] text-white/70">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-white" />
                    <span className="w-4 h-4 border-b-2 border-r-2 border-white" />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-6 border border-white/40 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] font-medium text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-2xs">
                    Arahkan ke Objek / Lokasi Pemasangan
                  </span>
                </div>
              )}

              {/* Quick Switch Camera Button (Mobile/Multi-Cam) */}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 backdrop-blur-xs text-white p-2 rounded-full border border-white/20 transition shadow-md"
                  title="Ganti Kamera Depan / Belakang"
                >
                  <SwitchCamera className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          )}

          {/* Hidden Canvas & Native File Input */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleNativeFileFallback}
            className="hidden"
          />
        </div>

        {/* Bottom Control Bar */}
        <div className="bg-slate-850 p-4 border-t border-slate-800 flex items-center justify-between gap-3">
          {capturedImage ? (
            /* Action Buttons after snapshot taken */
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Ulangi Foto
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#005DAA] hover:bg-[#004A88] text-white text-xs font-bold shadow-md shadow-blue-500/30 transition"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Gunakan Foto Ini
              </button>
            </div>
          ) : !errorMsg ? (
            /* Capture Controls */
            <div className="flex items-center justify-between w-full">
              <div className="text-[11px] text-slate-400">
                {facingMode === 'environment' ? 'Kamera Belakang (Environment)' : 'Kamera Depan (User)'}
              </div>

              {/* Big Shutter Button */}
              <button
                type="button"
                disabled={isCapturing}
                onClick={handleTakeSnapshot}
                className="relative group p-1 rounded-full bg-white/20 hover:bg-white/30 transition active:scale-95 disabled:opacity-50"
                title="Ambil Foto Sekarang"
              >
                <div className="w-14 h-14 rounded-full bg-white group-hover:bg-slate-100 flex items-center justify-center shadow-lg border-4 border-slate-900">
                  <Camera className="w-6 h-6 text-slate-900" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Pilih Dari File
              </button>
            </div>
          ) : (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
