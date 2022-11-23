import { COOKIE_NAMES } from '../constants';

// Filter enabled features prescreened for cookie to populate tour array
export function filterCheckpoints(checkpoints, enabledFeatures) {
  const filteredCheckpoints = [];
  Object.keys(checkpoints).forEach((checkpoint) => {
    if (enabledFeatures[checkpoint]) {
      filteredCheckpoints.push(checkpoints[checkpoint]);
    }
  });

  return filteredCheckpoints;
}

// Enable all cookies when onDismiss is called to ensure that the tour is not shown again
export function disableAll() {
  // set all cookies to true to ensure that the tour checkpoints are not shown again
  Object.keys(COOKIE_NAMES).forEach((key) => {
    global.localStorage.setItem(COOKIE_NAMES[key], true);
  });
}
