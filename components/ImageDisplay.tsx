
import React from 'react';

interface ImageDisplayProps {
  generatedImage: string | null;
  isLoading: boolean;
  error: string | null;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ generatedImage, isLoading, error }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-brand-dark p-6 rounded-xl shadow-lg border border-gray-700 min-h-[400px] lg:min-h-full">
      {isLoading && (
        <div className="flex flex-col items-center text-center">
          <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-brand-red" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-semibold text-gray-300">Generating your masterpiece...</p>
          <p className="text-sm text-gray-400">The AI is thinking. This might take a moment.</p>
        </div>
      )}
      {error && (
        <div className="text-center text-red-400">
            <h3 className="text-xl font-bold mb-2">An Error Occurred</h3>
            <p className="bg-red-900/50 p-3 rounded-md">{error}</p>
        </div>
      )}
      {!isLoading && !error && !generatedImage && (
        <div className="text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-xl font-semibold">Your Thumbnail Awaits</h3>
            <p>Fill out the form to generate an image.</p>
        </div>
      )}
      {generatedImage && (
        <div className="w-full text-center">
          <img src={generatedImage} alt="Generated Thumbnail" className="rounded-lg shadow-2xl w-full object-contain" />
          <a
            href={generatedImage}
            download="ai-thumbnail.jpg"
            className="mt-6 inline-block bg-brand-red text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors"
          >
            Download Image
          </a>
        </div>
      )}
    </div>
  );
};
