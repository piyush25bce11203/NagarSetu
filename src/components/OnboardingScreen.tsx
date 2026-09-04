import React, { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Languages, Loader, Navigation, CheckCircle } from 'lucide-react';
import { translations, Language, getT } from './translations';
import { motion } from 'motion/react';

interface District {
  name: string;
  coordinates: { lat: number; lng: number };
  emoji: string;
  description: string;
}

const mpDistricts: District[] = [
  {
    name: 'Indore',
    coordinates: { lat: 22.7196, lng: 75.8577 },
    emoji: '🏙️',
    description: 'Commercial capital of MP',
  },
  {
    name: 'Ujjain',
    coordinates: { lat: 23.1828, lng: 75.7682 },
    emoji: '🛕',
    description: 'City of Mahakal',
  },
  {
    name: 'Bhopal',
    coordinates: { lat: 23.2599, lng: 77.4126 },
    emoji: '🏛️',
    description: 'State capital of MP',
  },
];

const languageOptions = [
  { value: 'english', label: 'English'       },
  { value: 'hindi',   label: 'हिन्दी (Hindi)' },
];

interface OnboardingScreenProps {
  onComplete: (
    district: string,
    coordinates: { lat: number; lng: number },
    language: Language
  ) => void;
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function OnboardingScreen({
  onComplete,
  currentLanguage,
  onLanguageChange,
}: OnboardingScreenProps) {
  const [step, setStep]                 = useState<'language' | 'location'>('language');
  const [detecting, setDetecting]       = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');

  const t = getT(currentLanguage);

  const handleLanguageSelect = (language: string) => {
    onLanguageChange(language as Language);
  };

  const handleAutoDetect = () => {
    setDetecting(true);
    // Simulate GPS — always resolves to Indore for the prototype
    setTimeout(() => {
      setDetecting(false);
      const indore = mpDistricts.find(d => d.name === 'Indore')!;
      onComplete(indore.name, indore.coordinates, currentLanguage);
    }, 1800);
  };

  const handleCitySelect = (city: District) => {
    setSelectedCity(city.name);
    setTimeout(() => {
      onComplete(city.name, city.coordinates, currentLanguage);
    }, 300);
  };

  // ── Language step ───────────────────────────────────────────────────────────
  if (step === 'language') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex flex-col items-center justify-center p-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-md bg-white border border-gray-100">
            <img src="/logo.png" alt="NagarSetu Logo" className="w-full h-full object-contain p-1" />
          </div>
          <h1 className="text-2xl font-bold text-primary">NagarSetu</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">SVH 2026</p>
          <p className="text-sm text-muted-foreground mt-1">Select your language to continue</p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          {languageOptions.map((option) => (
            <Button
              key={option.value}
              variant={currentLanguage === option.value ? 'default' : 'outline'}
              className="w-full justify-start h-auto py-3 gap-3"
              onClick={() => handleLanguageSelect(option.value)}
            >
              {currentLanguage === option.value && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
              {option.label}
            </Button>
          ))}
        </div>

        <Button className="mt-8 w-full max-w-sm" onClick={() => setStep('location')}>
          {getT(currentLanguage).continue} →
        </Button>
      </div>
    );
  }

  // ── Location step ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex flex-col items-center justify-center p-6 pb-20">
      {/* Logo */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden shadow-md bg-white border border-gray-100">
          <img src="/logo.png" alt="NagarSetu Logo" className="w-full h-full object-contain p-1" />
        </div>
        <h1 className="text-2xl font-bold text-primary">NagarSetu</h1>
        <p className="text-sm text-muted-foreground mt-1">Select your city</p>
      </div>

      <div className="w-full max-w-sm space-y-5">

        {/* ── Auto-detect ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border shadow-sm p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Detect Automatically
          </p>
          <Button
            className="w-full gap-2"
            onClick={handleAutoDetect}
            disabled={detecting}
            variant="outline"
          >
            {detecting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Detecting your location…
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                Use My Current Location
              </>
            )}
          </Button>
          {detecting && (
            <p className="text-xs text-center text-muted-foreground mt-2">
              Accessing GPS…
            </p>
          )}
        </div>

        {/* ── Divider ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-muted-foreground font-medium">OR SELECT MANUALLY</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* ── City cards ──────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {mpDistricts.map((city, i) => (
            <motion.button
              key={city.name}
              type="button"
              onClick={() => handleCitySelect(city)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                selectedCity === city.name
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 bg-white hover:border-primary/40 hover:shadow-sm'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* City emoji icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                selectedCity === city.name ? 'bg-primary/10' : 'bg-gray-100'
              }`}>
                {city.emoji}
              </div>

              {/* City info */}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-base ${
                  selectedCity === city.name ? 'text-primary' : 'text-gray-900'
                }`}>
                  {city.name}
                </p>
                <p className="text-xs text-muted-foreground">{city.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {city.coordinates.lat.toFixed(4)}°N, {city.coordinates.lng.toFixed(4)}°E
                </p>
              </div>

              {/* Selected indicator */}
              {selectedCity === city.name ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex-shrink-0"
                >
                  <CheckCircle className="w-6 h-6 text-primary" />
                </motion.div>
              ) : (
                <MapPin className="w-5 h-5 text-gray-300 flex-shrink-0" />
              )}
            </motion.button>
          ))}
        </div>

        {/* Prototype note */}
        <p className="text-xs text-center text-orange-500 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
          📍 GPS auto-detect uses simulated location for this prototype.
          Manual selection is always accurate.
        </p>
      </div>

      {/* Language toggle at bottom */}
      <div className="absolute bottom-4 left-4">
        <Select
          value={currentLanguage}
          onValueChange={(value: string) => onLanguageChange(value as Language)}
        >
          <SelectTrigger className="w-auto bg-white">
            <Languages className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
