import { useEffect, useState } from "react";

function RiskMeter({ score = 0 }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // 🔥 Animate number
  useEffect(() => {
    let start = 0;
    const interval = setInterval(() => {
      start += 1;
      if (start >= score) {
        start = score;
        clearInterval(interval);
      }
      setAnimatedScore(start);
    }, 10);

    return () => clearInterval(interval);
  }, [score]);

  // 🔥 Color based on risk
  const getColor = () => {
    if (score < 40) return "from-green-400 to-green-600";
    if (score < 70) return "from-yellow-400 to-orange-500";
    return "from-red-500 to-red-700";
  };

  return (
    <div className="text-center">

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Risk Score
      </h3>

      <div className="relative w-40 h-40 mx-auto">

        {/* OUTER CIRCLE */}
        <div
          className={`w-full h-full rounded-full bg-gradient-to-tr ${getColor()} flex items-center justify-center shadow-lg`}
        >

          {/* INNER CIRCLE */}
          <div className="bg-white w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-inner">

            <span className="text-2xl font-bold text-gray-800">
              {animatedScore}%
            </span>

            <span className="text-xs text-gray-500 mt-1">
              Risk Level
            </span>

          </div>

        </div>

      </div>

      {/* LABEL */}
      <p className="mt-3 text-sm text-gray-500">
        {score < 40 && "Low Risk"}
        {score >= 40 && score < 70 && "Moderate Risk"}
        {score >= 70 && "High Risk"}
      </p>

    </div>
  );
}

export default RiskMeter;