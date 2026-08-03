import React, { useState } from 'react';
import { FiX, FiCheck, FiSliders } from 'react-icons/fi';

export default function SizeCalculatorModal({ isOpen, onClose, onSelectSize, availableSizes = [] }) {
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(72);
  const [fitPreference, setFitPreference] = useState('regular'); // slim, regular, oversized

  if (!isOpen) return null;

  const calculateRecommendedSize = () => {
    let size = 'M';
    if (weight < 60) size = 'S';
    else if (weight >= 60 && weight < 78) size = 'M';
    else if (weight >= 78 && weight < 90) size = 'L';
    else size = 'XL';

    if (fitPreference === 'oversized') {
      if (size === 'S') size = 'M';
      else if (size === 'M') size = 'L';
      else if (size === 'L') size = 'XL';
    }

    return size;
  };

  const recommendedSize = calculateRecommendedSize();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#141414] border border-[#2A2A2A] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-3">
          <div>
            <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">J&J VINTAGE FIT ADVISOR</span>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-tight">SMART SIZE CALCULATOR</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
            <FiX size={18} />
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-5 text-xs text-gray-300">
          <div>
            <div className="flex justify-between mb-1.5 font-bold">
              <span>Height:</span>
              <span className="text-[#D4AF37] font-mono text-sm">{height} cm</span>
            </div>
            <input
              type="range"
              min={140}
              max={210}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-[#D4AF37]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1.5 font-bold">
              <span>Weight:</span>
              <span className="text-[#D4AF37] font-mono text-sm">{weight} kg</span>
            </div>
            <input
              type="range"
              min={40}
              max={130}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full accent-[#D4AF37]"
            />
          </div>

          <div>
            <span className="block font-bold mb-2">Preferred Fit Silhouette:</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { id: 'slim', label: 'Tailored Slim' },
                { id: 'regular', label: 'Regular Fit' },
                { id: 'oversized', label: 'Vintage Oversized' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFitPreference(f.id)}
                  className={`py-2 px-2 rounded-xl border transition ${
                    fitPreference === f.id ? 'bg-[#D4AF37] text-black font-extrabold border-[#D4AF37]' : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendation Result Card */}
        <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#2A2A2A] text-center space-y-2">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest">CALCULATED IDEAL FIT</span>
          <div className="text-3xl font-extrabold text-[#D4AF37] font-mono">{recommendedSize}</div>
          <p className="text-[11px] text-emerald-400 font-semibold">98% Fit Match Confidence</p>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            onSelectSize(recommendedSize);
            onClose();
          }}
          className="w-full gold-btn py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center justify-center space-x-2"
        >
          <FiCheck size={16} />
          <span>APPLY SIZE {recommendedSize} TO ORDER</span>
        </button>
      </div>
    </div>
  );
}
