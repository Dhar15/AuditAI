import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref and a boolean `visible`.
 * Once the element enters the viewport, visible flips to true and stays true.
 *
 * @param {number} threshold - 0–1, fraction of element visible before triggering
 * @param {string} rootMargin - e.g. "0px 0px -60px 0px" to trigger slightly before bottom edge
 */
export function useReveal(threshold = 0.15, rootMargin = "0px 0px -40px 0px") {
  const ref     = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, visible];
}

/**
 * Animates a number from 0 to `target` over `duration` ms.
 * Returns the current display value.
 * Only starts once `active` is true (tie to useReveal).
 */
export function useCountUp(target, duration = 1200, active = true) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start     = performance.now();
    const startVal  = 0;

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target, duration, active]);

  return value;
}