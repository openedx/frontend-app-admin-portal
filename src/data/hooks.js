import { useEffect, useRef } from 'react';

export function useInterval(callback, delay) {
  const savedCallback = useRef();
  useEffect(() => {
    savedCallback.current = callback;
  }, [delay]);

  /* eslint-disable-next-line */
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => {
        clearInterval(id);
      };
    }
  }, [callback, delay]);
}

/* eslint-disable-next-line */
export function useTimeout(callback, delay) {
  const timeoutIdRef = useRef();
  useEffect(() => {
    timeoutIdRef.current = callback;
  }, [callback]);

  /* eslint-disable-next-line */
  useEffect(() => {
    const tick = () => {
      timeoutIdRef.current();
    };
    if (delay !== null) {
      const timeoutId = setTimeout(tick, delay);
      return () => {
        clearTimeout(timeoutId);
      };
    }
    timeoutIdRef.current = null;
  }, [callback, delay]);
}
