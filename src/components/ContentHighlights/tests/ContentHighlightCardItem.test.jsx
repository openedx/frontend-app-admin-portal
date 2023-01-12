import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { camelCaseObject } from '@edx/frontend-platform';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';

import userEvent from '@testing-library/user-event';
import ContentHighlightCardItem from '../ContentHighlightCardItem';
import { TEST_COURSE_HIGHLIGHTS_DATA } from '../data/constants';
import { generateAboutPageUrl } from '../data/utils';

const mockStore = configureMockStore([thunk]);

const testHighlightedContent = camelCaseObject(TEST_COURSE_HIGHLIGHTS_DATA)[0]?.highlightedContent[0];

const initialState = {
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise',
  },
};

const ContentHighlightCardItemContainerWrapper = (props) => (
  <Provider store={mockStore(initialState)}>
    <ContentHighlightCardItem {...props} />
  </Provider>
);

describe('<ContentHighlightCardItem>', () => {
  it('Does not render a hyperlink if href is not specified', () => {
    renderWithRouter(<ContentHighlightCardItemContainerWrapper
      isLoading={false}
      title={testHighlightedContent.title}
      contentType={testHighlightedContent.contentType.toLowerCase()}
      partners={testHighlightedContent.authoringOrganizations}
    />);
    expect(screen.queryByTestId('hyperlink-title')).not.toBeInTheDocument();
  });
  it('Sets title as hyperlink when href populated', () => {
    const trackClickEvent = jest.fn();
    renderWithRouter(<ContentHighlightCardItemContainerWrapper
      isLoading={false}
      title={testHighlightedContent.title}
      contentType={testHighlightedContent.contentType.toLowerCase()}
      partners={testHighlightedContent.authoringOrganizations}
      hyperlinkAttrs={
        {
          href: generateAboutPageUrl({
            enterpriseSlug: initialState.portalConfiguration.enterpriseSlug,
            contentType: testHighlightedContent.contentType.toLowerCase(),
            contentKey: testHighlightedContent.contentKey,
          }),
          target: '_blank',
          onClick: () => trackClickEvent(),
        }
      }

    />);
    const hyperlink = screen.getByTestId('hyperlink-title');
    expect(hyperlink).toBeInTheDocument();
    expect(hyperlink.href).toContain(`${initialState.portalConfiguration.enterpriseSlug}/${testHighlightedContent.contentType.toLowerCase()}/${testHighlightedContent.contentKey}`);
    userEvent.click(hyperlink);
    expect(trackClickEvent).toHaveBeenCalled();
  });
});
