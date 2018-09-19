import React from 'react';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

import Sidebar from './index';

const SIDEBAR_DATA = [
  {
    category: 'Catalogs',
    showAllButton: true,
    action: {
      type: 'BTN_LINK',
      title: 'Create New Catalog',
      href: 'https://reactjs.org/',
    },
    items: [
      {
        type: 'TXT_LINK',
        title: 'JS Catalog',
        href: 'https://js.org/',
      }, {
        type: 'TXT_LINK',
        title: 'PY Catalog',
        href: 'https://www.python.org/',
      },
    ],
  }, {
    category: 'Management',
    showAllButton: false,
    items: [
      {
        type: 'TXT_LINK',
        title: 'Peoeple & Groups',
        href: 'https://edx.org/',
      },
    ],
  },
];

describe('<Sidebar />', () => {
  let wrapper;

  it('will not render if disabled', () => {
    const tree = renderer
      .create((
        <Sidebar
          sidebarExpanded
          sidebarEnabled={false}
          sidebarData={SIDEBAR_DATA}
          toggleSidebar={() => {}}
        />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when expanded', () => {
    const tree = renderer
      .create((
        <Sidebar
          sidebarExpanded
          sidebarEnabled
          sidebarData={SIDEBAR_DATA}
          toggleSidebar={() => {}}
        />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when collapsed', () => {
    const tree = renderer
      .create((
        <Sidebar
          sidebarExpanded={false}
          sidebarEnabled
          sidebarData={SIDEBAR_DATA}
          toggleSidebar={() => {}}
        />
      ))
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('has `show all` link working correctly', () => {
    wrapper = mount((
      <Sidebar
        sidebarExpanded
        sidebarEnabled
        sidebarData={SIDEBAR_DATA}
        itemsToShow={1}
        toggleSidebar={() => {}}
      />
    ));

    // verify initial data
    expect(wrapper.find('.sidebar-item-wrapper.catalogs').find('.sidebar-item-header button').text())
      .toEqual('show all');
    expect(wrapper.find('.sidebar-item-wrapper.catalogs').find('li.sidebar-item-child').length).toEqual(2);
    expect(wrapper.find('.sidebar-item-wrapper.management').find('li.sidebar-item-child').length).toEqual(1);

    // verify things after click on `show all` button
    wrapper.find('.sidebar-item-wrapper.catalogs').find('.sidebar-item-header button').simulate('click');
    expect(wrapper.find('.sidebar-item-wrapper.catalogs').find('li.sidebar-item-child').length).toEqual(3);

    // click on `show less` and verify that things reset to initial data
    expect(wrapper.find('.sidebar-item-wrapper.catalogs').find('.sidebar-item-header button').text())
      .toEqual('show less');
    wrapper.find('.sidebar-item-wrapper.catalogs').find('.sidebar-item-header button').simulate('click');
    expect(wrapper.find('.sidebar-item-wrapper.management').find('li.sidebar-item-child').length).toEqual(1);
  });
});
