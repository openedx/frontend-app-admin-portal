/* eslint-disable react/prop-types */
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { useHistory } from 'react-router';
import ContentHighlights from '../ContentHighlights';
import { EnterpriseAppContext, initialStateValue } from '../../../data/tests/EnterpriseAppTestData/context';

const ContentHighlightsWrapper = ({
  value = initialStateValue,
  addToast = false,
  deleteToast = false,
}) => {
  const history = useHistory();
  const { location } = history;
  if (addToast) {
    history.push(location.pathname, { addHighlightSet: true });
  }
  if (deleteToast) {
    history.push(location.pathname, { deletedHighlightSet: true });
  }
  return (
    <EnterpriseAppContext value={value}>
      <ContentHighlights />
    </EnterpriseAppContext>
  );
};

describe('<ContentHighlightRoutes>', () => {
  it('Displays the Hero', () => {
    renderWithRouter(<ContentHighlightsWrapper />);
    expect(screen.getByText('Highlights')).toBeInTheDocument();
  });
  it('Displays the toast addition', () => {
    renderWithRouter(<ContentHighlightsWrapper addToast />);
    expect(screen.getByText('added', { exact: false })).toBeInTheDocument();
  });
  it('Displays the toast deleted', () => {
    renderWithRouter(<ContentHighlightsWrapper deleteToast />);
    expect(screen.getByText('deleted', { exact: false })).toBeInTheDocument();
  });
});
