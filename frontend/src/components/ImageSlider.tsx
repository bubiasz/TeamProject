import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
type ImageSliderProps = {
  imageUrls: string[];
};

export default function ImageSlider({ imageUrls }: ImageSliderProps) {
  const [imageIndex, setImageIndex] = useState(0);

  return (
    <div className="w-96 h-96 relative">
      <img
        src={imageUrls[imageIndex]}
        className="object-cover w-full h-full block box-border"
      />
      <button
        className="absolute block top-0 bottom-0 p-4 cursor-pointer left-0"
        onClick={(e) => {
          var nextIndex =
            imageIndex - 1 < 0 ? imageUrls.length - 1 : imageIndex - 1;
          setImageIndex(nextIndex);
        }}
      >
        <FaChevronLeft />
      </button>
      <button
        className="absolute block top-0 bottom-0 p-4 cursor-pointer right-0"
        onClick={(e) => {
          var nextIndex =
            imageIndex + 1 >= imageUrls.length ? 0 : imageIndex + 1;
          setImageIndex(nextIndex);
        }}
      >
        <FaChevronRight />
      </button>
    </div>
  );
}
