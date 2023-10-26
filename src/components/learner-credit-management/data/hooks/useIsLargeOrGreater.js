import { useMediaQuery } from 'react-router-dom';
import { breakpoints } from '@edx/paragon';

const useIsLargeOrGreater = () => useMediaQuery({ query: `(min-width: ${breakpoints.large.minWidth}px)` });

export default useIsLargeOrGreater;
