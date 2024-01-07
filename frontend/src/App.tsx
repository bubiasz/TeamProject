import React, { useState } from "react";
import ReactDOM from "react-dom";

import "./index.scss";
import { Background } from "./components/Background";
import { Input } from "react-daisyui";
import { IoSend } from "react-icons/io5";
import axios, { HttpStatusCode } from "axios";
import ImageSlider from "./components/ImageSlider";

type Response = {
  predictions: {
    "1": [string, number];
    "2": [string, number];
    "3": [string, number];
    "4": [string, number];
    "5": [string, number];
  };
  original_img_url: string;
  scaled_img_url: string;
  activation_urls: string[];
};


const App = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>("");

  const [response, setResponse] = useState<Response | null>(null);
  async function getPrediction() {
    var formdata = new FormData();
    if (!file) {
      return;
    }
    formdata.append("photo", file, "/C:/Users/Piotr/Pictures/goodkid.png");
    await axios
      .post<Response>("http://3.79.99.236:8000/upload", formdata)
      .then((res) => {
        if (res.status != HttpStatusCode.Ok) {
          return;
        }
        setResponse(res.data);
        console.log(res.data);
      });
  }

  return (
    <div className="snap-y snap-mandatory h-screen overflow-y-scroll scroll-smooth">
      <Background />
      <section className="relative h-screen snap-start">
        <section
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-all ${
            response != null ? "-translate-x-[calc(100%+1rem)]" : ""
          }`}
        >
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
                  setResponse(null)
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
        <section
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all ${
            response != null ? "translate-x-4" : ""
          }`}
        >
          {" "}
          <div className="w-96 h-96 aspect-square bg-slate-900 flex flex-col rounded-md box-content p-2">
            <div className="grow flex items-center justify-center w-96">
              {response ? (
                <div>
                  <img
                    src={response.scaled_img_url}
                    className="object-cover w-96 h-80"
                  />
                  <div className="flex h-16 items-center">
                    Prediction: {response.predictions[1][0]} <br />
                    Probability: {response.predictions[1][1]}%
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
        <section className="grid items-center h-screen snap-start">
          <div className="grid grid-cols-2 place-items-center bg-slate-900 rounded-md p-2">
            <ImageSlider imageUrls={response.activation_urls} />
            <div className="flex flex-col items-center">
              <div className="flex gap-2">
                <div>Prediction: {response.predictions[2][0]}</div>
                <div>Probability: {response.predictions[2][1]}%</div>
              </div>
              <div className="flex gap-2">
              <div>Prediction: {response.predictions[3][0]}</div>
                <div>Probability: {response.predictions[3][1]}%</div>
              </div>
              <div className="flex gap-2">
              <div>Prediction: {response.predictions[4][0]}</div>
                <div>Probability: {response.predictions[4][1]}%</div>
              </div>
              <div className="flex gap-2">
              <div>Prediction: {response.predictions[5][0]}</div>
                <div>Probability: {response.predictions[5][1]}%</div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <></>
      )}
    </div>
  );
};
ReactDOM.render(<App />, document.getElementById("app"));
