import React, { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

type ImageSliderProps = {
  predictions: {
    "1": [string, string, number];
    "2": [string, string, number];
    "3": [string, string, number];
    "4": [string, string, number];
    "5": [string, string, number];
  };
};

export default function PredictionSlider({
  predictions,
}: ImageSliderProps) {
  const [predIndex, setPredIndex] = useState(0);
  const pred = [
    predictions[1],
    predictions[2],
    predictions[3],
    predictions[4],
    predictions[5],
  ];
  return (
    <div className="w-96 h-96 relative flex overflow-hidden">
      {pred.map((p) => {
        return (
          <div
            className="flex flex-col w-full h-96 transition-all grow-0 shrink-0"
            style={{
              translate: `${-100 * predIndex}%`,
            }}
          >
            <img
              src={p[1]}
              className="object-fit w-96 h-80 block box-border"
            />
            <div className="flex h-16 items-center">
              Prediction: {p[0]} <br />
              Probability: {p[2]}%
            </div>
          </div>
        );
      })}
      <button
        className="absolute block top-0 bottom-0 p-4 cursor-pointer left-0 z-50"
        onClick={(e) => {
          var nextIndex = predIndex - 1 < 0 ? 4 : predIndex - 1;
          setPredIndex(nextIndex);
        }}
      >
        <FaChevronLeft className="fill-black" />
      </button>
      <button
        className="absolute block top-0 bottom-0 p-4 cursor-pointer right-0 z-50"
        onClick={(e) => {
          var nextIndex = predIndex + 1 >= 5 ? 0 : predIndex + 1;
          setPredIndex(nextIndex);
        }}
      >
        <FaChevronRight className="fill-black" />
      </button>
    </div>
  );
}
