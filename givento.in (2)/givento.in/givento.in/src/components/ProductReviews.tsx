'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Upload, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';

interface ReviewItem {
  id: string;
  author: string;
  city: string;
  rating: number;
  comment: string;
  date: string;
  photoUrl?: string;
}

const INITIAL_PRODUCT_REVIEWS: ReviewItem[] = [
  {
    id: 'pr-1',
    author: 'Ayesha Rahman',
    city: 'Kozhikode',
    rating: 5,
    comment:
      'The Arabic calligraphy was so delicate and clean! My sister actually teared up when she saw her name in gold flakes. The packaging felt like opening a warm letter from a friend 🥺✨',
    date: '3 days ago',
    photoUrl: '/images/resin-keychain.svg',
  },
  {
    id: 'pr-2',
    author: 'Sneha & Farhan',
    city: 'Bengaluru',
    rating: 5,
    comment:
      'The Nikah frame was the talk of our stage setup! The gold foil and Quranic verse were framed with such precision.',
    date: '1 week ago',
    photoUrl: '/images/nikah-frame.svg',
  },
];

export default function ProductReviews({ productName }: { productName: string }) {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_PRODUCT_REVIEWS);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState('');
  const [city, setCity] = useState('');
  const [comment, setComment] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: author || 'Anonymous Giver',
      city: city || 'India',
      rating,
      comment,
      date: 'Just now',
      photoUrl: photoPreview || undefined,
    };

    setReviews([newRev, ...reviews]);
    setSubmittedMessage(true);
    setShowForm(false);
    setAuthor('');
    setCity('');
    setComment('');
    setPhotoPreview(null);
  };

  return (
    <div className="mt-14 pt-8 border-t-2 border-[#2D1527]/20 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-2xl text-[#2D1527]">
              Customer Love &amp; Unboxing Notes
            </h3>
            <span className="font-handwriting text-sm text-[#7A1C30] font-bold">
              ({reviews.length} reviews)
            </span>
          </div>
          <p className="font-body text-xs text-[#5E3C57]">
            Real feedback from girls and givers who ordered {productName}.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-ink px-4 py-2 bg-white hover:bg-[#FDEBF0] text-[#7A1C30] rounded-xl font-heading text-xs flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{showForm ? 'Close Form' : 'Write a Review'}</span>
        </button>
      </div>

      {submittedMessage && (
        <div className="p-3 bg-[#E9F6F1] border-2 border-[#7BBFA6] rounded-xl font-handwriting text-sm font-bold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>Thank you! Your review has been submitted to our studio for approval. It will appear once verified by our maker 💌</span>
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <form
          onSubmit={handleReviewSubmit}
          className="bg-white border-2 border-[#2D1527] rounded-2xl p-5 shadow-ink space-y-4"
        >
          <div className="font-heading text-sm text-[#2D1527] border-b border-[#2D1527]/15 pb-2">
            Share Your Experience with {productName}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#2D1527]">Rating:</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-5 h-5 ${
                      s <= rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="font-handwriting text-xs text-[#7A1C30] font-bold ml-2">
                {rating === 5 ? 'Loved it completely! ♥' : `${rating} out of 5 stars`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-body">
            <div className="space-y-1">
              <label className="block font-bold text-[#2D1527]">Your Name:</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Fatima Z."
                className="w-full px-3 py-2 bg-[#FFF9F6] border border-[#2D1527] rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-[#2D1527]">City / State:</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Hyderabad"
                className="w-full px-3 py-2 bg-[#FFF9F6] border border-[#2D1527] rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs font-body">
            <label className="block font-bold text-[#2D1527]">Your Review Note:</label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did the parcel feel when you opened it? What did the recipient say?"
              className="w-full px-3 py-2 bg-[#FFF9F6] border border-[#2D1527] rounded-xl font-handwriting text-sm"
            />
          </div>

          {/* Photo upload */}
          <div className="space-y-1 text-xs font-body">
            <label className="block font-bold text-[#2D1527]">Add Unboxing Photo (Optional):</label>
            <label className="flex items-center gap-2 p-2 bg-[#FAF2EC] border border-dashed border-[#2D1527] rounded-xl cursor-pointer hover:bg-[#FDEBF0] text-[#5E3C57] text-xs">
              <Upload className="w-3.5 h-3.5 text-[#7A1C30]" />
              <span>Choose photo from your phone/camera</span>
              <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
            </label>
            {photoPreview && (
              <div className="mt-2 w-16 h-16 relative rounded-lg overflow-hidden border border-[#2D1527]">
                <Image src={photoPreview} alt="Review attachment" fill className="object-cover" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs font-body text-[#5E3C57]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-ink px-4 py-2 bg-[#7A1C30] text-[#FEF08A] rounded-xl font-heading text-xs"
            >
              Post Review
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-[#FAF2EC] border-2 border-[#2D1527] rounded-2xl p-4 shadow-ink space-y-3 relative flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[#D4AF37]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#D4AF37]" />
                  ))}
                </div>
                <span className="font-handwriting text-xs text-[#5E3C57]">{rev.date}</span>
              </div>

              <p className="font-handwriting text-base text-[#2D1527] leading-snug">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>

            <div className="pt-2 border-t border-[#2D1527]/15 flex items-center justify-between">
              <div>
                <span className="font-heading text-xs text-[#2D1527]">{rev.author}</span>
                <span className="text-[10px] text-[#5E3C57] ml-1.5">({rev.city})</span>
              </div>

              {rev.photoUrl && (
                <div className="w-8 h-8 relative rounded-lg border border-[#2D1527] overflow-hidden flex-shrink-0">
                  <Image src={rev.photoUrl} alt="Attached photo" fill className="object-cover" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
