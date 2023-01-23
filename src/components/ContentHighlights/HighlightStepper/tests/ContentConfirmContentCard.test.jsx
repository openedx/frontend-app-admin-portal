/* eslint-disable react/prop-types */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import ContentConfirmContentCard from '../ContentConfirmContentCard';
import { FOOTER_TEXT_BY_CONTENT_TYPE } from '../../data/constants';
import { useContentHighlightsContext } from '../../data/hooks';
import {
  testCourseData,
  ContentHighlightsContext,
  initialStateValue,
} from '../../../../data/tests/ContentHighlightsTestData';

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const mockDeleteSelectedRowId = jest.fn();
jest.mock('../../data/hooks');
useContentHighlightsContext.mockReturnValue({
  deleteSelectedRowId: mockDeleteSelectedRowId,
});

const ContentHighlightContentCardWrapper = ({
  contextValue = initialStateValue,
  testCourses = testCourseData,
}) => (
  <ContentHighlightsContext value={contextValue}>
    {testCourses.map((original) => (
      <ContentConfirmContentCard
        original={original}
        key={original.aggregationKey}
      />
    ))}
  </ContentHighlightsContext>
);
describe('<ContentConfirmContentCard />', () => {
  it('renders the correct content', () => {
    renderWithRouter(<ContentHighlightContentCardWrapper />);
    for (let i = 0; i < testCourseData.length; i++) {
      expect(screen.getByText(testCourseData[i].title)).toBeInTheDocument();
      expect(screen.getByText(testCourseData[i].firstEnrollablePaidSeatPrice, { exact: false })).toBeInTheDocument();
      // eslint-disable-next-line max-len
      expect(screen.queryAllByText(FOOTER_TEXT_BY_CONTENT_TYPE[testCourseData[i].contentType], { exact: false })).toBeTruthy();
      expect(screen.queryAllByText(testCourseData[i].partners[0].name)).toBeTruthy();
    }
  });
  it('deletes the correct content and sends first track event of the mock', () => {
    renderWithRouter(<ContentHighlightContentCardWrapper />);
    const deleteButton = screen.getAllByRole('button', { 'aria-label': 'Delete' });
    userEvent.click(deleteButton[0]);
    expect(mockDeleteSelectedRowId).toHaveBeenCalledWith(testCourseData[0].aggregationKey);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });
  it('sends second track event of the mock on click of hyperlink', () => {
    renderWithRouter(<ContentHighlightContentCardWrapper />);
    const hyperlinkTitle = screen.getAllByTestId('hyperlink-title')[0];
    userEvent.click(hyperlinkTitle);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
  });
  it('should not render anything with no test data', () => {
    renderWithRouter(<ContentHighlightContentCardWrapper testCourses={[]} />);
    expect(screen.queryAllByTestId('content-confirm-content-card')).toHaveLength(0);
  });
});
