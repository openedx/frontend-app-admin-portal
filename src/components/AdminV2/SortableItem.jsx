import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from '@openedx/paragon';
import { DragIndicator } from '@openedx/paragon/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableItem = ({ id, children }) => {
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
    marginBottom: '1rem',
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: 'grab',
          position: 'absolute',
          right: '2px',
          top: '4px',
          zIndex: 2,
          padding: '5px',
        }}
      >
        <Icon src={DragIndicator} />
      </div>
      {children}
    </div>
  );
};

SortableItem.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default SortableItem;
