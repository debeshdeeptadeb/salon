import { useEffect, useRef } from "react";

/**
 * Runs whenever the visitor's public salon context may have changed:
 * once on mount and on every `publicSalonChanged` event (localStorage `publicSalonSlug`).
 */
export function useOnPublicSalonChange(callback) {
  const ref = useRef(callback);
  ref.current = callback;

  useEffect(() => {
    const run = () => ref.current();
    run();
    window.addEventListener("publicSalonChanged", run);
    return () => window.removeEventListener("publicSalonChanged", run);
  }, []);
}
