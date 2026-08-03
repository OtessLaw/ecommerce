import React, { useState } from 'react';
import { FiStar, FiCheckCircle, FiThumbsUp, FiEdit3 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const mockReviews = [
  {
    id: 1,
    author: 'Kofi Mensah',
    location: 'Accra, Ghana',
    rating: 5,
    date: '2 days ago',
    comment: 'The quality of the calfskin leather and 24K gold hardware is unbelievable! Fits perfectly. Fast delivery in Accra.',
    verified: true,
    fitScore: 'True to Size',
    likes: 12,
  },
  {
    id: 2,
    author: 'Abena Osei',
    location: 'Kumasi, Ghana',
    rating: 5,
    date: '1 week ago',
    comment: 'Exquisite silk fabric and gold embroidery. Wore it to a gala in Kumasi and got endless compliments.',
    verified: true,
    fitScore: 'True to Size',
    likes: 8,
  },
];

export default function ProductReviews({ product }) {
  const [reviews, setReviews] = useState(mockReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) {
      toast.error('Please enter your name and review details');
      return;
    }

    const created = {
      id: Date.now(),
      author: authorName,
      location: 'Accra, Ghana',
      rating: newRating,
      date: 'Just now',
      comment: newComment,
      verified: true,
      fitScore: 'True to Size',
      likes: 0,
    };

    setReviews([created, ...reviews]);
    setNewComment('');
    setAuthorName('');
    setShowReviewForm(false);
    toast.success('Thank you! Your review has been published.');
  };

  return (
    <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl p-6 sm:p-8 space-y-8 mt-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#2A2A2A] pb-6 gap-4">
        <div>
          <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-widest">VERIFIED CLIENT FEEDBACK</span>
          <h3 className="text-2xl font-extrabold text-white uppercase tracking-tight mt-0.5">
            CLIENT REVIEWS ({reviews.length})
          </h3>
        </div>

        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="gold-btn px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase flex items-center space-x-2 shadow-gold"
        >
          <FiEdit3 size={16} />
          <span>WRITE A REVIEW</span>
        </button>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#1A1A1A] p-6 rounded-2xl border border-[#2A2A2A]">
        <div className="text-center md:border-r border-[#2A2A2A] pr-4 space-y-1">
          <div className="text-4xl font-extrabold text-[#D4AF37] font-mono">4.9</div>
          <div className="flex justify-center text-[#D4AF37] space-x-1">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className="fill-[#D4AF37]" size={16} />
            ))}
          </div>
          <p className="text-[11px] text-gray-400">Based on verified customer orders</p>
        </div>

        <div className="text-center md:border-r border-[#2A2A2A] px-4 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">FIT CONFIDENCE</span>
          <div className="text-lg font-extrabold text-white">96% True to Size</div>
          <p className="text-[11px] text-emerald-400 font-semibold">Fits accurately based on size calculator</p>
        </div>

        <div className="text-center pl-4 space-y-1">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">QUALITY RATING</span>
          <div className="text-lg font-extrabold text-[#D4AF37]">5.0 / 5.0</div>
          <p className="text-[11px] text-gray-400">Authentic materials & gold hardware</p>
        </div>
      </div>

      {/* Review Form Drawer */}
      {showReviewForm && (
        <form onSubmit={handleReviewSubmit} className="bg-[#1A1A1A] p-6 rounded-2xl border border-[#2A2A2A] space-y-4 animate-fadeIn">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">SHARE YOUR EXPERIENCE</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Your Full Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Kofi Mensah"
                className="w-full bg-[#141414] text-white text-xs rounded-xl p-3 border border-[#2A2A2A] focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Rating</label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(Number(e.target.value))}
                className="w-full bg-[#141414] text-white text-xs rounded-xl p-3 border border-[#2A2A2A] focus:border-[#D4AF37]"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5) Exceptional</option>
                <option value={4}>⭐⭐⭐⭐ (4/5) Great</option>
                <option value={3}>⭐⭐⭐ (3/5) Good</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Review Details</label>
            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Describe fit, material quality, and delivery experience..."
              className="w-full bg-[#141414] text-white text-xs rounded-xl p-3 border border-[#2A2A2A] focus:border-[#D4AF37]"
            />
          </div>

          <button type="submit" className="gold-btn px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider">
            SUBMIT VERIFIED REVIEW
          </button>
        </form>
      )}

      {/* Review List */}
      <div className="space-y-4 divide-y divide-[#1F1F1F]">
        {reviews.map((rev) => (
          <div key={rev.id} className="pt-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <strong className="text-white text-sm">{rev.author}</strong>
                {rev.verified && (
                  <span className="flex items-center space-x-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                    <FiCheckCircle size={10} />
                    <span>VERIFIED BUYER</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-500">{rev.date}</span>
            </div>

            <div className="flex text-[#D4AF37] space-x-1">
              {[...Array(rev.rating)].map((_, i) => (
                <FiStar key={i} className="fill-[#D4AF37]" size={14} />
              ))}
            </div>

            <p className="text-gray-300 leading-relaxed text-xs">{rev.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
