import React from 'react';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { render, screen } from '@testing-library/react';
import ForbiddenPage from './index';
import '@testing-library/jest-dom/extend-expect';

describe('<ForbiddenPage />', () => {
  it('renders correctly', () => {
    render(
      <IntlProvider locale="en">
        <ForbiddenPage />
      </IntlProvider>,
    );
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByText('You do not have access to this page.')).toBeInTheDocument();
  });
});
