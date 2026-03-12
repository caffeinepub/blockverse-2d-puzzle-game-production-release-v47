import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Theme } from "@/pages/Game";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const TUTORIAL_DONE_KEY = "blockverse-tutorial-done";

export function isTutorialDone(): boolean {
  return localStorage.getItem(TUTORIAL_DONE_KEY) === "true";
}

export function markTutorialDone(): void {
  localStorage.setItem(TUTORIAL_DONE_KEY, "true");
}

interface TutorialStep {
  titleKey: string;
  descKey: string;
  highlightTarget: "blockpicker" | "gameboard" | "row" | "powerupbar";
  emoji: string;
}

const STEPS: TutorialStep[] = [
  {
    titleKey: "tutorial.step1.title",
    descKey: "tutorial.step1.desc",
    highlightTarget: "blockpicker",
    emoji: "👆",
  },
  {
    titleKey: "tutorial.step2.title",
    descKey: "tutorial.step2.desc",
    highlightTarget: "gameboard",
    emoji: "🎯",
  },
  {
    titleKey: "tutorial.step3.title",
    descKey: "tutorial.step3.desc",
    highlightTarget: "row",
    emoji: "✨",
  },
  {
    titleKey: "tutorial.step4.title",
    descKey: "tutorial.step4.desc",
    highlightTarget: "powerupbar",
    emoji: "⚡",
  },
];

interface TutorialOverlayProps {
  theme: Theme;
  onComplete: () => void;
}

export function TutorialOverlay({ theme, onComplete }: TutorialOverlayProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const handleNext = () => {
    if (isLast) {
      markTutorialDone();
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkip = () => {
    markTutorialDone();
    onComplete();
  };

  const getCardClass = () => {
    switch (theme) {
      case "dark":
        return "bg-gray-900 border border-gray-700 text-gray-100";
      case "neon":
        return "bg-black border-2 border-pink-500 text-pink-100 shadow-[0_0_30px_rgba(236,72,153,0.5)]";
      default:
        return "bg-white border border-purple-200 text-gray-800";
    }
  };

  const getPrimaryBtnClass = () => {
    switch (theme) {
      case "dark":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "neon":
        return "bg-pink-600 hover:bg-pink-700 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]";
      default:
        return "bg-purple-600 hover:bg-purple-700 text-white";
    }
  };

  const getStepIndicatorClass = (i: number) => {
    if (i === step) {
      switch (theme) {
        case "dark":
          return "bg-blue-500";
        case "neon":
          return "bg-pink-500";
        default:
          return "bg-purple-500";
      }
    }
    switch (theme) {
      case "dark":
        return "bg-gray-600";
      case "neon":
        return "bg-gray-700";
      default:
        return "bg-purple-200";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      data-ocid="tutorial.modal"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl ${getCardClass()}`}
        >
          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-5">
            {STEPS.map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed length tutorial steps
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? "w-6" : "w-2"
                } ${getStepIndicatorClass(i)}`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="text-5xl text-center mb-4">{current.emoji}</div>

          {/* Content */}
          <h3 className="text-xl font-bold text-center mb-2">
            {t(current.titleKey)}
          </h3>
          <p className="text-sm text-center opacity-75 mb-6">
            {t(current.descKey)}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="flex-1 opacity-60 hover:opacity-100"
              data-ocid="tutorial.cancel_button"
            >
              {t("tutorial.skip")}
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className={`flex-1 font-semibold ${getPrimaryBtnClass()}`}
              data-ocid="tutorial.confirm_button"
            >
              {isLast ? t("tutorial.start") : t("tutorial.next")}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
