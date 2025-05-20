import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import ContentHighlightToast from '../ContentHighlightToast';
import '@testing-library/jest-dom/extend-expect';

const ContentHighlightToastWrapper = ({
  ...props
}) => (
  <IntlProvider locale="en">
    <ContentHighlightToast {...props} />
  </IntlProvider>
);

describe('<ContentHighlightToast>', () => {
  it('Displays the toast', async () => {
    renderWithRouter(<ContentHighlightToastWrapper toastText="Highlights1" />);
    expect(screen.getByText('Highlights1')).toBeInTheDocument();
  });

  it('Closes the toast on button click', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ContentHighlightToastWrapper toastText="Highlights2" />);

    const closeButton = screen.getByLabelText('Close');
    expect(screen.getByRole('alert')).toBeInTheDocument();
    await user.click(closeButton);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
