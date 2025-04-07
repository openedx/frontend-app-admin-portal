import React from 'react';
import { screen } from '@testing-library/react';
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
    renderWithRouter(<ContentHighlightToastWrapper toastText="Highlights2" />);

    const closeButton = screen.getByLabelText('Close');

    const toastContainer = screen.getByText('Highlights2').closest('[role="alert"]');
    const toastContainerClassesBefore = toastContainer.className;
    expect(toastContainerClassesBefore.match(/show/)).toBeTruthy();

    userEvent.click(closeButton);

    const toastContainerClassesAfter = toastContainer.className;
    expect(toastContainerClassesAfter.match(/show/)).toBeFalsy();
  });
});
