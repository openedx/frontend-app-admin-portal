import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
import { DragIndicator } from '@openedx/paragon/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/*
  * SortableItem component is used to create a draggable item in sortable list.
  * Any component can be passed as children to make it draggable.
  */
const SortableItem = ({ id, children, disabled }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: 'relative',
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 'auto',
  };

  const dragIndicatorStyle = {
    cursor: 'grab',
    position: 'absolute',
    right: '2px',
    top: '4px',
    zIndex: 2,
    padding: '5px',
  };

  return (
    <div ref={setNodeRef} style={style} className="container-fluid bg-primary-100 rounded-lg p-4.5 mb-3">
      {!disabled && (
      <div
        {...attributes}
        {...listeners}
        style={dragIndicatorStyle}
      >
        <Icon src={DragIndicator} />
      </div>
      )}
      {children}
    </div>
  );
};

SortableItem.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default SortableItem;
