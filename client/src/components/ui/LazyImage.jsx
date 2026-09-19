import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';

export function LazyImage({
  src,
  alt = 'Image',
  className = '',
  containerClassName = '',
  aspectRatio = 'aspect-video',
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(!src);

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800/80 ${aspectRatio} ${containerClassName}`}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800 animate-pulse">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-semibold">
            <ImageIcon className="w-5 h-5 animate-pulse" />
          </div>
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/30 to-indigo-900/30 text-slate-400 p-4 text-center">
          <Sparkles className="w-6 h-6 text-blue-400/60 mb-1" />
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 truncate max-w-full">
            {alt}
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
        />
      )}
    </div>
  );
}
