import React from 'react';
import renderer from 'react-test-renderer';
import CoursewareContent from './index';

describe('CoursewareContent', () => {
  const mockNode = {
    id: 'dummynode',
    displayUrl: 'http://www.example.com',
    displayName: 'Just a dummy node to display',
  };

  it('renders correctly', () => {
    const tree = renderer
      .create(<CoursewareContent node={mockNode} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
