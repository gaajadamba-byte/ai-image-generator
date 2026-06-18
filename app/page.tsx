"use client";

import { useRef, useState } from "react";

type AppState = "empty" | "uploaded" | "loading" | "result";

const CATEGORY_HEADINGS = [
  "Vegetables:",
  "Proteins:",
  "Fruits:",
  "Grains/Seeds:",
  "Snacks/Treats:",
  "Other items:",
];

function FormattedResult({ text }: { text: string }) {
  return (
    <p className="text-sm text-[#09090B] leading-6 whitespace-pre-wrap">
      {text.split("\n").map((line, i) => {
        const isBold = CATEGORY_HEADINGS.includes(line.trim());
        return (
          <span key={i} className={isBold ? "font-bold" : "font-normal"}>
            {line}
            {"\n"}
          </span>
        );
      })}
    </p>
  );
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("empty");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAnalysisResult(null);
    setError(null);
    setAppState("uploaded");
  }

  function handleRemoveImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setSelectedFile(null);
    setAnalysisResult(null);
    setError(null);
    setAppState("empty");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleGenerate() {
    if (!selectedFile) return;

    setAppState("loading");
    setError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to analyze image");
      }

      setAnalysisResult(data.analysis);
      setAppState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze image");
      setAppState("uploaded");
    }
  }

  function handleReset() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setSelectedFile(null);
    setAnalysisResult(null);
    setError(null);
    setAppState("empty");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const hasImage =
    appState === "uploaded" || appState === "loading" || appState === "result";
  const isLoading = appState === "loading";
  const isResult = appState === "result";

  return (
    <div className="min-h-screen flex flex-col bg-white font-[Inter,sans-serif]">
      {/* Header */}
      <header className="flex items-center px-12 py-4 border-b border-[#E4E4E7] bg-white shrink-0">
        <span className="text-base font-semibold text-black leading-6">
          AI tools
        </span>
      </header>

      {/* Body */}
      <main className="flex flex-1 justify-center px-[180px] py-0 gap-20">
        <div className="flex flex-col w-[580px] py-6 gap-6">
          {/* Tab bar */}
          <div className="flex p-1 gap-0 bg-[#F4F4F5] rounded-lg w-fit">
            <button className="flex items-center justify-center px-3 py-1 rounded-md bg-white text-[#09090B] text-sm font-medium leading-5">
              Image analysis
            </button>
            <button
              className="flex items-center justify-center px-3 py-1 rounded-md bg-[#F4F4F5] text-[#71717A] text-sm font-medium leading-5 opacity-50 cursor-not-allowed"
              disabled
            >
              Ingredient recognition
            </button>
            <button
              className="flex items-center justify-center px-3 py-1 rounded-md bg-[#F4F4F5] text-[#71717A] text-sm font-medium leading-5 opacity-50 cursor-not-allowed"
              disabled
            >
              Image creator
            </button>
          </div>

          {/* Image analysis section */}
          <div className="flex flex-col gap-2 w-full">
            {/* Section header */}
            <div className="flex justify-between items-start w-full">
              <div className="flex items-center gap-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 3V7M19 17V21M3 5H7M17 19H21M12 3L10.088 8.813C9.99015 9.11051 9.82379 9.38088 9.60234 9.60234C9.38088 9.82379 9.11051 9.99015 8.813 10.088L3 12L8.813 13.912C9.11051 14.0099 9.38088 14.1762 9.60234 14.3977C9.82379 14.6191 9.99015 14.8895 10.088 15.187L12 21L13.912 15.187C14.0099 14.8895 14.1762 14.6191 14.3977 14.3977C14.6191 14.1762 14.8895 14.0099 15.187 13.912L21 12L15.187 10.088C14.8895 9.99015 14.6191 9.82379 14.3977 9.60234C14.1762 9.38088 14.0099 9.11051 13.912 8.813L12 3Z"
                    stroke="#09090B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xl font-semibold text-[#09090B] leading-7">
                  Image analysis
                </span>
              </div>

              {/* Reload button — disabled until result */}
              <button
                onClick={isResult ? handleReset : undefined}
                disabled={!isResult}
                className={`flex items-center justify-center h-10 px-4 gap-2 rounded-md border border-[#E4E4E7] bg-white transition-opacity ${isResult ? "opacity-100 cursor-pointer hover:bg-[#F4F4F5]" : "opacity-50 cursor-not-allowed"}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.9979 6.33122V2.80455C13.9979 2.50455 13.6379 2.35788 13.4312 2.57122L12.2446 3.75788C11.0379 2.55122 9.31789 1.85788 7.43789 2.02455C4.64456 2.27788 2.34456 4.52455 2.03789 7.31788C1.63789 10.9312 4.45789 13.9979 7.99789 13.9979C11.0579 13.9979 13.5846 11.7046 13.9512 8.74455C13.9979 8.34455 13.6846 7.99788 13.2846 7.99788C12.9512 7.99788 12.6712 8.24455 12.6312 8.57122C12.3446 10.8979 10.3379 12.6979 7.93122 12.6645C5.45789 12.6312 3.37122 10.5445 3.33122 8.06455C3.29122 5.46455 5.40456 3.33122 7.99789 3.33122C9.28456 3.33122 10.4512 3.85788 11.2979 4.69788L9.90456 6.09122C9.69122 6.30455 9.83789 6.66455 10.1379 6.66455H13.6646C13.8512 6.66455 13.9979 6.51788 13.9979 6.33122Z"
                    fill="#09090B"
                  />
                </svg>
              </button>
            </div>

            {/* Description */}
            <p className="text-sm font-normal text-[#71717A] leading-5">
              Upload a food photo, and AI will detect the ingredients.
            </p>

            {/* File upload / image preview */}
            {!hasImage ? (
              <div className="flex flex-col items-end gap-2 w-full">
                <label className="flex items-center h-10 px-3 w-full rounded-md border border-[#E4E4E7] bg-white cursor-pointer">
                  <span className="flex items-center px-2">
                    <span className="text-sm font-medium text-[#09090B] leading-5">
                      Choose File
                    </span>
                  </span>
                  <span className="text-sm text-[#71717A] leading-5">
                    JPG, PNG
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <button
                  disabled
                  className="flex items-center justify-center h-10 px-4 gap-2 rounded-md bg-[#18181B] opacity-50 cursor-not-allowed"
                >
                  <span className="text-sm font-medium text-[#FAFAFA] leading-5">
                    Generate
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                {/* Image thumbnail */}
                <div className="flex p-1 flex-col items-start gap-2 rounded-lg border border-[#E4E4E7] w-fit relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview!}
                    alt="Uploaded food"
                    className="w-[200px] h-[133px] object-cover rounded-md"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -bottom-2 -right-2 flex items-center justify-center w-6 h-6 rounded bg-white border border-[#E4E4E7] hover:bg-[#F4F4F5] transition-colors"
                    title="Remove image"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2 3.99992H14M12.6667 3.99992V13.3333C12.6667 13.9999 12 14.6666 11.3333 14.6666H4.66667C4 14.6666 3.33333 13.9999 3.33333 13.3333V3.99992M5.33333 3.99992V2.66659C5.33333 1.99992 6 1.33325 6.66667 1.33325H9.33333C10 1.33325 10.6667 1.99992 10.6667 2.66659V3.99992"
                        stroke="#09090B"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* Generate button */}
                <div className="flex justify-end w-full">
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || isResult}
                    className={`flex items-center justify-center h-10 px-4 gap-2 rounded-md bg-[#18181B] transition-opacity ${isLoading || isResult ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-90"}`}
                  >
                    <span className="text-sm font-medium text-[#FAFAFA] leading-5">
                      {isLoading ? "Generating..." : "Generate"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary section */}
          <div className="flex flex-col gap-2 flex-1 w-full">
            <div className="flex items-center gap-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14 2V8H20M16 13H8M16 17H8M10 9H8M14.5 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7.5L14.5 2Z"
                  stroke="#09090B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xl font-semibold text-black leading-6">
                Here is the summary
              </span>
            </div>

            {error ? (
              <div className="flex items-start p-3 w-full rounded-md border border-red-200 bg-red-50">
                <span className="text-sm text-red-600 leading-6">{error}</span>
              </div>
            ) : null}

            {isResult && analysisResult ? (
              <div className="flex flex-col flex-1 p-4 gap-2 rounded-lg border border-[#E4E4E7] overflow-y-auto min-h-[200px]">
                <FormattedResult text={analysisResult} />
              </div>
            ) : (
              <div className="flex items-center h-10 px-3 w-full rounded-md border border-[#E4E4E7] bg-white">
                <span className="text-sm text-[#71717A] leading-6">
                  {isLoading
                    ? "Working ..."
                    : "First, enter your image to recognize an ingredients."}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating chat button */}
      <button className="fixed bottom-9 right-9 flex items-center justify-center w-12 h-12 rounded-full bg-[#18181B] hover:opacity-90 transition-opacity shadow-lg">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 14L3.26667 10.2C2.66475 8.99653 2.51075 7.61813 2.8322 6.31148C3.15366 5.00483 3.9296 3.85522 5.02117 3.06836C6.11274 2.28151 7.44869 1.90877 8.78995 2.01685C10.1312 2.12493 11.3902 2.70678 12.3417 3.65827C13.2932 4.60976 13.8751 5.86879 13.9832 7.21005C14.0912 8.55131 13.7185 9.88726 12.9316 10.9788C12.1448 12.0704 10.9952 12.8463 9.68853 13.1678C8.38188 13.4893 7.00348 13.3353 5.8 12.7333L2 14Z"
            stroke="#FAFAFA"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
