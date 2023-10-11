import {
  useEffect, useMemo, useState, useRef,
} from 'react';

import { CONTENT_TYPE_COURSE } from '../components/learner-credit-management/data/constants';

export function useInterval(callback, delay) {
  const savedCallback = useRef();
  useEffect(() => {
    savedCallback.current = callback;
  }, [delay, callback]);

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

export const useSelectedCourse = () => {
  const [course, setCourse] = useState(null);
  const isCourse = useMemo(
    () => course?.contentType === CONTENT_TYPE_COURSE,
    [course],
  );
  return [course, setCourse, isCourse];
};
