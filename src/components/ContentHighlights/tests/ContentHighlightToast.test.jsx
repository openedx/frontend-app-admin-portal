import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import ContentHighlightToast from '../ContentHighlightToast';

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
    expect(screen.getByText('Highlights1')).toBeTruthy();
  });
  it('Closes the toast on button click', async () => {
    renderWithRouter(<ContentHighlightToastWrapper toastText="Highlights2" />);

    const closeButton = screen.getByLabelText('Close');
    const toastContainerClassesBefore = screen.getAllByRole('alert')[1].className;

    expect(toastContainerClassesBefore.match(/show/)).toBeTruthy();

    userEvent.click(closeButton);
    const toastContainerClassesAfter = screen.getAllByRole('alert')[1].className;

    expect(toastContainerClassesAfter.match(/show/)).toBeFalsy();
  });
});
