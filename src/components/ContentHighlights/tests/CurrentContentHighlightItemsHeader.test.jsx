import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { MemoryRouter, Route, Routes } from 'react-router-dom';

import CurrentContentHighlightItemsHeader from '../CurrentContentHighlightItemsHeader';

jest.mock('../DeleteHighlightSet', () => ({
  __esModule: true,
  default: () => <div data-testid="deleteHighlightSet" />,
}));

const highlightSetUUID = 'fake-uuid';
const highlightTitle = 'fake-title';
const CurrentContentHighlightItemsHeaderWrapper = (props) => (
  <MemoryRouter initialEntries={[`/test-enterprise/admin/content-highlights/${highlightSetUUID}`]}>
    <Routes>
      <Route
        path="/:enterpriseSlug/admin/content-highlights/:highlightSetUUID"
        element={<CurrentContentHighlightItemsHeader {...props} />}
      />
    </Routes>
  </MemoryRouter>
);

describe('<CurrentContentHighlightItemsHeader>', () => {
  it('Displays all content data titles', () => {
    render(
      <CurrentContentHighlightItemsHeaderWrapper isLoading={false} highlightTitle={highlightTitle} />,
    );
    expect(screen.getByText(highlightTitle)).toBeInTheDocument();
    expect(screen.getByTestId('deleteHighlightSet')).toBeInTheDocument();
  });
  it('Displays Skeleton on load', () => {
    render(
      <CurrentContentHighlightItemsHeaderWrapper isLoading highlightTitle={highlightTitle} />,
    );
    expect(screen.queryByText(highlightTitle)).not.toBeInTheDocument();
    expect(screen.getByTestId('header-skeleton')).toBeInTheDocument();
  });
});
