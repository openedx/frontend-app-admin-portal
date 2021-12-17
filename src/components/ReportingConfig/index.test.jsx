import React from 'react';
import { mount } from 'enzyme';
import ReportingConfig from './index';

const defaultProps = {
  location: {
    state: { hasRequestedCodes: true },
  },
  match: { path: 'foobar' },
  history: { replace: jest.fn() },
  enterpriseId: 'enterpriseFoobar',
};

describe('<ReportingConfig /> ', () => {
  it('properly removes forms on delete', () => {
    const wrapper = mount(<ReportingConfig {...defaultProps} />);
    const configUuidToDelete = 'fake enterprise uuid';
    wrapper.setState(
      {
        reportingConfigs: [
          { uuid: configUuidToDelete },
          { uuid: 'foo' },
          { uuid: 'bar' },
        ],
      },
    );
    // Make sure deleteConfig doesn't blow things up
    wrapper.instance().deleteConfig(configUuidToDelete);
  });
});
