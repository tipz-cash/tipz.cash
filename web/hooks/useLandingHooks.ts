import { useEffect, useState, useRef } from "react";

// Check for reduced motion preference
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// Hook for responsive breakpoint detection
export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}

// Hook for count-up animation
export function useCountUp(target: number, duration: number = 2500, delay: number = 400) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current || hasStarted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    // Add delay before animation starts
    const delayTimer = setTimeout(() => {
      const startTime = performance.now();
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        setCount(Math.round(easedProgress * target));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [hasStarted, target, duration, delay, prefersReducedMotion]);

  return { ref, count };
}

// Hook for count-down animation (100 → 0)
export function useCountDown(duration: number = 2500, delay: number = 400) {
  const [count, setCount] = useState(100);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current || hasStarted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    if (prefersReducedMotion) {
      setCount(0);
      return;
    }

    // Add delay before animation starts
    const delayTimer = setTimeout(() => {
      const startTime = performance.now();
      const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        setCount(Math.round(100 - (easedProgress * 100)));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(delayTimer);
  }, [hasStarted, duration, delay, prefersReducedMotion]);

  return { ref, count };
}

// Hook for parallax scroll effect
export function useParallax(speed: number = 0.5) {
  const [offset, setOffset] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setOffset(window.scrollY * speed);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, prefersReducedMotion]);

  return offset;
}

// Typing effect hook
export function useTypingEffect(text: string, speed: number = 50, delay: number = 0) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayText(text);
      setIsComplete(true);
      return;
    }

    let index = 0;
    setDisplayText("");
    setIsComplete(false);

    const startTimer = setTimeout(() => {
      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(timer);
        }
      }, speed);

      return () => clearInterval(timer);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [text, speed, delay, prefersReducedMotion]);

  return { displayText, isComplete };
}

// Premium typing effect hook with human-like rhythm
export function usePremiumTypingEffect(
  text: string,
  options: {
    baseSpeed?: number;
    varianceRange?: number;
    pauseOnSpace?: number;
    pauseOnPunctuation?: number;
    accelerationCurve?: boolean;
    initialDelay?: number;
    reducedMotion?: boolean;
  } = {}
) {
  const {
    baseSpeed = 55,
    varianceRange = 25,
    pauseOnSpace = 80,
    pauseOnPunctuation = 150,
    accelerationCurve = true,
    initialDelay = 400,
    reducedMotion: reducedMotionOverride,
  } = options;

  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [newCharIndex, setNewCharIndex] = useState(-1);
  const systemPrefersReducedMotion = usePrefersReducedMotion();
  // Use override if provided, otherwise fall back to system preference
  const prefersReducedMotion = reducedMotionOverride ?? systemPrefersReducedMotion;

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayText(text);
      setIsComplete(true);
      return;
    }

    let index = 0;
    setDisplayText("");
    setIsComplete(false);
    setNewCharIndex(-1);

    // Track all timer IDs for proper cleanup
    const timerIds: NodeJS.Timeout[] = [];

    const getNextDelay = (char: string, position: number) => {
      // Base speed with random variance for organic feel
      let delay = baseSpeed + (Math.random() - 0.5) * varianceRange * 2;

      // Acceleration curve: starts 40% slower, speeds up mid-sentence
      if (accelerationCurve) {
        const progress = position / text.length;
        // Slow start, fast middle, slight deceleration at end
        const curveMultiplier =
          progress < 0.2
            ? 1.4 - progress * 2 // 1.4 -> 1.0 in first 20%
            : progress > 0.8
            ? 0.95 + (progress - 0.8) * 0.5 // slight slowdown at end
            : 1.0;
        delay *= curveMultiplier;
      }

      // Natural pauses on word boundaries
      if (char === " ") {
        delay += pauseOnSpace;
      }

      // Dramatic pauses on punctuation
      if ([",", ".", "!", "?", ";", ":"].includes(char)) {
        delay += pauseOnPunctuation;
      }

      return delay;
    };

    const typeNextChar = () => {
      if (index < text.length) {
        const currentChar = text[index];
        setDisplayText(text.slice(0, index + 1));
        setNewCharIndex(index);
        index++;

        const delay = getNextDelay(currentChar, index);
        const timerId = setTimeout(typeNextChar, delay);
        timerIds.push(timerId);
      } else {
        setIsComplete(true);
        setNewCharIndex(-1);
      }
    };

    const startTimer = setTimeout(() => {
      typeNextChar();
    }, initialDelay);
    timerIds.push(startTimer);

    // Clear ALL timers on cleanup to prevent memory leaks
    return () => timerIds.forEach(clearTimeout);
  }, [text, baseSpeed, varianceRange, pauseOnSpace, pauseOnPunctuation, accelerationCurve, initialDelay, prefersReducedMotion]);

  return { displayText, isComplete, newCharIndex };
}

// Intersection Observer hook for scroll animations
export function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isInView };
}

// Typing effect that triggers on view
export function useTypingOnView(text: string, speed: number = 35) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    let observer: IntersectionObserver | null = null;

    // Use requestAnimationFrame to ensure layout is complete before checking visibility
    const checkVisibility = () => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (isVisible) {
        setIsInView(true);
      } else {
        // Only set up observer if not already visible
        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer?.disconnect();
            }
          },
          { threshold: 0.05 } // Very low threshold for reliable triggering
        );
        observer.observe(element);
      }
    };

    // Wait for next frame to ensure layout is complete
    requestAnimationFrame(checkVisibility);

    return () => observer?.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || hasStarted) return;

    if (prefersReducedMotion) {
      setDisplayText(text);
      setIsComplete(true);
      setHasStarted(true);
      return;
    }

    setHasStarted(true);
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [isInView, hasStarted, text, speed, prefersReducedMotion]);

  return { ref, displayText, isComplete, hasStarted };
}

// Hook to track current chapter
export function useCurrentChapter(chapterList: { id: string; num: string; title: string }[]) {
  const [currentChapter, setCurrentChapter] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    chapterList.forEach((chapter, index) => {
      const element = document.getElementById(chapter.id);
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setCurrentChapter(index);
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach(obs => obs.disconnect());
  }, [chapterList]);

  return currentChapter;
}

// Dashboard animation hook — counting stats, staggered activity feed, periodic live tips
export type ActivityItem = { amount: string; time: string; hasMemo: boolean; visible: boolean };

export function useDashboardAnimation(inView: boolean, reducedMotion: boolean) {
  const FINAL_TIPS = 47;
  const FINAL_ZEC = 12.84;
  const FINAL_USD = 583.2;
  const FINAL_PROGRESS = 65;
  const TICK_MS = 40;
  const PHASE1_TICKS = 50; // 2s at 40ms
  const PHASE2_START = 2000;
  const PHASE3_START = 3500;
  const PHASE3_INTERVAL = 6000;

  const initialActivity: ActivityItem[] = [
    { amount: "+0.42 ZEC", time: "2m ago", hasMemo: true, visible: false },
    { amount: "+1.05 ZEC", time: "18m ago", hasMemo: false, visible: false },
    { amount: "+0.15 ZEC", time: "1h ago", hasMemo: true, visible: false },
  ];

  const [tipCount, setTipCount] = useState(0);
  const [zecTotal, setZecTotal] = useState(0);
  const [usdValue, setUsdValue] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>(initialActivity);
  const [flashTipCount, setFlashTipCount] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;

    // Reduced motion: show final values immediately
    if (reducedMotion) {
      setTipCount(FINAL_TIPS);
      setZecTotal(FINAL_ZEC);
      setUsdValue(FINAL_USD);
      setProgressPct(FINAL_PROGRESS);
      setActivityItems(initialActivity.map(item => ({ ...item, visible: true })));
      return;
    }

    // Phase 1: Ease-out counting (fast start, slow finish)
    let tick = 0;
    const phase1 = setInterval(() => {
      tick++;
      // ease-out: 1 - (1 - t)^3
      const t = Math.min(tick / PHASE1_TICKS, 1);
      const eased = 1 - Math.pow(1 - t, 3);

      setTipCount(Math.round(eased * FINAL_TIPS));
      setZecTotal(eased * FINAL_ZEC);
      setUsdValue(eased * FINAL_USD);
      setProgressPct(eased * FINAL_PROGRESS);

      if (tick >= PHASE1_TICKS) clearInterval(phase1);
    }, TICK_MS);

    // Phase 2: Stagger activity items
    const staggerTimers = initialActivity.map((_, i) =>
      setTimeout(() => {
        setActivityItems(prev => prev.map((item, j) =>
          j === i ? { ...item, visible: true } : item
        ));
      }, PHASE2_START + i * 500)
    );

    // Phase 3: Periodic new tip arrivals
    const randomTipAmounts = [0.08, 0.22, 0.35, 0.12, 0.47, 0.18, 0.31, 0.09, 0.55, 0.14];
    const randomTipTimes = ["just now", "1s ago", "just now", "2s ago", "just now"];
    let arrivalIndex = 0;

    const phase3Timer = setTimeout(() => {
      const phase3 = setInterval(() => {
        const zecBump = randomTipAmounts[arrivalIndex % randomTipAmounts.length];
        const timeLabel = randomTipTimes[arrivalIndex % randomTipTimes.length];
        const hasMemo = arrivalIndex % 3 === 0;
        arrivalIndex++;

        // Increment counters
        setTipCount(prev => prev + 1);
        setZecTotal(prev => prev + zecBump);
        setUsdValue(prev => prev + zecBump * (FINAL_USD / FINAL_ZEC));

        // Flash tip count green
        setFlashTipCount(true);
        setTimeout(() => setFlashTipCount(false), 200);

        // Add new activity item at top, keep max 3 visible
        setActivityItems(prev => {
          const newItem: ActivityItem = {
            amount: `+${zecBump.toFixed(2)} ZEC`,
            time: timeLabel,
            hasMemo,
            visible: true,
          };
          return [{ ...newItem, visible: false }, ...prev.slice(0, 2)];
        });
        // Trigger fade-in on next frame
        requestAnimationFrame(() => {
          setActivityItems(prev => prev.map((item, i) =>
            i === 0 ? { ...item, visible: true } : item
          ));
        });
      }, PHASE3_INTERVAL);

      return () => clearInterval(phase3);
    }, PHASE3_START);

    return () => {
      clearInterval(phase1);
      staggerTimers.forEach(t => clearTimeout(t));
      clearTimeout(phase3Timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reducedMotion]);

  return {
    tipCount,
    zecTotal: zecTotal.toFixed(4),
    usdValue: usdValue.toFixed(2),
    progressPct,
    activityItems,
    flashTipCount,
  };
}
