import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Play, Pause, Sun } from 'lucide-react';

const TextToSpeech = ({ text }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [voice, setVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);
    setUtterance(u);

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      setVoices(availableVoices);
      setVoice(availableVoices[0]);
    };

    synth.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
      synth.cancel();
    };
  }, [text]);

  const handleTogglePlay = () => {
    const synth = window.speechSynthesis;

    if (isPlaying) {
      synth.pause();
    } else {
      if (synth.paused) {
        synth.resume();
      } else {
        utterance.voice = voice;
        utterance.rate = rate;
        synth.speak(utterance);
      }
    }

    setIsPlaying(!isPlaying);
  };

  const handleVoiceChange = (value) => {
    const selectedVoice = voices.find(v => v.name === value);
    setVoice(selectedVoice);
  };

  return (
    <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg shadow-sm w-64">
      <div className="flex items-center justify-between mb-2">
        <Button 
          onClick={handleTogglePlay} 
          className="w-10 h-10 rounded-full bg-orange-400 hover:bg-orange-500 text-white"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        <Sun className="w-6 h-6 text-orange-400" />
        <Select onValueChange={handleVoiceChange}>
          <SelectTrigger className="w-24 h-8 text-xs">
            <SelectValue placeholder="Voice" />
          </SelectTrigger>
          <SelectContent>
            {voices.map((voice) => (
              <SelectItem key={voice.name} value={voice.name} className="text-xs">
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs font-medium text-orange-700">Speed</span>
        <Slider
          min={0.5}
          max={2}
          step={0.1}
          value={[rate]}
          onValueChange={([value]) => setRate(value)}
          className="w-full"
        />
        <span className="text-xs font-medium text-orange-700">{rate.toFixed(1)}x</span>
      </div>
    </div>
  );
};

export default TextToSpeech;