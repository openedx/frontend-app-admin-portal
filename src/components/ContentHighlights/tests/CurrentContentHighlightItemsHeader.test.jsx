import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { Route } from 'react-router-dom';

import CurrentContentHighlightItemsHeader from '../CurrentContentHighlightItemsHeader';

jest.mock('../DeleteHighlightSet', () => ({
  __esModule: true,
  default: () => <div data-testid="deleteHighlightSet" />,
}));

const highlightSetUUID = 'fake-uuid';

function CurrentContentHighlightItemsHeaderWrapper(props) {
  return (
    <Route
      path="/:enterpriseSlug/admin/content-highlights/:highlightSetUUID"
      render={routeProps => <CurrentContentHighlightItemsHeader {...routeProps} {...props} />}
    />
  );
}

describe('<CurrentContentHighlightItemsHeader>', () => {
  it('Displays all content data titles', () => {
    const initialRouterEntry = `/test-enterprise/admin/content-highlights/${highlightSetUUID}`;
    renderWithRouter(
      <CurrentContentHighlightItemsHeaderWrapper />,
      { route: initialRouterEntry },
    );
    expect(screen.getByText(highlightSetUUID)).toBeInTheDocument();
    expect(screen.getByTestId('deleteHighlightSet')).toBeInTheDocument();
  });
});
