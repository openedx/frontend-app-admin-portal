import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router-dom';

import CoursewareNav from './index';
import { mockCourseOutline } from './CoursewareNav.mocks';

describe('CoursewareNav', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create((
        <MemoryRouter>
          <CoursewareNav courseOutline={mockCourseOutline} />
        </MemoryRouter>))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
