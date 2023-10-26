import { breakpoints, useMediaQuery } from '@edx/paragon';

const useIsLargeOrGreater = () => useMediaQuery({ query: `(min-width: ${breakpoints.large.minWidth}px)` });

export default useIsLargeOrGreater;
