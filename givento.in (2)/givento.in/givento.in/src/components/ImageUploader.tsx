'use client';

import React, { useState, useRef } from 'react';
import { Upload, ImagePlus, X, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = 'Product Image',
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const allowedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);

    // Validate format
    if (!allowedFormats.includes(file.type)) {
      setErrorMessage('Unsupported format. Please select a JPG, PNG, or WEBP image.');
      return;
    }

    // Validate size
    if (file.size > maxSizeBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(`File is too large (${sizeMb} MB). Maximum allowed size is 5 MB.`);
      return;
    }

    setUploadedFileName(file.name);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 90);
          setUploadProgress(Math.max(15, percent));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.url) {
              setUploadProgress(100);
              setTimeout(() => {
                onChange(data.url);
                setUploadProgress(null);
              }, 400);
            } else {
              setErrorMessage(data.error || 'Upload failed without a URL.');
              setUploadProgress(null);
            }
          } catch {
            setErrorMessage('Invalid server response.');
            setUploadProgress(null);
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            setErrorMessage(errData.error || `Upload failed with status ${xhr.status}.`);
          } catch {
            setErrorMessage(`Upload failed with status ${xhr.status}.`);
          }
          setUploadProgress(null);
        }
      };

      xhr.onerror = () => {
        setErrorMessage('Network error during upload. Please check your connection.');
        setUploadProgress(null);
      };

      xhr.send(formData);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initiate upload.');
      setUploadProgress(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // reset input value so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setUploadedFileName(null);
    setErrorMessage(null);
  };

  const hasImage = Boolean(value && value.trim());

  return (
    <div className="space-y-2">
      {/* Field Label */}
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-[#1c1917] text-xs">
          {label}
        </label>
        {hasImage && !uploadProgress && (
          <span className="text-[11px] font-semibold text-[#166534] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Image Ready</span>
          </span>
        )}
      </div>

      {/* Hidden File Input (supports mobile gallery, camera, and desktop dialog) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload product image file"
      />

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-xs text-[#991b1b] flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-[#991b1b] hover:opacity-75 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Uploading State: Progress Bar */}
      {uploadProgress !== null ? (
        <div className="border-2 border-dashed border-[#7a1c3b] bg-[#fbf4f0] rounded-xl p-6 text-center">
          <Loader2 className="w-8 h-8 text-[#7a1c3b] animate-spin mx-auto mb-3" />
          <b className="block text-xs font-bold text-[#1c1917] mb-1">
            Uploading Image... {uploadProgress}%
          </b>
          <p className="text-[11px] text-[#78716c] mb-3">
            Processing and optimizing for storefront
          </p>
          <div className="w-full bg-[#e7e5e4] h-2 rounded-full overflow-hidden max-w-xs mx-auto">
            <div
              className="bg-[#7a1c3b] h-full rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : hasImage ? (
        /* Image Preview & Management Card */
        <div className="bg-[#faf7f2] border border-[#e7e5e4] rounded-xl p-3 flex flex-col sm:flex-row items-center gap-4 relative group">
          {/* Image Thumbnail */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-white border border-[#e7e5e4] flex items-center justify-center flex-shrink-0 shadow-xs">
            <img
              src={value}
              alt="Uploaded Product Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                // If broken image, fallback display
                (e.target as HTMLImageElement).src = '/images/sunflower-bouquet.svg';
              }}
            />
          </div>

          {/* Details & Actions */}
          <div className="flex-1 min-w-0 text-center sm:text-left space-y-1 w-full">
            <span className="inline-block text-[10px] font-bold tracking-wider text-[#7a1c3b] uppercase bg-[#f6e9ee] px-2 py-0.5 rounded-full">
              Uploaded Image
            </span>
            <p className="text-xs font-semibold text-[#1c1917] truncate max-w-xs">
              {uploadedFileName || value.split('/').pop() || 'Product Artwork'}
            </p>
            <p className="text-[11px] text-[#78716c] truncate">
              {value.startsWith('data:') ? 'Local file attached' : value}
            </p>

            {/* Replace / Remove Buttons */}
            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white border border-[#e7e5e4] hover:border-[#7a1c3b] hover:text-[#7a1c3b] rounded-lg text-xs font-semibold text-[#1c1917] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-white border border-[#fecaca] hover:bg-[#fef2f2] text-[#b91c1c] rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Zone (Matching Reference Screenshot) */
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 group ${
            isDragging
              ? 'border-[#7a1c3b] bg-[#fbf4f0] scale-[0.99]'
              : 'border-[#e7e5e4] hover:border-[#7a1c3b] bg-[#faf7f2] hover:bg-[#fdfbf9]'
          }`}
        >
          {/* Upload Icon */}
          <div className="w-12 h-12 rounded-full bg-white border border-[#e7e5e4] flex items-center justify-center mx-auto mb-3 group-hover:scale-105 group-hover:border-[#7a1c3b] transition-all shadow-xs">
            <ImagePlus className="w-6 h-6 text-[#78716c] group-hover:text-[#7a1c3b] transition-colors" />
          </div>

          {/* Heading */}
          <b className="block text-sm font-bold text-[#1c1917] mb-0.5">
            Upload Product Image
          </b>

          {/* Subtitle */}
          <p className="text-xs text-[#78716c] mb-2.5">
            Choose an image from your device
          </p>

          {/* Format Badges (Matching Screenshot: JPG · PNG · WEBP) */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dcfce7] border border-[#bbf7d0] text-[#15803d] text-[10px] font-bold tracking-wide">
            <span>JPG</span>
            <span>·</span>
            <span>PNG</span>
            <span>·</span>
            <span>WEBP</span>
          </div>

          {/* Helper caption */}
          <p className="text-[10px] text-[#a8a29e] mt-3">
            Image preview should appear here after selection. Max 5MB.
          </p>
        </div>
      )}
    </div>
  );
}
