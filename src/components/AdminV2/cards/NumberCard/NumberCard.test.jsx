import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Groups } from '@openedx/paragon/icons';
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import NumberCard from './index';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn().mockReturnValue({ pathname: '/admin' }),
}));

const NumberCardWrapper = () => (
  <MemoryRouter>
    <IntlProvider locale="en">
      <NumberCard
        title={10}
        description="This describes the data!"
        icon={Groups}
        detailActions={
          [{
            label: 'Action 1',
            slug: 'action-1',
            isLoading: false,
          }, {
            label: 'Action 2',
            slug: 'action-2',
            isLoading: false,
          }]
        }
      />
    </IntlProvider>
  </MemoryRouter>
);

describe('<NumberCard />', () => {
  it('without detail actions', () => {
    render(
      <NumberCardWrapper />,
    );
    expect(screen.getByText('This describes the data!')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });
});
