const generateEnterpriseList = () => {
  const enterprises = [];

  for (let i = 1; i <= 20; i += 1) {
    enterprises.push({
      uuid: 'ee5e6b3a-069a-4947-bb8d-d2dbc323396c',
      name: `Enterprise ${i}`,
      slug: `enterprise-${i}`,
    });
  }

  return enterprises;
};

const mockEnterpriseList = {
  count: 20,
  current_page: 1,
  num_pages: 2,
  next: 'next_page_url',
  previous: null,
  results: generateEnterpriseList(),
  start: 0,
};

export default mockEnterpriseList;
