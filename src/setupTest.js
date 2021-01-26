/* eslint-disable import/no-extraneous-dependencies */
import axios from 'axios';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axios.isAccessTokenExpired = jest.fn();
axios.isAccessTokenExpired.mockReturnValue(false);

// TODO: Once there are no more console errors in tests, uncomment the code below
// const { error } = global.console;

// global.console.error = (...args) => {
//   error(...args);
//   throw new Error(args.join(' '));
// };
