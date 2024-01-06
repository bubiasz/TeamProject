import React, { useState } from "react";
import ReactDOM from "react-dom";

import "./index.scss";
import { Background } from "./components/background";
import { Input } from "react-daisyui";
import { IoSend } from "react-icons/io5";
import axios, { HttpStatusCode } from "axios";

type Response = {
  predictions: Map<string, [string, number]>;
  original_img_url: string;
  scaled_img_url: string;
  activation_urls: string;
};

const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");

  const [response, setResponse] = useState<Response | null>(null);
  async function getPrediction() {
    const map = new Map<string, [string, number]>();
    const r: Response = {
      predictions: map,
      activation_urls: "",
      original_img_url: "",
      scaled_img_url: "",
    };
    setResponse(r);
    /*var formdata = new FormData();
   if (!file) {
      return;
    }
    formdata.append("photo", file, "/C:/Users/Piotr/Pictures/goodkid.png");

    var requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    fetch("http://3.79.99.236:8000/upload", {
      method: "POST",
      body: formdata,
      redirect: "follow"
    })
      .then((r) => r.text())
      .then((result) => console.log(result))
      .catch((error) => console.log("error", error));
    */
  }

  return (
    <div className="snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth">
      <Background />
      <section className="grid grid-cols-2 place-items-center h-screen snap-start">
        <section>
          <div className="w-96 h-96 aspect-square bg-slate-900 flex flex-col rounded-md box-content p-2">
            <div className="grow flex items-center justify-center">
              {file ? (
                <img src={fileUrl} className="w-full object-cover h-80" />
              ) : (
                <div className="text-center"> No image provided </div>
              )}
            </div>
            <form
              className="flex gap-2 items-center h-16 min-h-16"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!file || !["image/jpeg", "image/png"].includes(file.type)) {
                  return; //later add notification for not supported type
                }
                await getPrediction();
              }}
            >
              <Input
                type="file"
                className="file-input file-input-ghost w-full"
                onChange={(e) => {
                  if (!e.target.files || e.target.files.length <= 0) {
                    setFile(null);
                    setFileUrl("");
                    return;
                  }
                  setFile(e.target.files[0]);
                  setFileUrl(URL.createObjectURL(e.target.files[0]));
                }}
              />
              <button type="submit">
                <IoSend className="w-10 h-10 hover:fill-gray-500 active:scale-95" />
              </button>
            </form>
          </div>
        </section>
        <section>
          <div className="w-96 h-96 aspect-square bg-slate-900 flex flex-col rounded-md box-content p-2">
            <div className="grow flex items-center justify-center w-96">
              {response ? (
                <div>
                  <img src={fileUrl} className="object-cover w-96 h-80" />
                  <div className="flex h-16 items-center">
                    {" "}
                    Prediction: Mallard <br /> Probability: 12.41%
                  </div>
                </div>
              ) : (
                <div className="text-center"> No image provided </div>
              )}
            </div>
          </div>
        </section>
      </section>
      {response ? (
        <section className="grid grid-cols-2 place-items-center h-screen snap-start">
          <div className="carousel w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9,10].map((i) => {
              var next = i + 1, prev = i-1
              if (next >= 10) next = 0
              if (prev <= 0 ) prev = 10
              return (
                <div id={`#slide${i}`} className="carousel-item relative w-full">
                  <img
                    src={`/prototype_activation_map_by_top-${i}_prototype.png`}
                    className="w-full"
                  />
                  <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
                    <a href={`#slide${prev}`} className="btn btn-circle">
                      ❮
                    </a>
                    <a href={`#slide${next}`} className="btn btn-circle">
                      ❯
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <></>
      )}
    </div>
  );
};
ReactDOM.render(<App />, document.getElementById("app"));
