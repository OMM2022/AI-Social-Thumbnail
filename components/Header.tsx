
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-brand-dark border-b border-gray-700 p-4">
      <div className="container mx-auto flex items-center justify-center">
        <SparklesIcon className="w-8 h-8 text-brand-red" />
        <h1 className="text-2xl md:text-3xl font-bold ml-3 text-white">
          AI YouTube Thumbnail Generator
        </h1>
      </div>
    </header>
  );
};
