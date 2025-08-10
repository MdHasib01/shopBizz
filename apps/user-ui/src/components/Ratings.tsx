import React from "react";
import { Star } from "lucide-react";

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}

const Rating: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  size = 20,
  className = "",
  showValue = false,
}) => {
  // Clamp rating between 0 and maxRating
  const clampedRating = Math.max(0, Math.min(rating, maxRating));

  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= clampedRating;
    const isHalfFilled = i - 0.5 === clampedRating;

    stars.push(
      <div key={i} className="relative inline-block">
        {/* Background star (empty) */}
        <Star size={size} className="text-gray-300" fill="currentColor" />

        {/* Filled star */}
        {(isFilled || isHalfFilled) && (
          <Star
            size={size}
            className={`absolute top-0 left-0 text-yellow-400 ${
              isHalfFilled ? "w-1/2 overflow-hidden" : ""
            }`}
            fill="currentColor"
            style={isHalfFilled ? { clipPath: "inset(0 50% 0 0)" } : {}}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex">{stars}</div>
      {showValue && (
        <span className="ml-2 text-sm text-gray-600">
          {rating.toFixed(1)} / {maxRating}
        </span>
      )}
    </div>
  );
};

export default Rating;
