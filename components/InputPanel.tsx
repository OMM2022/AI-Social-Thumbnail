import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { GenerationOptions, GenerationMode, AspectRatio } from '../types';
import { UrlIcon } from './icons/UrlIcon';
import { ImageIcon } from './icons/ImageIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { enhancePrompt } from '../services/geminiService';

interface InputPanelProps {
  onGenerate: (options: GenerationOptions) => void;
  isLoading: boolean;
}

const GenerationModeToggle: React.FC<{
    mode: GenerationMode,
    setMode: (mode: GenerationMode) => void
}> = ({ mode, setMode }) => (
    <div className="flex bg-brand-dark p-1 rounded-lg mb-6">
        <button
            onClick={() => setMode('url')}
            className={`w-1/2 flex items-center justify-center gap-2 p-2 rounded-md transition-colors ${mode === 'url' ? 'bg-brand-red text-white' : 'hover:bg-gray-700'}`}
        >
            <UrlIcon className="w-5 h-5" />
            Analyze URL
        </button>
        <button
            onClick={() => setMode('image')}
            className={`w-1/2 flex items-center justify-center gap-2 p-2 rounded-md transition-colors ${mode === 'image' ? 'bg-brand-red text-white' : 'hover:bg-gray-700'}`}
        >
            <ImageIcon className="w-5 h-5" />
            Use Image
        </button>
    </div>
);

const AspectRatioSelector: React.FC<{
    selected: AspectRatio,
    onSelect: (aspectRatio: AspectRatio) => void
}> = ({ selected, onSelect }) => {
    const ratios: AspectRatio[] = ['16:9', '9:16', '4:3', '3:4', '1:1'];
    return (
        <div className="flex flex-wrap gap-2">
            {ratios.map((ratio) => (
                <button
                    key={ratio}
                    type="button"
                    onClick={() => onSelect(ratio)}
                    className={`px-4 py-2 rounded-md text-sm transition-colors ${selected === ratio ? 'bg-brand-red text-white' : 'bg-brand-dark hover:bg-gray-700'}`}
                >
                    {ratio}
                </button>
            ))}
        </div>
    );
};

const fonts = [
  { name: 'Roboto', family: 'font-roboto' },
  { name: 'Oswald', family: 'font-oswald' },
  { name: 'Anton', family: 'font-anton' },
  { name: 'Bebas Neue', family: 'font-bebas-neue' },
  { name: 'Montserrat', family: 'font-montserrat' },
];

const FontSelector: React.FC<{
    selected: string,
    onSelect: (font: string) => void
}> = ({ selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedFont = fonts.find(f => f.name === selected) || fonts[0];

    const handleSelect = (fontName: string) => {
        onSelect(fontName);
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-brand-darker border border-gray-600 rounded-lg px-4 py-2 text-left flex justify-between items-center focus:ring-brand-red focus:border-brand-red transition"
            >
                <span className={selectedFont.family}>{selectedFont.name}</span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-brand-dark border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {fonts.map((font) => (
                        <li
                            key={font.name}
                            onClick={() => handleSelect(font.name)}
                            className={`px-4 py-2 cursor-pointer hover:bg-gray-700 ${font.family}`}
                        >
                            {font.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}


export const InputPanel: React.FC<InputPanelProps> = ({ onGenerate, isLoading }) => {
  const [mode, setMode] = useState<GenerationMode>('url');
  const [url, setUrl] = useState<string>('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [fontFamily, setFontFamily] = useState<string>('Anton');
  const [prompt, setPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setReferenceImage(base64String);
        setImageFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
        alert("Please provide a title for the thumbnail.");
        return;
    }
    onGenerate({ mode, url, referenceImage, title, fontFamily, prompt, aspectRatio });
  }, [onGenerate, mode, url, referenceImage, title, fontFamily, prompt, aspectRatio]);
  
  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt.trim()) {
      return;
    }
    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(prompt);
      setPrompt(enhanced);
    } catch (err) {
      console.error("Failed to enhance prompt:", err);
      alert("Sorry, the prompt couldn't be enhanced at this time.");
    } finally {
      setIsEnhancing(false);
    }
  }, [prompt]);

  return (
    <div className="bg-brand-dark p-6 rounded-xl shadow-lg border border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <GenerationModeToggle mode={mode} setMode={setMode} />

        {mode === 'url' ? (
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">Website URL</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-video-topic.com"
              className="w-full bg-brand-darker border border-gray-600 rounded-lg px-4 py-2 focus:ring-brand-red focus:border-brand-red transition"
              required
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Reference Image</label>
            <label className="w-full flex items-center justify-center px-4 py-2 bg-brand-darker border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-brand-red transition">
                <ImageIcon className="w-6 h-6 mr-2 text-gray-400" />
                <span className="text-gray-400">{imageFileName || "Upload an image"}</span>
                <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageUpload} required/>
            </label>
          </div>
        )}

        <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Thumbnail Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., My Craziest Adventure!"
              className="w-full bg-brand-darker border border-gray-600 rounded-lg px-4 py-2 focus:ring-brand-red focus:border-brand-red transition"
              required
            />
        </div>
        
        <div>
            <label htmlFor="font" className="block text-sm font-medium text-gray-300 mb-2">Title Font</label>
            <FontSelector selected={fontFamily} onSelect={setFontFamily} />
        </div>

        <div>
            <div className="flex justify-between items-center mb-2">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">Additional Prompt (Optional)</label>
                <button
                    type="button"
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing || isLoading || !prompt.trim()}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-brand-red disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                    <SparklesIcon className={`w-4 h-4 ${isEnhancing ? 'animate-spin' : ''}`} />
                    Enhance with AI
                </button>
            </div>
            <textarea
              id="prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Make it look like a 90s retro movie poster"
              className="w-full bg-brand-darker border border-gray-600 rounded-lg px-4 py-2 focus:ring-brand-red focus:border-brand-red transition"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Customize Format</label>
            <AspectRatioSelector selected={aspectRatio} onSelect={setAspectRatio} />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-brand-red text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Thumbnail'}
          <SparklesIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </form>
    </div>
  );
};