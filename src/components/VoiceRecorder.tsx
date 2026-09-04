import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Play, Pause, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'motion/react';

interface VoiceRecorderProps {
  /** Called whenever a recording is saved or deleted.
   *  audioUrl  — object URL of the recorded blob (empty string when deleted)
   *  transcript — speech-to-text transcript (empty string when not available)
   */
  onRecordingComplete: (audioUrl: string, transcript: string) => void;
  language: string;
}

// Map our language keys to BCP-47 tags for the Web Speech API
const LANG_MAP: Record<string, string> = {
  english:  'en-IN',
  hindi:    'hi-IN',
  bengali:  'bn-IN',
  santhali: 'en-IN',
  nagpuri:  'hi-IN',
};

export function VoiceRecorder({ onRecordingComplete, language }: VoiceRecorderProps) {
  const [status, setStatus]             = useState<'idle' | 'recording' | 'recorded' | 'error'>('idle');
  const [errorMsg, setErrorMsg]         = useState('');
  const [audioUrl, setAudioUrl]         = useState('');
  const [transcript, setTranscript]     = useState('');
  const [isPlaying, setIsPlaying]       = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);          // seconds
  const [audioLevels, setAudioLevels]   = useState<number[]>(Array(24).fill(4));

  const mediaRecorderRef  = useRef<MediaRecorder | null>(null);
  const audioChunksRef    = useRef<Blob[]>([]);
  const audioRef          = useRef<HTMLAudioElement | null>(null);
  const streamRef         = useRef<MediaStream | null>(null);
  const timerRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef       = useRef<AnalyserNode | null>(null);
  const animFrameRef      = useRef<number | null>(null);
  const recognitionRef    = useRef<any>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      cancelAnimFrame();
      streamRef.current?.getTracks().forEach(t => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      recognitionRef.current?.abort();
    };
  }, []);

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const cancelAnimFrame = () => {
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
  };

  // Animate waveform bars from AnalyserNode while recording
  const drawWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const step = Math.floor(data.length / 24);
    const bars = Array.from({ length: 24 }, (_, i) => {
      const val = data[i * step] / 255;       // 0-1
      return Math.max(4, Math.round(val * 100));
    });
    setAudioLevels(bars);
    animFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  // ── Start recording ─────────────────────────────────────────────────────────
  const handleStart = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Waveform analyser
      const ctx      = new AudioContext();
      const source   = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      // MediaRecorder
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = handleRecorderStop;
      recorder.start(100);
      mediaRecorderRef.current = recorder;

      // Timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);

      // Speech recognition (optional — gracefully skipped if unsupported)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous      = true;
        rec.interimResults  = true;
        rec.lang            = LANG_MAP[language] ?? 'en-IN';
        let finalText = '';
        rec.onresult = (ev: any) => {
          let interim = '';
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const t = ev.results[i][0].transcript;
            if (ev.results[i].isFinal) finalText += t + ' ';
            else interim = t;
          }
          setTranscript((finalText + interim).trim());
        };
        rec.onerror = () => {};   // silently ignore — microphone already captured
        rec.start();
        recognitionRef.current = rec;
      }

      setStatus('recording');
      drawWaveform();
    } catch (err) {
      setErrorMsg('Microphone access denied. Please allow microphone permission and try again.');
      setStatus('error');
    }
  };

  // ── Stop recording ──────────────────────────────────────────────────────────
  const handleStop = () => {
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    stopTimer();
    cancelAnimFrame();
    setAudioLevels(Array(24).fill(4));
  };

  // ── After MediaRecorder finishes writing chunks ─────────────────────────────
  const handleRecorderStop = () => {
    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const url  = URL.createObjectURL(blob);
    setAudioUrl(url);
    setStatus('recorded');
    // transcript is already set live by speech recognition
    onRecordingComplete(url, transcript);
  };

  // ── Playback ────────────────────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl('');
    setTranscript('');
    setIsPlaying(false);
    setRecordingTime(0);
    setStatus('idle');
    onRecordingComplete('', '');
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  };

  // ── Render: error ───────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-red-800">{errorMsg}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => setStatus('idle')}>Try again</Button>
        </div>
      </div>
    );
  }

  // ── Render: recorded ────────────────────────────────────────────────────────
  if (status === 'recorded') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Voice note saved</span>
          </div>
          <span className="text-xs text-green-600 font-mono">{formatTime(recordingTime)}</span>
        </div>

        {/* Static waveform */}
        <div className="flex items-end gap-0.5 h-8">
          {Array.from({ length: 40 }, (_, i) => (
            <div
              key={i}
              className="bg-green-400 rounded-full flex-1"
              style={{ height: `${Math.sin(i * 0.5) * 35 + 40}%`, minHeight: 2 }}
            />
          ))}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="bg-white border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-700 font-medium mb-1">Transcript:</p>
            <p className="text-sm text-gray-800 leading-relaxed">{transcript}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={handlePlayPause}>
            {isPlaying
              ? <><Pause className="w-4 h-4 mr-1.5" />Pause</>
              : <><Play  className="w-4 h-4 mr-1.5" />Play</>}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Render: recording ───────────────────────────────────────────────────────
  if (status === 'recording') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </motion.div>
            <span className="text-sm font-medium text-red-800">Recording…</span>
          </div>
          <span className="text-xs text-red-600 font-mono">{formatTime(recordingTime)}</span>
        </div>

        {/* Live waveform */}
        <div className="flex items-end gap-0.5 h-8">
          {audioLevels.map((h, i) => (
            <motion.div
              key={i}
              className="bg-red-400 rounded-full flex-1"
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.1 }}
              style={{ minHeight: 2 }}
            />
          ))}
        </div>

        {/* Live transcript */}
        {transcript && (
          <p className="text-xs text-red-700 italic line-clamp-2">"{transcript}"</p>
        )}

        <Button variant="destructive" size="sm" className="w-full" onClick={handleStop}>
          <MicOff className="w-4 h-4 mr-2" />Stop Recording
        </Button>
      </div>
    );
  }

  // ── Render: idle ────────────────────────────────────────────────────────────
  return (
    <Button type="button" variant="outline" onClick={handleStart} className="w-full">
      <Mic className="w-4 h-4 mr-2" />
      Record Voice Note
    </Button>
  );
}
