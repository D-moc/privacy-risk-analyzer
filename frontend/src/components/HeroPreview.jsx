import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import dashboard from "../assets/dashboard-preview.png";
import history from "../assets/history-preview.png";
import report from "../assets/report-preview.png";
import extension from "../assets/extension-preview.png";

function HeroPreview() {
  const slides = [
    {
      title: "Dashboard",
      image: dashboard,
    },
    {
      title: "History",
      image: history,
    },
    {
      title: "AI Report",
      image: report,
    },
    {
      title: "Chrome Extension",
      image: extension,
    },
  ];

  const [current, setCurrent] =
    useState(0);

  useEffect(() => {
    const interval =
      setInterval(() => {
        setCurrent(
          (prev) =>
            (prev + 1) %
            slides.length
        );
      }, 3000);

    return () =>
      clearInterval(interval);
  }, []);

  return (
    <div className="hidden lg:block w-full max-w-xl">

      <div
        className="
          bg-white
          border
          border-slate-200
          rounded-3xl
          overflow-hidden
          shadow-xl
        "
      >

        {/* Browser Top */}

        <div
          className="
            h-12
            border-b
            border-slate-200
            flex
            items-center
            px-4
            gap-2
            bg-slate-50
          "
        >
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />

          <span className="ml-3 text-sm text-slate-500">
            PrivacyLens - {slides[current].title}
          </span>
        </div>

        {/* Screenshot */}

        <div className="h-[320px] bg-slate-100">

          <AnimatePresence mode="wait">

            <motion.img
              key={current}
              src={slides[current].image}
              alt=""
              className="
                w-full
                h-full
                object-cover
              "
              initial={{
                opacity: 0,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.4,
              }}
            />

          </AnimatePresence>

        </div>

      </div>

      {/* Dots */}

      <div className="flex justify-center gap-2 mt-4">

        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() =>
              setCurrent(index)
            }
            className={`
              h-2.5
              rounded-full
              transition-all
              ${
                current === index
                  ? "w-8 bg-cyan-500"
                  : "w-2.5 bg-slate-300"
              }
            `}
          />
        ))}

      </div>

    </div>
  );
}

export default HeroPreview;