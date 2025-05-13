import React from 'react';
import { act, create } from 'react-test-renderer';

import SurveyPage from './index';

describe('<SurveyPage />', () => {
  it('renders correctly', async () => {
    let tree;
    await act(async () => {
      tree = create(<SurveyPage />);
    });
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
