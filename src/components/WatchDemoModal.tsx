"use client";

import { useEffect, useRef, useState } from "react";

export default function WatchDemoModal({
  label = "Watch Demo",
}: { label?: string }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Focus + close on Esc
  useEffect(() => {
    if (open) dialogRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    videoRef.current?.pause();
  };

  return (
    <>
      {/* Trigger button (style matches your existing secondary CTA) */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-medium text-white hover:bg-white/20 transition-all"
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
          aria-labelledby="demo-title"
        >
          {/* Backdrop click closes modal */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={close}
          />

          {/* Dialog box */}
          <div
            ref={dialogRef}
            tabIndex={-1}
            className="relative z-10 w-[92vw] max-w-4xl rounded-2xl bg-black/80 p-3 shadow-2xl outline-none"
          >
            {/* Close button */}
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 z-20 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
              ✕
            </button>

            <h2 id="demo-title" className="sr-only">
              StockAmplify – Demo
            </h2>

            {/* 16:9 responsive video */}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <video
                onContextMenu={(e) => e.preventDefault()}
                ref={videoRef}
                className="absolute top-0 left-0 h-full w-full rounded-xl"
                //poster="/posters/stockamplify.jpg"
                controls
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                playsInline
                preload="metadata"
              >
                <source src="/videos/stockamplify-guide.mp4" type="video/mp4" />
                {/* Optional second format for better browser support */}
                {/* <source src="/videos/stockamplify-guide.webm" type="video/webm" /> */}
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
