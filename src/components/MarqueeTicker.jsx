import React, { useEffect, useState } from "react";
import { marqueeAPI } from "../utils/api";
import "./MarqueeTicker.css";

const MarqueeTicker = () => {
  const [text, setText] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadMarquee = async () => {
      try {
        const activeMarquee = await marqueeAPI.getActive();
        if (isMounted) {
          setText(activeMarquee?.text?.trim() || "");
        }
      } catch (error) {
        console.error("Failed to load marquee:", error);
      }
    };

    loadMarquee();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!text) return null;

  return (
    <div className="site-marquee" role="status" aria-live="polite">
      <div className="site-marquee__track">
        <div className="site-marquee__group">
          <span className="site-marquee__text">{text}</span>
        </div>
        <div className="site-marquee__group" aria-hidden="true">
          <span className="site-marquee__text">{text}</span>
        </div>
      </div>
    </div>
  );
};

export default MarqueeTicker;
