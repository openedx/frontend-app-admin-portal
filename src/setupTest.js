/* eslint-disable import/no-extraneous-dependencies */

import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

// These configuration values are usually set in webpack's EnvironmentPlugin however
// Jest does not use webpack so we need to set these so for testing
process.env.LMS_BASE_URL = 'http://localhost:18000';
process.env.DATA_API_BASE_URL = 'http://localhost:8000';
process.env.FEATURE_FLAGS = {};
