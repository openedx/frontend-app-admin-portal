import React from 'react';
import PropTypes from 'prop-types';
import { Button, Hyperlink, Icon } from '@edx/paragon';
import classNames from 'classnames';

import './SidebarItem.scss';

function SidebarItemHeader(props) {
  return (
    <div className="sidebar-item-header">
      <h5 id={`sidebar-item-${props.categoryKey}`}>{props.category}</h5>
      {
        props.actionButton && <Button
          className={['btn-link']}
          label={props.actionLabel}
          onClick={props.actionHandler}
        />
      }
    </div>
  );
}

SidebarItemHeader.defaultProps = {
  categoryKey: '',
  category: '',
  actionButton: false,
  actionLabel: '',
  actionHandler: () => {},
};

SidebarItemHeader.propTypes = {
  categoryKey: PropTypes.string,
  category: PropTypes.string,
  actionButton: PropTypes.bool,
  actionLabel: PropTypes.string,
  actionHandler: PropTypes.func,
};

function SidebarItemChild(props) {
  switch (props.item.type) {
    case 'TXT_LINK':
      return (
        <li className="sidebar-item-child">
          <a href={props.item.href}>{props.item.title}</a>
        </li>
      );
    case 'BTN_LINK':
      return (
        <li className="sidebar-item-child btn-sidebar">
          <Hyperlink
            destination={props.item.href}
            content={
              <span>
                <Icon className={classNames(['content-icon', props.item.classes])} />
                {props.item.title}
              </span>
            }
          />
        </li>
      );
    default:
      return null;
  }
}

SidebarItemChild.defaultProps = {
  item: {},
};

SidebarItemChild.propTypes = {
  item: PropTypes.shape({
    type: PropTypes.string,
    href: PropTypes.string,
    title: PropTypes.string,
    classes: PropTypes.string,
  }),
};

class SidebarItem extends React.Component {
  constructor(props) {
    super(props);

    const { showAllButton } = this.props.itemData;

    this.state = {
      showAllItems: !showAllButton,
    };
  }

  showAllHandler = () => {
    this.setState(prevState => ({ showAllItems: !prevState.showAllItems }));
  }

  render() {
    const { category, showAllButton, items } = this.props.itemData;
    const categoryKey = category.replace(/\s+/g, '-').toLowerCase();

    const { showAllItems } = this.state;
    const showLabel = showAllItems ? 'show less' : 'show all';
    const itemsToDisaplay = showAllItems ? items : items.slice(5);

    return (
      <section className="sidebar-item-wrapper">
        <SidebarItemHeader
          categoryKey={categoryKey}
          category={category}
          actionButton={showAllButton}
          actionLabel={showLabel}
          actionHandler={this.showAllHandler}
        />
        <nav className="sidebar-item-childs" aria-labelledby={`sidebar-item-${categoryKey}`}>
          <ul>
            {
              itemsToDisaplay.map(item => <SidebarItemChild item={item} key={item.title} />)
            }
          </ul>
        </nav>
      </section>
    );
  }
}

SidebarItem.defaultProps = {
  itemData: {
    category: '',
    showAllButton: false,
    items: [],
  },
};

SidebarItem.propTypes = {
  itemData: PropTypes.shape({
    category: PropTypes.string,
    showAllButton: PropTypes.bool,
    items: PropTypes.array,
  }),
};

export default SidebarItem;
