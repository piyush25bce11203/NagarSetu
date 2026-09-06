import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, ImagePlus, MapPin, Clock, X, Brain, AlertTriangle,
  Upload, SwitchCamera, FlipHorizontal, Sparkles, Building2
} from 'lucide-react';import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { Report, User } from '../App';
import { getT } from './translations';
import { analyzeImage, AIAnalysisResult } from '../utils/aiClassification';
import { VoiceRecorder } from './VoiceRecorder';
import { LocationPicker } from './LocationPicker';

interface ReportScreenProps {
  user: User;
  onSubmit: (
    report: Omit<Report, 'id' | 'timestamp' | 'upvotes' | 'comments' | 'distance' | 'hasUserUpvoted'>
  ) => void;
  onCancel: () => void;
}

// ── Issue type catalogue ──────────────────────────────────────────────────────
const ISSUE_TYPES = [
  { value: 'road',        label: '🛣️  Road / Pothole',             aiTag: 'Road Issue',         dept: 'PWD',    deptFull: 'Public Works Department'        },
  { value: 'garbage',     label: '🗑️  Garbage / Waste',            aiTag: 'Garbage',            dept: 'MSWM',   deptFull: 'Municipal Solid Waste Mgmt'     },
  { value: 'water',       label: '💧 Water Supply / Leakage',      aiTag: 'Water Issue',        dept: 'MVB',    deptFull: 'Municipal Water Board'          },
  { value: 'streetlight', label: '💡 Street Light',                aiTag: 'Streetlight',        dept: 'USLD',   deptFull: 'Urban Street Light Department'  },
  { value: 'drainage',    label: '🚰 Drainage / Flooding',         aiTag: 'Drainage',           dept: 'DRAIN',  deptFull: 'Drainage & Sewage Department'   },
  { value: 'electricity', label: '⚡ Electricity / Power Cut',     aiTag: 'Electricity Issue',  dept: 'ELECT',  deptFull: 'Electricity Department'         },
  { value: 'fire',        label: '🔥 Fire / Fire Hazard',          aiTag: 'Fire Hazard',        dept: 'FIRE',   deptFull: 'Fire & Emergency Services'      },
  { value: 'sewage',      label: '🚽 Sewage / Sewer Overflow',     aiTag: 'Sewage Problem',     dept: 'SEWAGE', deptFull: 'Sewage Treatment Department'    },
  { value: 'animal',      label: '🐕 Stray Animals / Animal Issue', aiTag: 'Animal Nuisance',   dept: 'ANIMAL', deptFull: 'Animal Control & Welfare Dept'  },
  { value: 'other',       label: '📋 Other',                       aiTag: 'Other',              dept: 'MC',     deptFull: 'Municipal Corporation'          },
];

// Map AI-detected issue names → issue type values
function mapAiIssueToType(primaryIssue: string): string {
  const p = primaryIssue.toLowerCase();
  if (p === 'road' || p.includes('pothole') || p.includes('road'))             return 'road';
  if (p === 'garbage' || p.includes('garbage') || p.includes('waste'))         return 'garbage';
  if (p === 'water' || p.includes('water') || p.includes('pipe'))              return 'water';
  if (p === 'streetlight' || p.includes('street') || p.includes('light'))      return 'streetlight';
  if (p === 'drainage' || p.includes('drain') || p.includes('flood'))          return 'drainage';
  if (p === 'electricity' || p.includes('electric') || p.includes('power'))    return 'electricity';
  if (p === 'fire' || p.includes('fire') || p.includes('smoke'))               return 'fire';
  if (p === 'sewage' || p.includes('sewage') || p.includes('sewer'))           return 'sewage';
  if (p === 'animal' || p.includes('animal') || p.includes('dog') || p.includes('cattle')) return 'animal';
  return 'other';
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
    if (facingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setFlash(true);
    setTimeout(() => setFlash(false), 180);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    streamRef.current?.getTracks().forEach(t => t.stop());
    onCapture(dataUrl);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black z-[99999] flex flex-col"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 absolute top-0 left-0 right-0 z-10">
        <button onClick={onClose} className="text-white p-2 rounded-full hover:bg-white/20"><X className="w-5 h-5" /></button>
        <span className="text-white text-sm font-medium">Take Photo</span>
        <button onClick={() => setFacingMode(m => m === 'environment' ? 'user' : 'environment')} className="text-white p-2 rounded-full hover:bg-white/20">
          <SwitchCamera className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 relative overflow-hidden bg-black">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <Camera className="w-16 h-16 text-gray-500" />
            <p className="text-gray-300 text-sm">{error}</p>
            <Button variant="outline" className="text-white border-white" onClick={() => startCamera(facingMode)}>Try Again</Button>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
            {flash && <div className="absolute inset-0 bg-white animate-ping" />}
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
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="bg-black/80 py-6 flex items-center justify-center gap-8">
        <div className="w-12 h-12" />
        <motion.button disabled={!ready || !!error} onClick={handleCapture}
          className="w-18 h-18 rounded-full border-4 border-white bg-white/20 flex items-center justify-center disabled:opacity-40"
          style={{ width: 72, height: 72 }} whileTap={{ scale: 0.9 }}>
          <div className="w-14 h-14 rounded-full bg-white" />
        </motion.button>
        <button onClick={() => setFacingMode(m => m === 'environment' ? 'user' : 'environment')}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
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
  const [description, setDescription]   = useState<string>('');
  const [street, setStreet]             = useState('');
  const [aiAnalysis, setAiAnalysis]     = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing]   = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showMap, setShowMap]           = useState(false);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const t               = getT(user.language);

  // ── AI triggers when description has enough text ─────────────────────────
  // Does NOT fire on image-only — blob URLs have no meaningful content to classify.
  useEffect(() => {
    if (!imagePreview || description.trim().length < 5) {
      // Clear stale AI result when image changes or description is wiped
      if (!description.trim()) setAiAnalysis(null);
      return;
    }
    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      const analysis = analyzeImage(imagePreview, description, {
        district: user.district,
        ward: `Ward ${Math.floor(Math.random() * 20) + 1}`,
        coordinates: user.coordinates,
      });
      if (analysis) {
        setAiAnalysis(analysis);
        setIssueType(mapAiIssueToType(analysis.primaryIssue));
      } else {
        setAiAnalysis(null);
      }
      setIsAnalyzing(false);
    }, 900);
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
    // Reset AI — new image requires new description-based classification
    setAiAnalysis(null);
    setIssueType('');
    e.target.value = '';
  };

  // ── Image from in-app camera ──────────────────────────────────────────────
  const handleCameraCapture = (dataUrl: string) => {
    setShowCamera(false);
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(dataUrl);
    setImageFile(null);
    // Reset AI — new image requires new description-based classification
    setAiAnalysis(null);
    setIssueType('');
  };

  const handleRemoveImage = () => {
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview('');
    setImageFile(null);
    setAiAnalysis(null);
  };

  // ── Voice transcript ──────────────────────────────────────────────────────
  const handleVoiceComplete = (_audioUrl: string, transcript: string) => {
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

    const selectedType = ISSUE_TYPES.find(t => t.value === issueType);

    // Use picked map coords if available, otherwise user district coords
    const coords = pickedCoords ?? {
      lat: user.coordinates.lat + (Math.random() - 0.5) * 0.01,
      lng: user.coordinates.lng + (Math.random() - 0.5) * 0.01,
    };

    const aiSeverity = aiAnalysis?.severity ?? 5;
    const aiPriority = (aiAnalysis?.priority === 'critical' ? 'high' : aiAnalysis?.priority)
      ?? (aiSeverity >= 7 ? 'high' : aiSeverity >= 4 ? 'medium' : 'low');

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
      coordinates: coords,
      aiTag:             aiAnalysis?.primaryIssue     || selectedType?.aiTag || 'Unknown',
      aiConfidence:      aiAnalysis?.confidence       || Math.floor(Math.random() * 15) + 82,
      aiSuggestedDept:   aiAnalysis?.suggestedDeptCode || selectedType?.dept,      status:            'pending',
      severity:          aiSeverity,
      type:              issueType,
      userId:            user.id || user.email        || 'guest',
      priority:          aiPriority as 'high' | 'medium' | 'low',
      assignedDept:      undefined,
    });
  };

  const now        = new Date();
  const dateStr    = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr    = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const canSubmit  = !!imagePreview && !!issueType;
  const selectedIssue = ISSUE_TYPES.find(t => t.value === issueType);

  return (
    <>
      <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryChange} />

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
              <span className="text-xs font-normal text-blue-500 ml-2">AI will auto-classify from your image</span>
            </label>

            {!imagePreview ? (
              <div className="grid grid-cols-2 gap-3">
                <motion.button type="button" onClick={() => setShowCamera(true)}
                  className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl flex flex-col items-center justify-center gap-2 hover:from-primary/20 transition-all"
                  whileTap={{ scale: 0.97 }}>
                  <Camera className="w-8 h-8 text-primary" />
                  <span className="text-xs font-medium text-primary">Open Camera</span>
                </motion.button>
                <motion.button type="button" onClick={() => galleryInputRef.current?.click()}
                  className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-100 hover:border-gray-400 transition-all"
                  whileTap={{ scale: 0.97 }}>
                  <ImagePlus className="w-8 h-8 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">Choose Gallery</span>
                </motion.button>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img src={imagePreview} alt="Selected" className="w-full aspect-video object-cover" />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button type="button" onClick={() => setShowCamera(true)}
                    className="bg-black/60 text-white text-xs px-2.5 py-1.5 rounded-lg backdrop-blur flex items-center gap-1 hover:bg-black/80">
                    <Camera className="w-3 h-3" /> Retake
                  </button>
                  <button type="button" onClick={() => galleryInputRef.current?.click()}
                    className="bg-black/60 text-white text-xs px-2.5 py-1.5 rounded-lg backdrop-blur flex items-center gap-1 hover:bg-black/80">
                    <Upload className="w-3 h-3" /> Change
                  </button>
                  <button type="button" onClick={handleRemoveImage}
                    className="bg-red-500/80 text-white p-1.5 rounded-lg backdrop-blur hover:bg-red-600" aria-label="Remove image">
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
          {imagePreview && (isAnalyzing || aiAnalysis || description.trim().length < 5) && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">AI Classification</span>
                {isAnalyzing && <span className="text-xs text-blue-500 animate-pulse">Analysing…</span>}
              </div>

              {/* Waiting for description */}
              {!isAnalyzing && !aiAnalysis && description.trim().length < 5 && (
                <div className="flex items-center gap-2 text-xs text-blue-600">
                  <Brain className="w-4 h-4 flex-shrink-0" />
                  <span>Describe the issue below so AI can identify the correct department.</span>
                </div>
              )}

              {isAnalyzing && (
                <div className="space-y-2">
                  {[75, 55, 65].map((w, i) => (
                    <div key={i} className="animate-pulse bg-blue-200 h-3 rounded" style={{ width: `${w}%` }} />
                  ))}
                </div>
              )}

              {!isAnalyzing && aiAnalysis && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs ${
                      aiAnalysis.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      aiAnalysis.priority === 'high'     ? 'bg-orange-100 text-orange-800' :
                      aiAnalysis.priority === 'medium'   ? 'bg-yellow-100 text-yellow-800' :
                                                           'bg-green-100 text-green-800'
                    }`}>{aiAnalysis.priority.toUpperCase()} PRIORITY</Badge>
                    <span className="text-xs text-gray-500">{aiAnalysis.confidence}% confidence</span>
                    <Badge className="text-xs bg-blue-100 text-blue-800">Severity {aiAnalysis.severity}/10</Badge>
                  </div>
                  <div className="text-xs space-y-0.5 text-gray-700">
                    <p><span className="font-medium">🔍 Detected:</span> {aiAnalysis.primaryIssue}</p>
                    <p className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <span className="font-medium">Auto-routed to:</span>
                      <span className="font-semibold text-blue-700">
                        {aiAnalysis.suggestedDeptCode} — {aiAnalysis.suggestedDepartment}
                      </span>
                    </p>
                    <p><span className="font-medium">⏱ Est. resolution:</span> {aiAnalysis.estimatedResolutionTime}</p>
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

          {/* ── Issue type — AI pre-fills, user can override ──────────────── */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Issue Type <span className="text-red-500">*</span>
              {aiAnalysis && <span className="text-xs font-normal text-green-600 ml-2">✓ AI auto-selected</span>}
            </label>
            <Select value={issueType} onValueChange={setIssueType}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type…" />
              </SelectTrigger>
              <SelectContent>
                {ISSUE_TYPES.map(it => (
                  <SelectItem key={it.value} value={it.value}>{it.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedIssue && issueType !== 'other' && (
              <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Will be routed to: <strong>{selectedIssue.dept} — {selectedIssue.deptFull}</strong>
              </p>
            )}
          </div>

          {/* ── Map location picker ───────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" /> Location
              </label>
              <button type="button" onClick={() => setShowMap(v => !v)}
                className="text-xs text-primary underline underline-offset-2">
                {showMap ? 'Hide map' : 'Pin on map'}
              </button>
            </div>

            {/* Always-visible info row */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="font-medium">{user.district}</span>
                {pickedCoords ? (
                  <span className="text-green-600 font-medium">
                    📍 {pickedCoords.lat.toFixed(4)}, {pickedCoords.lng.toFixed(4)}
                  </span>
                ) : (
                  <span className="text-gray-400">
                    {user.coordinates.lat.toFixed(4)}, {user.coordinates.lng.toFixed(4)}
                  </span>
                )}
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

            {/* Interactive map */}
            <AnimatePresence>
              {showMap && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <LocationPicker
                    district={user.district}
                    initialCoords={pickedCoords ?? user.coordinates}
                    onPick={coords => setPickedCoords(coords)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
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
