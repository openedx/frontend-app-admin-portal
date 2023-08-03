import {
  render, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { Icon } from '@edx/paragon';
import { School } from '@edx/paragon/icons';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import IconLink from './IconLink';

const mockStore = configureMockStore([thunk]);
const store = mockStore({});

const IconLinkWrapper = props => (
  <MemoryRouter>
    <Provider store={store}>
      <IconLink
        {...props}
      />
    </Provider>
  </MemoryRouter>
);
describe('<IconLink />', () => {
  it('renders with internal route when external is false (the default)', () => {
    const defaultProps = {
      title: 'Internal Route',
      to: 'admin/test',
      icon: <Icon src={School} />,
    };
    render(<IconLinkWrapper {...defaultProps} />);
    expect(screen.getByText('Internal Route').closest('a')).toHaveAttribute('href', '/admin/test');
  });

  it('renders with full external path when external is true', () => {
    const defaultProps = {
      title: 'External Route',
      to: 'http://helpcenter.edx.org/us',
      icon: <Icon src={School} />,
      external: true,
    };

    render(<IconLinkWrapper {...defaultProps} />);
    expect(screen.getByText('External Route').closest('a')).toHaveAttribute('href', 'http://helpcenter.edx.org/us');
    expect(screen.getByText('External Route').closest('a')).toHaveAttribute('target', '_blank');
  });
});
