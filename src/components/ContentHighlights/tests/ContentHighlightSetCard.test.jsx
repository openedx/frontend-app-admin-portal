/* eslint-disable react/prop-types */
import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { renderWithRouter, sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import userEvent from '@testing-library/user-event';
import { v4 as uuidv4 } from 'uuid';
import ContentHighlightSetCard from '../ContentHighlightSetCard';
import CurrentContentHighlightHeader from '../CurrentContentHighlightHeader';
import {
  BUTTON_TEXT,
  HEADER_TEXT,
  MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION,
  ALERT_TEXT,
  STEPPER_STEP_TEXT,
} from '../data/constants';
import { ContentHighlightsContext, initialStateValue } from '../../../data/tests/ContentHighlightsTestData';
import { initialStateValue as initialEnterpriseAppContextValue } from '../../../data/tests/EnterpriseAppTestData/context';
import { TEST_ENTERPRISE_SLUG } from '../../../data/tests/constants';
import ContentHighlightStepper from '../HighlightStepper/ContentHighlightStepper';

const mockData = [{
  title: 'Test Title',
  highlightSetUUID: 'test-uuid',
  enterpriseSlug: TEST_ENTERPRISE_SLUG,
  itemCount: 0,
  imageCapSrc: 'http://fake.image',
  isPublished: true,
  onClick: jest.fn(),
}];

const mockUnpublishedData = [{
  title: 'Test Title',
  highlightSetUUID: 'test-uuid',
  enterpriseSlug: TEST_ENTERPRISE_SLUG,
  itemCount: 0,
  imageCapSrc: 'http://fake.image',
  isPublished: false,
  onClick: jest.fn(),
}];

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const mockMultipleData = [];
for (let i = 0; i < MAX_HIGHLIGHT_SETS_PER_ENTERPRISE_CURATION; i++) {
  mockMultipleData.push({
    ...mockData,
    title: `Test Title ${i}`,
    highlightSetUUID: `test-uuid-${i}`,
  });
}

const ContentHighlightSetCardWrapper = ({
  enterpriseAppContextValue = initialEnterpriseAppContextValue,
  value = initialStateValue,
  data = mockData,
}) => (
  <ContentHighlightsContext enterpriseAppContextValue={enterpriseAppContextValue} value={value}>
    <CurrentContentHighlightHeader />
    {data.map((highlight) => (
      <ContentHighlightSetCard key={uuidv4()} {...highlight} />
    ))}
    <ContentHighlightStepper />
  </ContentHighlightsContext>
);

describe('<ContentHighlightSetCard>', () => {
  it('Displays the title of the highlight set', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
  it('opens model and sends segment event', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper />);
    const newHighlightButton = screen.getByText(BUTTON_TEXT.createNewHighlight);
    userEvent.click(newHighlightButton);
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(1);
  });
  it('renders correct text when less then max curations', () => {
    renderWithRouter(<ContentHighlightSetCardWrapper />);
    expect(screen.getByText(BUTTON_TEXT.createNewHighlight)).toBeInTheDocument();
    expect(screen.getByText(HEADER_TEXT.SUB_TEXT.currentContent)).toBeInTheDocument();
  });
  it('renders correct text when more then or equal to max curations', async () => {
    const updatedEnterpriseAppContextValue = {
      value: {
        enterpriseCuration: {
          enterpriseCuration: {
            highlightSets: mockMultipleData,
          },
        },
      },
    };
    renderWithRouter(
      <ContentHighlightSetCardWrapper
        enterpriseAppContextValue={updatedEnterpriseAppContextValue}
        data={mockMultipleData}
      />,
    );
    const createNewHighlightButton = screen.getByText(BUTTON_TEXT.createNewHighlight);
    expect(createNewHighlightButton).toBeInTheDocument();
    // Trigger Alert
    userEvent.click(createNewHighlightButton);
    // Verify Alert
    expect(screen.queryByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).not.toBeInTheDocument();
    expect(screen.getByText(ALERT_TEXT.HEADER_TEXT.currentContent)).toBeInTheDocument();
    expect(screen.getByText(ALERT_TEXT.SUB_TEXT.currentContent)).toBeInTheDocument();

    const dismissButton = screen.getByText('Dismiss');
    expect(dismissButton).toBeInTheDocument();
    // Trigger Dismiss
    userEvent.click(dismissButton);
    // Verify Dismiss
    await waitFor(() => { expect(screen.queryByText(ALERT_TEXT.HEADER_TEXT.currentContent)).not.toBeInTheDocument(); });
    expect(screen.queryByText(ALERT_TEXT.SUB_TEXT.currentContent)).not.toBeInTheDocument();
  });
  it('opens stepper on unpublished (draft) content', () => {
    const updatedEnterpriseAppContextValue = {
      value: {
        enterpriseCuration: {
          enterpriseCuration: {
            highlightSets: mockUnpublishedData,
          },
        },
      },
    };
    renderWithRouter(
      <ContentHighlightSetCardWrapper
        enterpriseAppContextValue={updatedEnterpriseAppContextValue}
        data={mockUnpublishedData}
      />,
    );
    const newHighlightButton = screen.getByText(mockUnpublishedData[0].title);
    userEvent.click(newHighlightButton);
    expect(screen.getByText(STEPPER_STEP_TEXT.HEADER_TEXT.createTitle)).toBeInTheDocument();
  });
});
