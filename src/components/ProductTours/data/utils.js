// Enable all cookies when onDismiss is called to ensure that the tour is not shown again
import Cookies from 'universal-cookie';
import {
  COOKIE_NAMES,
  PORTAL_APPEARANCE_TOUR_COOKIE_NAME,
  BROWSE_AND_REQUEST_TOUR_COOKIE_NAME,
  LEARNER_CREDIT_COOKIE_NAME,
  HIGHLIGHTS_COOKIE_NAME,
} from '../constants';

const cookies = new Cookies();

export function filterCheckpoints(checkpoints, enabledFeatures) {
  // filter out the enabled features from checkpoints leaving disabled fatures
  const enabledCheckpoints = Object.entries(enabledFeatures).filter((key) => !key[1]).map((key) => key[0]);
  // copy checkpoints and delete the disabled features
  const checkpointsCopy = checkpoints;
  enabledCheckpoints.forEach((key) => {
    delete checkpointsCopy[key];
  });
  // retrieve all existing cookies
  const allCookies = new Cookies().getAll();
  // Use filterRegex to filter all cookies that match the tour cookie names, so they won't be displayed
  const filterRegex = new RegExp(
    `(?:${PORTAL_APPEARANCE_TOUR_COOKIE_NAME}|${BROWSE_AND_REQUEST_TOUR_COOKIE_NAME}|${LEARNER_CREDIT_COOKIE_NAME}|${HIGHLIGHTS_COOKIE_NAME})`, 'g',
  );
  // filter out the cookies that match the filterRegex so they will not be displayed
  const filteredCookies = Object.entries(allCookies).filter((key) => key[0].match(filterRegex)).map((key) => key[0]);
  let indexValue = 0;
  // match the cookies to the enabled features
  const filteredCheckpointsArray = Object.keys(checkpointsCopy)
    .filter(key => key !== filteredCookies[indexValue++]).map(key => checkpointsCopy[key]);
  return filteredCheckpointsArray;
}

export default function disableAll() {
  // set all cookies to true to ensure that the tour checkpoints are not shown again
  Object.keys(COOKIE_NAMES).forEach((key) => {
    cookies.set(COOKIE_NAMES[key], true, { sameSite: 'strict' });
  });
}
