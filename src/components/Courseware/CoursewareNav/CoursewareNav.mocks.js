const mockCourseOutline = {
  displayName: 'Demo Course',
  type: 'course',
  id: 'DemoCourse',
  descendants: [
    {
      displayName: 'Chapter 1',
      type: 'chapter',
      id: 'c1',
      descendants: [
        {
          displayName: 'Section 1.1',
          type: 'sectional',
          id: 's1.1',
          descendants: [
            {
              displayName: 'Vertical 1.1.1',
              type: 'vertical',
              id: 'v1.1.1',
              descendants: [],
            },
            {
              displayName: 'Vertical 1.1.2',
              type: 'vertical',
              id: 'v1.1.2',
              descendants: [],
            },
            {
              displayName: 'Vertical 1.1.3',
              type: 'vertical',
              id: 'v1.1.3',
              descendants: [],
            },
            {
              displayName: 'Vertical 1.1.4',
              type: 'vertical',
              id: 'v1.1.4',
              descendants: [],
            },
          ],
        },
        {
          displayName: 'Section 1.2',
          type: 'sectional',
          id: 's1.2',
          descendants: [
            {
              displayName: 'Vertical 1.2.1',
              type: 'vertical',
              id: 'v1.2.1',
              descendants: [],
            },
          ],
        },
      ],
    },
    {
      displayName: 'Chapter 2',
      type: 'chapter',
      id: 'c2',
      descendants: [
        {
          displayName: 'Section 2.1',
          type: 'sectional',
          id: 's2.1',
          descendants: [
            {
              displayName: 'Vertical 2.1.1',
              type: 'vertical',
              id: 'v2.1.1',
              descendants: [],
            },
          ],
        },
      ],
    },
    {
      displayName: 'Chapter 3',
      type: 'chapter',
      id: 'c3',
      descendants: [
        {
          displayName: 'Section 3.1',
          type: 'sectional',
          id: 's3.1',
          descendants: [
            {
              displayName: 'Vertical 3.1.1',
              type: 'vertical',
              id: 'v3.1.1',
              descendants: [],
            },
          ],
        },
        {
          displayName: 'Section 3.2',
          type: 'sectional',
          id: 's3.2',
          descendants: [
            {
              displayName: 'Vertical 3.2.1',
              type: 'vertical',
              id: 'v3.2.1',
              descendants: [],
            },
          ],
        },
        {
          displayName: 'Section 3.3',
          type: 'sectional',
          id: 's3.3',
          descendants: [
            {
              displayName: 'Vertical 3.3.1',
              type: 'vertical',
              id: 'v3.3.1',
              descendants: [],
            },
            {
              displayName: 'Vertical 3.3.2',
              type: 'vertical',
              id: 'v3.3.2',
              descendants: [],
            },
          ],
        },
      ],
    },
  ],
};

/* eslint-disable import/prefer-default-export, object-curly-newline */
export {
  mockCourseOutline,
};
