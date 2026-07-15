"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

const trailerSource = "/video/Trailer.mp4";

export default function TrailerVideo({ guideTarget = false }: { guideTarget?: boolean }) {
  const [open, setOpen] = useState(false);
  const playerRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  useEffect(() => {
    if (open) void playerRef.current?.play().catch(() => undefined);
  }, [open]);

  return (
    <>
      <button className="trailer-card" data-home-guide={guideTarget ? "trailer" : undefined} onClick={() => setOpen(true)} aria-label="Phóng to và xem trailer Marxopoly">
        <video src={trailerSource} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
        <span className="trailer-card-shade" />
        <span className="trailer-card-label"><b>▶ TRAILER</b><small>Nhấn để phóng to</small></span>
      </button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div className="trailer-overlay" role="dialog" aria-modal="true" aria-label="Trailer Marxopoly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
              <motion.section className="trailer-player" initial={{ y: 24, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 18, scale: .97 }} onClick={(event) => event.stopPropagation()}>
                <header><div><small>MARXOPOLY</small><strong>TRAILER GAME</strong></div><button onClick={() => setOpen(false)} aria-label="Đóng trailer">×</button></header>
                <video ref={playerRef} src={trailerSource} controls autoPlay playsInline preload="auto" />
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
