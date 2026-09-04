import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, ImagePlus, MapPin, Clock, X, Brain, AlertTriangle,
  Upload, SwitchCamera, ZoomIn, FlipHorizontal
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { Report, User } from '../App';
import { getT } from './translations';
import { analyzeImage, AIAnalysisResult } from '../utils/aiClassification';
import { VoiceRecorder } from './VoiceRecorder';

interface ReportScreenProps {
  user: User;
  onSubmit: (
    report: Omit<Report, 'id' | 'timestamp' | 'upvotes' | 'comments' | 'distance' | 'hasUserUpvoted'>
  ) => void;
  onCancel: () => void;
}

// ── In-app camera modal ───────────────────────────────────────────────────────
interface CameraModalProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

function CameraModal({ onCapture, onClose }: CameraModalProps) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [error, setError]           = useState('');
  const [flash, setFlash]           = useState(false);
  const [ready, setReady]           = useState(false);

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    // Stop any existing stream first
    streamRef.current?.getTracks().forEach(t => t.stop());
    setReady(false);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch {
      setError('Camera access denied or not available. Please allow camera permission.');
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, [facingMode]);

  const handleCapture = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Flash effect
    setFlash(true);
    setTimeout(() => setFlash(false), 180);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    // Stop stream then return image
    streamRef.current?.getTracks().forEach(t => t.stop());
    onCapture(dataUrl);
  };

  const switchCamera = () => {
    setFacingMode(m => m === 'environment' ? 'user' : 'environment');
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black z-[99999] flex flex-col"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 absolute top-0 left-0 right-0 z-10">
        <button onClick={onClose} className="text-white p-2 rounded-full hover:bg-white/20">
          <X className="w-5 h-5" />
        </button>
        <span className="text-white text-sm font-medium">Take Photo</span>
        <button onClick={switchCamera} className="text-white p-2 rounded-full hover:bg-white/20">
          <SwitchCamera className="w-5 h-5" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <Camera className="w-16 h-16 text-gray-500" />
            <p className="text-gray-300 text-sm">{error}</p>
            <Button variant="outline" className="text-white border-white" onClick={() => startCamera(facingMode)}>
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            {/* Flash overlay */}
            {flash && <div className="absolute inset-0 bg-white animate-ping" />}
            {/* Corner guides */}
            {ready && (
              <>
                <div className="absolute top-16 left-6 w-8 h-8 border-t-2 border-l-2 border-white/70 rounded-tl" />
                <div className="absolute top-16 right-6 w-8 h-8 border-t-2 border-r-2 border-white/70 rounded-tr" />
                <div className="absolute bottom-24 left-6 w-8 h-8 border-b-2 border-l-2 border-white/70 rounded-bl" />
                <div className="absolute bottom-24 right-6 w-8 h-8 border-b-2 border-r-2 border-white/70 rounded-br" />
              </>
            )}
          </>
        )}
        {/* Hidden canvas for snapshot */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Shutter bar */}
      <div className="bg-black/80 py-6 flex items-center justify-center gap-8">
        {/* Gallery shortcut */}
        <div className="w-12 h-12" /> {/* spacer */}

        {/* Shutter button */}
        <motion.button
          disabled={!ready || !!error}
          onClick={handleCapture}
          className="w-18 h-18 rounded-full border-4 border-white bg-white/20 flex items-center justify-center disabled:opacity-40"
          style={{ width: 72, height: 72 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-14 h-14 rounded-full bg-white" />
        </motion.button>

        {/* Camera flip */}
        <button onClick={switchCamera} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
          <FlipHorizontal className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Main ReportScreen ─────────────────────────────────────────────────────────
export function ReportScreen({ user, onSubmit, onCancel }: ReportScreenProps) {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [showCamera, setShowCamera]     = useState(false);
  const [issueType, setIssueType]       = useState<string>('');
  const [severity, setSeverity]         = useState<number[]>([5]);
  const [description, setDescription]   = useState<string>('');
  const [street, setStreet]             = useState('');
  const [aiAnalysis, setAiAnalysis]     = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const t               = getT(user.language);

  // ── AI triggers when image + description ready ────────────────────────────
  useEffect(() => {
    if (!imagePreview || description.length < 4) return;
    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      const analysis = analyzeImage(imagePreview, description, {
        district: user.district,
        ward: `Ward ${Math.floor(Math.random() * 20) + 1}`,
        coordinates: user.coordinates,
      });
      setAiAnalysis(analysis);
      setIssueType(analysis.primaryIssue.toLowerCase());
      setSeverity([analysis.severity]);
      setIsAnalyzing(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [imagePreview, description]);

  // ── Image from gallery ────────────────────────────────────────────────────
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setImageFile(file);
    setImagePreview(prev => {
      if (prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setAiAnalysis(null);
    e.target.value = '';
  };

  // ── Image from in-app camera ──────────────────────────────────────────────
  const handleCameraCapture = (dataUrl: string) => {
    setShowCamera(false);
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(dataUrl);
    setImageFile(null);
    setAiAnalysis(null);
  };

  const handleRemoveImage = () => {
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview('');
    setImageFile(null);
    setAiAnalysis(null);
  };

  // ── Voice transcript ──────────────────────────────────────────────────────
  const handleVoiceComplete = (audioUrl: string, transcript: string) => {
    if (transcript.trim()) {
      setDescription(prev =>
        prev.trim() ? `${prev.trim()} ${transcript.trim()}` : transcript.trim()
      );
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview || !issueType) return;

    const selectedType = [
      { value: 'road',        aiTag: 'Road Issue'    },
      { value: 'garbage',     aiTag: 'Garbage'       },
      { value: 'water',       aiTag: 'Water Issue'   },
      { value: 'streetlight', aiTag: 'Streetlight'   },
      { value: 'drainage',    aiTag: 'Drainage'      },
      { value: 'other',       aiTag: 'Other'         },
    ].find(t => t.value === issueType);

    onSubmit({
      title: aiAnalysis?.primaryIssue
        ? `${aiAnalysis.primaryIssue} — ${user.district}`
        : `${selectedType?.aiTag} reported in ${user.district}`,
      description: description.trim() || `${selectedType?.aiTag} issue reported via NagarSetu`,
      imageUrl: imagePreview,
      media: [{ id: `m_${Date.now()}`, type: 'image', url: imagePreview }],
      district: user.district,
      ward: `Ward ${Math.floor(Math.random() * 20) + 1} — ${user.district}`,
      street: street.trim() || 'Current Location',
      coordinates: {
        lat: user.coordinates.lat + (Math.random() - 0.5) * 0.01,
        lng: user.coordinates.lng + (Math.random() - 0.5) * 0.01,
      },
      aiTag:        aiAnalysis?.primaryIssue     || selectedType?.aiTag || 'Unknown',
      aiConfidence: aiAnalysis?.confidence       || Math.floor(Math.random() * 15) + 82,
      status:       'pending',
      severity:     aiAnalysis?.severity         || severity[0],
      type:         issueType,
      userId:       user.id || user.email        || 'guest',
      priority: (aiAnalysis?.priority === 'critical' ? 'high' : aiAnalysis?.priority)
        || (severity[0] >= 7 ? 'high' : severity[0] >= 4 ? 'medium' : 'low'),
    });
  };

  const now        = new Date();
  const dateStr    = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr    = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const canSubmit  = !!imagePreview && !!issueType;

  return (
    <>
      {/* Hidden file input for gallery */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGalleryChange}
      />

      {/* In-app camera modal */}
      <AnimatePresence>
        {showCamera && (
          <CameraModal onCapture={handleCameraCapture} onClose={() => setShowCamera(false)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />{t.cancel}
            </Button>
            <h1 className="text-lg font-semibold text-primary">{t.report}</h1>
            <div className="w-16" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-10">

          {/* ── Photo section ────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Photo <span className="text-red-500">*</span>
            </label>

            {!imagePreview ? (
              <div className="grid grid-cols-2 gap-3">
                {/* Camera */}
                <motion.button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl flex flex-col items-center justify-center gap-2 hover:from-primary/20 transition-all"
                  whileTap={{ scale: 0.97 }}
                >
                  <Camera className="w-8 h-8 text-primary" />
                  <span className="text-xs font-medium text-primary">Open Camera</span>
                </motion.button>

                {/* Gallery */}
                <motion.button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-100 hover:border-gray-400 transition-all"
                  whileTap={{ scale: 0.97 }}
                >
                  <ImagePlus className="w-8 h-8 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">Choose Gallery</span>
                </motion.button>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="w-full aspect-video object-cover"
                />
                {/* overlay action buttons */}
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="bg-black/60 text-white text-xs px-2.5 py-1.5 rounded-lg backdrop-blur flex items-center gap-1 hover:bg-black/80"
                  >
                    <Camera className="w-3 h-3" /> Retake
                  </button>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="bg-black/60 text-white text-xs px-2.5 py-1.5 rounded-lg backdrop-blur flex items-center gap-1 hover:bg-black/80"
                  >
                    <Upload className="w-3 h-3" /> Change
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="bg-red-500/80 text-white p-1.5 rounded-lg backdrop-blur hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {imageFile && (
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg backdrop-blur max-w-[70%] truncate">
                    {imageFile.name}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── AI Analysis ──────────────────────────────────────────────── */}
          {(isAnalyzing || aiAnalysis) && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">AI Analysis</span>
                {isAnalyzing && <span className="text-xs text-blue-500 animate-pulse">Processing…</span>}
              </div>
              {isAnalyzing ? (
                <div className="space-y-2">
                  {[75, 55, 65].map((w, i) => (
                    <div key={i} className="animate-pulse bg-blue-200 h-3 rounded" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : aiAnalysis && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs ${
                      aiAnalysis.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      aiAnalysis.priority === 'high'     ? 'bg-orange-100 text-orange-800' :
                      aiAnalysis.priority === 'medium'   ? 'bg-yellow-100 text-yellow-800' :
                                                           'bg-green-100 text-green-800'
                    }`}>{aiAnalysis.priority.toUpperCase()} PRIORITY</Badge>
                    <span className="text-xs text-gray-500">{aiAnalysis.confidence}% confidence</span>
                  </div>
                  <div className="text-xs space-y-0.5 text-gray-700">
                    <p><span className="font-medium">Detected:</span> {aiAnalysis.primaryIssue}</p>
                    <p><span className="font-medium">Department:</span> {aiAnalysis.suggestedDepartment}</p>
                    <p><span className="font-medium">Est. resolution:</span> {aiAnalysis.estimatedResolutionTime}</p>
                  </div>
                  {aiAnalysis.riskFactors.length > 0 && (
                    <div className="flex items-start gap-1.5 text-xs text-orange-700">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{aiAnalysis.riskFactors.join(' · ')}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {aiAnalysis.keywords.map((k, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{k}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Location & time ───────────────────────────────────────────── */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="font-medium">{user.district}</span>
              <span className="text-gray-400">
                {user.coordinates.lat.toFixed(4)}, {user.coordinates.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span>{dateStr} at {timeStr}</span>
            </div>
            <input
              type="text"
              placeholder="Street / landmark (optional)"
              value={street}
              onChange={e => setStreet(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* ── Issue type ────────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Issue Type <span className="text-red-500">*</span>
            </label>
            <Select value={issueType} onValueChange={setIssueType}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="road">Road / Pothole</SelectItem>
                <SelectItem value="garbage">Garbage / Waste</SelectItem>
                <SelectItem value="water">Water Supply</SelectItem>
                <SelectItem value="streetlight">Street Light</SelectItem>
                <SelectItem value="drainage">Drainage / Flooding</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── Severity ─────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Severity</label>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                severity[0] >= 8 ? 'bg-red-100 text-red-700' :
                severity[0] >= 5 ? 'bg-yellow-100 text-yellow-700' :
                                   'bg-green-100 text-green-700'
              }`}>{severity[0]}/10</span>
            </div>
            <Slider value={severity} onValueChange={setSeverity} min={1} max={10} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Minor</span><span>Moderate</span><span>Critical</span>
            </div>
          </div>

          {/* ── Description ───────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Description</label>
              {!aiAnalysis && imagePreview && (
                <span className="text-xs text-blue-500">Add text for AI analysis</span>
              )}
            </div>
            <Textarea
              placeholder="Describe the issue… (voice transcript appears here automatically)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
            {description.trim().length > 0 && (
              <p className="text-xs text-gray-400 mt-1 text-right">{description.trim().length} chars</p>
            )}
          </div>

          {/* ── Voice note ────────────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Voice Note
              <span className="text-xs font-normal text-gray-400 ml-1">(transcript fills description)</span>
            </label>
            <VoiceRecorder onRecordingComplete={handleVoiceComplete} language={user.language} />
          </div>

          {/* ── Submit ────────────────────────────────────────────────────── */}
          <div className="pt-2">
            {!canSubmit && (
              <p className="text-xs text-center text-muted-foreground mb-2">
                {!imagePreview ? 'Add a photo to continue' : 'Select an issue type to continue'}
              </p>
            )}
            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={!canSubmit}>
              {user.isOnline ? '📤 Submit Report' : '💾 Save Offline'}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
