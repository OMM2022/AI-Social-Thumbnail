
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { ImageDisplay } from './components/ImageDisplay';
import { generateThumbnail } from './services/geminiService';
import type { GenerationOptions, AspectRatio } from './types';

const App: React.FC = () => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (options: GenerationOptions) => {
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const imageUrl = await generateThumbnail(options);
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-brand-darker text-brand-light font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InputPanel onGenerate={handleGenerate} isLoading={isLoading} />
          <ImageDisplay generatedImage={generatedImage} isLoading={isLoading} error={error} />
        </div>
      </main>
    </div>
  );
};

export default App;
