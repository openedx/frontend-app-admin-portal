// Enable all cookies when onDismiss is called to ensure that the tour is not shown again
import Cookies from 'universal-cookie';
import { COOKIE_NAMES } from '../constants';

const cookies = new Cookies();

export default function disableAll() {
  Object.keys(COOKIE_NAMES).forEach((key) => {
    cookies.set(COOKIE_NAMES[key], true, { sameSite: 'strict' });
  });
}
