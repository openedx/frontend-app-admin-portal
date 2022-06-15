import { useEffect, useRef } from 'react';

/**
 * Invokes the given callback function once when the caller is mounted.
 * This hook mimics the behavior of componentDidMount().
 * @param {*} callback function to be invoked
 */
const useOnMount = (callback) => {
  const initialMountRef = useRef(false);

  useEffect(() => {
    if (!initialMountRef.current) {
      initialMountRef.current = true;
      callback();
    }
  }, [callback]);
};

export default useOnMount;
