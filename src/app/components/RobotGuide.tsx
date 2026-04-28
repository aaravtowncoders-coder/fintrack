import { Sparkles, X, ChevronRight, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { AnimatedRobot } from "./AnimatedRobot";

interface RobotGuideProps {
  message?: string;
  messages?: string[];
  position?: "bottom-right" | "bottom-left" | "inline";
  tips?: string[];
  title?: string;
}

export function RobotGuide({
  message,
  messages,
  position = "bottom-right",
  tips,
  title = "Your Financial Assistant",
}: RobotGuideProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const allMessages = messages || (message ? [message] : ["Hello! I'm your AI finance assistant. Let me help you track your finances!"]);

  const currentMessage = allMessages[currentIndex];
  const hasMultiple = allMessages.length > 1;

  const nextMessage = () => setCurrentIndex((i) => (i + 1) % allMessages.length);
  const prevMessage = () => setCurrentIndex((i) => (i - 1 + allMessages.length) % allMessages.length);

  if (!isVisible && position !== "inline") return null;

  if (position === "inline") {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-teal-500/10 border border-blue-500/20 backdrop-blur-xl p-6">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <AnimatedRobot size="md" animate={true} />
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex-1 pt-2">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                {title}
              </h3>
            </div>
            <p className="text-sm text-gray-300 mb-3 leading-relaxed">{currentMessage}</p>
            {tips && tips.length > 0 && (
              <div className="space-y-2">
                {tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-xs text-gray-400 bg-gray-800/40 rounded-lg p-2"
                  >
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
            {hasMultiple && (
              <div className="flex items-center gap-2 mt-3">
                <button onClick={prevMessage} className="p-1 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
                <span className="text-xs text-gray-500">{currentIndex + 1} / {allMessages.length}</span>
                <button onClick={nextMessage} className="p-1 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 max-w-xs`}
      style={{ animation: "slideInBot 0.5s ease-out" }}
    >
      <style>{`
        @keyframes slideInBot {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="rounded-2xl bg-gradient-to-br from-gray-900/98 to-gray-950/98 backdrop-blur-xl border border-blue-500/30 p-4 shadow-2xl shadow-blue-500/20">
        <div className="flex gap-3 items-start">
          <div className="relative flex-shrink-0">
            <AnimatedRobot size="sm" animate={true} />
            <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-gray-900" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-start justify-between mb-1">
              <p className="text-xs text-blue-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Quick Tip
              </p>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-white transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-white leading-relaxed">{currentMessage}</p>
            {hasMultiple && (
              <div className="flex items-center gap-1 mt-2">
                {allMessages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === currentIndex ? "bg-blue-400 w-3" : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
