// badge status for published vs unpublished highlight cards
export function HIGHLIGHT_CARD_BADGE_STATUS(isPublished) {
  if (isPublished) {
    return {
      label: 'Published',
      variant: 'primary',
    };
  }
  return {
    label: 'Draft',
    variant: 'light',
  };
}
/*eslint-disable*/
// Test Data for Content Highlights
export const TEST_COURSE_HIGHLIGHTS_DATA = [
    {
      uuid: '1',
      title: 'Dire Core',
      is_published: true,
      enterprise_curation: "321123",
      highlighted_content:
              [
                {
                  uuid: '1',
                  content_type: 'Course',
                  content_key: 'edX+DemoX',
                  title: 'Math',
                  card_image_url: 'https://source.unsplash.com/360x200/?nature,flower',
                  authoring_organizations: 
                  [
                    {
                      uuid:'123',
                      name: 'General Studies 1',
                      logo_image_url: 'https://placekitten.com/200/100',
                    },
                    {
                      uuid:'1234',
                      logo_image_url: 'https://placekitten.com/200/100',
                      name: 'Super General Studies'
                    }
                  ]
                },
                {
                  title: 'Science',
                  content_type: 'Pathway',
                  uuid: '2',
                  content_key: 'edX+DemoX',
                  authoring_organizations: 
                  [
                    {
                      uuid:'123',
                      logo_image_url: 'https://placekitten.com/200/100',
                      name: 'General Studies 2'
                    }
                  ]
                },
                {
                  title: 'English',
                  content_type: 'Program',
                  uuid: '3',
                  content_key: 'edX+DemoX',
                  authoring_organizations: 
                  [
                    {
                      uuid:'123',
                      logo_image_url: 'https://placekitten.com/200/100',
                      name: 'General Studies 3'
                    }
                  ]
                },
              ],
    },
    {
      title: 'Dire Math',
      uuid: '2',
      is_published: true,
      enterprise_curation: "321123",
      highlighted_content:
                [
                  {
                    title: 'Math Xtreme',
                    content_type: 'Course',
                    uuid: '4',
                    content_key: 'edX+DemoX',
                    authoring_organizations: 
                    [
                      {
                        uuid:'456',
                        logo_image_url: 'https://placekitten.com/200/100',
                        name: 'Matheletes'
                      }
                    ]
                  },
                  {
                    title: 'Science for Math Majors',
                    content_type: 'Course',
                    uuid: '5',
                    content_key: 'edX+DemoX',
                    authoring_organizations: 
                    [
                      {
                        uuid:'456',
                       logo_image_url: 'https://placekitten.com/200/100',
                        name: 'Matheletes'
                      }
                    ]
                  },
                  {
                    title: 'English Divergence',
                    content_type: 'Course',
                    uuid: '6',
                    content_key: 'edX+DemoX',
                    authoring_organizations: 
                    [
                      {
                        uuid:'456',
                        logo_image_url: 'https://placekitten.com/200/100',
                        name: 'Matheletes'
                      }
                    ]
                  },
                ],
    },
    {
      title: 'Dire Science',
      uuid: '3',
      is_published: false,
      enterprise_curation: "321123",
      highlighted_content:
                [
                  {
                    title: 'Math for Science Majors',
                    content_type: 'Course',
                    uuid: '7',
                    content_key: 'edX+DemoX',
                    authoring_organizations: 
                    [
                      {
                        uuid:'789',
                        logo_image_url: 'https://placekitten.com/200/100',
                        name: 'The Beakers'
                      }
                    ]
                  },
                  {
                    title: 'Science Xtreme',
                    content_type: 'Course',
                    uuid: '8',
                    content_key: 'edX+DemoX',
                    authoring_organizations: 
                    [
                      {
                        uuid:'789',
                        logo_image_url: 'https://placekitten.com/200/100',
                        name: 'The Beakers'
                      }
                    ]
                  },
                  {
                    title: 'English Obfuscation',
                    content_type: 'Course',
                    uuid: '9',
                    content_key: 'edX+DemoX',
                    authoring_organizations: 
                    [
                      {
                        uuid:'789',
                        logo_image_url: 'https://placekitten.com/200/100',
                        name: 'The Beakers'
                      }
                    ]
                  },
                ]
    },
    {
      title: 'Dire English',
      uuid: '4',
      is_published: true,
      enterprise_curation: "321123",
      highlighted_content:
                [
                  {
                    title: 'To Math or not Math',
                    content_type: 'Course',
                    uuid: '10',
                    content_key: 'edX+DemoX',
                    authoring_organizations: 
                    [
                      {
                        uuid:'101112',
                        logo_image_url: 'https://placekitten.com/200/100',
                        name: 'Extensive Etymology'
                      }
                    ]
                  },
                  {
                    title: 'Science for English Majors',
                    content_type: 'Course',
                    uuid: '11',
                    content_key: 'edX+DemoX',
                    authoring_organizations: 
                    [
                      {
                        uuid:'101112',
                        logo_image_url: 'https://placekitten.com/200/100',
                        name: 'Extensive Etymology'
                      }
                    ]
                  },
                  {
                    title: 'English Again',
                    content_type: 'Course',
                    uuid: '12',
                    content_key: 'edX+DemoX',
                    authoring_organizations: 
                    [
                      {
                        uuid:'101112',
                        logo_image_url: 'https://placekitten.com/200/100',
                        name: 'Extensive Etymology'
                      }
                    ]
                  },
                ],
    },
    {
      title: 'Dire Engineering',
      uuid: '5',
      is_published: true,
      enterprise_curation: "321123",
      highlighted_content:
                [
                  {
                    title: 'Math for Engineering Majors',
                    content_type: 'Course',
                    uuid: '13',  
                    content_key: 'edX+DemoX',
                    authoring_organizations: 
                    [
                      {
                        uuid:'131415',
                        logo_image_url: 'https://placekitten.com/200/100',
                        name: 'Building Bridges'
                      }
                    ]
                  },
                  {
                    title: 'Science for Engineering Majors',
                    content_type: 'Course',
                    uuid: '14',
                    content_key: 'edX+DemoX',
                    authoring_organizations: 
                    [
                      {
                        uuid:'131415',
                        logo_image_url: 'https://placekitten.com/200/100',
                        name: 'Building Bridges'
                      }
                    ]
                  },
                  {
                    title: 'English Instantiation',
                    content_type: 'Course',
                    uuid: '15',
                    content_key: 'edX+DemoX',
                    authoring_organizations: 
                    [
                      {
                        uuid:'131415',
                        logo_image_url: 'https://placekitten.com/200/100',
                        name: 'Building Bridges'
                      }
                    ]
                  },
                ],
    },
  ];
  /*es-lint-enable*/