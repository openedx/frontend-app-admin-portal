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
const highlightTitle = 'fake-title';
const CurrentContentHighlightItemsHeaderWrapper = (props) => (
  <Route
    path="/:enterpriseSlug/admin/content-highlights/:highlightSetUUID"
    render={routeProps => <CurrentContentHighlightItemsHeader {...routeProps} {...props} />}
  />
);

describe('<CurrentContentHighlightItemsHeader>', () => {
  it('Displays all content data titles', () => {
    const initialRouterEntry = `/test-enterprise/admin/content-highlights/${highlightSetUUID}`;
    renderWithRouter(
      <CurrentContentHighlightItemsHeaderWrapper isLoading={false} highlightTitle={highlightTitle} />,
      { route: initialRouterEntry },
    );
    expect(screen.getByText(highlightTitle)).toBeInTheDocument();
    expect(screen.getByTestId('deleteHighlightSet')).toBeInTheDocument();
  });
  it('Displays Skeleton on load', () => {
    const initialRouterEntry = `/test-enterprise/admin/content-highlights/${highlightSetUUID}`;
    renderWithRouter(
      <CurrentContentHighlightItemsHeaderWrapper isLoading highlightTitle={highlightTitle} />,
      { route: initialRouterEntry },
    );
    expect(screen.queryByText(highlightTitle)).not.toBeInTheDocument();
    expect(screen.getByTestId('header-skeleton')).toBeInTheDocument();
  });
});
