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
    const toastContainerClassesBefore = screen.getByRole('alert').className;
    expect(toastContainerClassesBefore.match(/show/)).toBeTruthy();

    await userEvent.click(closeButton);

    const toastContainerClassesAfter = screen.getByRole('alert').className;
    expect(toastContainerClassesAfter.match(/show/)).toBeFalsy();
  });
});
