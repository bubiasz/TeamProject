import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toast } from "react-toastify/dist/types";

type ImageDisplayerProps = {
  imageUrls: string[];
};

const ImageDisplayer: React.FC<ImageDisplayerProps> = ({ imageUrls }) => {
  const [selectedImages, setSelectedImages] = useState(new Set<string>());
  const [sendingStatus, setSendingStatus] = useState<string>("");
  const [sent, setSent] = useState<boolean>(false);

  const toggleSelectImage = (url: string) => {
    setSelectedImages((prevSelectedImages) => {
      const newSelectedImages = new Set(prevSelectedImages);
      if (newSelectedImages.has(url)) {
        newSelectedImages.delete(url);
      } else {
        newSelectedImages.add(url);
      }
      return newSelectedImages;
    });
  };

  const handleSubmit = async () => {
    const t = toast("Sending heatmaps!", {
      position: "top-right",
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      autoClose: false,
    });

    if (selectedImages.size === 0) {
      toast.update(t, {
        render: "Please select at least one image to send",
        type: "error",
        autoClose: 1000,
      });
      return;
    }

    if (sent) {
         toast.update(t, {
        render: "You have already sent the heatmaps!",
        type: "error",
        autoClose: 1000,
      });
      return;
    }

    try {
      setSendingStatus("Sending...");

      const response = await fetch("http://127.0.0.1:8000/heatmap_picker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ images: Array.from(selectedImages) }),
      });

      if (!response.ok) {
        throw new Error("Error while sending images");
      }

      const data = await response.json();

      setSent(true);

      toast.update(t, {
        render: "Images sent successfully!",
        autoClose: 1000,
      });
    } catch (error) {
      console.error("Error:", error);
      toast.update(t, {
        render: "Error while sending images",
        type: "error",
        autoClose: 1000,
      });
    } finally {
      setSendingStatus("");
    }
  };

  return (
    <div className="relative w-full h-auto">
      <div className="grid grid-cols-5 grid-rows-2 gap-4 p-4">
        {imageUrls.map((url) => {
          const isSelected = selectedImages.has(url);
          return (
            <div key={url} className="relative group">
              <div className="transition duration-300 ease-in-out cursor-pointer hover:opacity-75 hover:scale-105 hover:rotate-1 hover:shadow-outline">
                <img
                  src={url}
                  className="object-cover w-full h-full block box-border"
                  alt="Image"
                  onClick={() => toggleSelectImage(url)}
                />
                {isSelected && (
                  <div className="absolute top-1 right-1 text-lg opacity-100 transition-opacity duration-300 ease-in-out">
                    <FaCheckCircle className="text-green-500" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center items-center relative">
        <button
          onClick={() => handleSubmit()}
          className="absolute top-16 p-6 cursor-pointer bg-[#0b0b0b] hover:bg-gray-800 text-white font-bold py-4 px-16 border border-gray-800 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Send
        </button>
        {sendingStatus && (
          <div className="absolute top-24 bg-gray-800 text-white p-2 rounded-md">
            {sendingStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDisplayer;
