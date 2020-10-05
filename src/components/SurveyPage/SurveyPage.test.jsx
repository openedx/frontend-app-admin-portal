import React from 'react';
import renderer from 'react-test-renderer';

import SurveyPage from './index';

describe('<SurveyPage />', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <SurveyPage />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
