"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onFinish, 5200);
    return () => window.clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.main className="splash-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="splash-grid" aria-hidden="true" />
      <div className="takeover-scene" aria-hidden="true">
        <div className="market-orbit orbit-one"><i>NHÀ ĐẤT</i><i>CÔNG NGHỆ</i><i>VẬN TẢI</i></div>
        <div className="market-orbit orbit-two"><i>TÀI CHÍNH</i><i>SẢN XUẤT</i><i>QUỐC TẾ</i></div>
        <div className="business-person">
          <span className="person-head" />
          <span className="person-body"><b /></span>
          <span className="briefcase">M&amp;A</span>
        </div>
        <div className="takeover-bars">
          <i style={{ "--bar": "36%" } as React.CSSProperties} />
          <i style={{ "--bar": "54%" } as React.CSSProperties} />
          <i style={{ "--bar": "74%" } as React.CSSProperties} />
          <i style={{ "--bar": "96%" } as React.CSSProperties} />
        </div>
        <div className="market-share"><small>THỊ PHẦN</small><strong>82%</strong><span><i /></span></div>
      </div>
      <section className="splash-copy">
        <p>CHIẾN LƯỢC • THÂU TÓM • DẪN ĐẦU</p>
        <h1>MARX<span>OPOLY</span></h1>
        <div className="splash-progress"><i /></div>
        <small>Thiết kế &amp; phát triển bởi <b>NgnHung</b></small>
      </section>
      <button className="splash-skip" onClick={onFinish}>Vào game <span>→</span></button>
    </motion.main>
  );
}
