'use client';

import React, { useState } from 'react';
import { Star, Upload, CheckCircle2, MessageSquare } from 'lucide-react';

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
      'The Arabic calligraphy was so delicate and clean. My sister actually teared up when she saw her name in gold flakes, and the packaging felt so thoughtful.',
    date: '3 days ago',
    photoUrl: '/images/resin-keychain.svg',
  },
  {
    id: 'pr-2',
    author: 'Sneha & Farhan',
    city: 'Bengaluru',
    rating: 5,
    comment:
      'The Nikah frame was the highlight of our stage setup. The gold foil and Quranic verse were framed with precision and packed very safely.',
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
      author: author.trim() || 'Guest Customer',
      city: city.trim() || 'India',
      rating,
      comment: comment.trim(),
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
    <section className="pt-8 border-t border-[#EFE8E1] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-heading font-normal text-xl sm:text-2xl text-[#1C1917]">
              Customer Reviews
            </h3>
            <span className="text-xs font-semibold text-[#7A1C3B]">
              ({reviews.length})
            </span>
          </div>
          <p className="font-sans text-xs text-[#78716C] mt-0.5">
            Feedback and unboxing notes from customers who ordered {productName}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-white hover:bg-[#FAF7F2] text-[#7A1C3B] border border-[#EFE8E1] hover:border-[#7A1C3B]/40 rounded-full font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{showForm ? 'Close Form' : 'Write a Review'}</span>
        </button>
      </div>

      {submittedMessage && (
        <div className="p-3.5 bg-[#FDF0F3] border border-[#FADDE3] rounded-2xl text-xs font-semibold text-[#7A1C3B] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#7A1C3B] shrink-0" />
          <span>Thank you! Your review has been added for {productName}.</span>
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <form
          onSubmit={handleReviewSubmit}
          className="bg-white border border-[#EFE8E1] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 animate-in fade-in duration-200"
        >
          <div className="font-heading font-medium text-base text-[#1C1917] border-b border-[#EFE8E1] pb-2.5">
            Share Your Experience with {productName}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#1C1917]">Rating:</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110 transition cursor-pointer"
                  aria-label={`Rate ${s} stars`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      s <= rating ? 'text-amber-500 fill-amber-500' : 'text-[#D5CCC3]'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-[#7A1C3B] font-semibold ml-2">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            <div className="space-y-1">
              <label className="block font-semibold text-[#1C1917]">Your Name:</label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Fatima Z."
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 focus:bg-white border border-[#EFE8E1] rounded-xl text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#7A1C3B]"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-semibold text-[#1C1917]">City / State:</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Chennai"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 focus:bg-white border border-[#EFE8E1] rounded-xl text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#7A1C3B]"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs font-sans">
            <label className="block font-semibold text-[#1C1917]">Your Review:</label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How did the parcel look when you opened it?"
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 focus:bg-white border border-[#EFE8E1] rounded-xl text-[#1C1917] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#7A1C3B] resize-none"
            />
          </div>

          {/* Photo upload */}
          <div className="space-y-1.5 text-xs font-sans">
            <label className="block font-semibold text-[#1C1917]">Add Unboxing Photo (Optional):</label>
            <label className="flex items-center gap-2 p-3 bg-[#FAF7F2]/60 border border-dashed border-[#DFD5CB] rounded-xl cursor-pointer hover:border-[#7A1C3B] text-[#78716C] text-xs transition">
              <Upload className="w-4 h-4 text-[#7A1C3B]" />
              <span>Choose photo from your device</span>
              <input type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" />
            </label>
            {photoPreview && (
              <div className="mt-2 w-16 h-16 relative rounded-xl overflow-hidden border border-[#EFE8E1] bg-[#FAF7F2]">
                <img src={photoPreview} alt="Review attachment" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-xs font-medium text-[#78716C] hover:text-[#1C1917] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#7A1C3B] hover:bg-[#5A1230] text-white rounded-full font-bold text-xs shadow-xs transition cursor-pointer"
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
            className="bg-white border border-[#EFE8E1] rounded-3xl p-5 shadow-2xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
                <span className="text-[11px] text-[#8C827A]">{rev.date}</span>
              </div>

              <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>

            <div className="pt-3 border-t border-[#FAF7F2] flex items-center justify-between gap-2">
              <div>
                <span className="font-heading font-medium text-xs sm:text-sm text-[#1C1917]">{rev.author}</span>
                <span className="text-[11px] text-[#8C827A] ml-1.5">· {rev.city}</span>
              </div>

              {rev.photoUrl && (
                <div className="w-9 h-9 relative rounded-xl border border-[#EFE8E1] bg-[#FAF7F2] overflow-hidden shrink-0">
                  <img src={rev.photoUrl} alt="Customer photo" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
