import { breakpoints, useMediaQuery } from '@openedx/paragon';

const useIsLargeOrGreater = () => useMediaQuery({ query: `(min-width: ${breakpoints.large.minWidth}px)` });

export default useIsLargeOrGreater;
