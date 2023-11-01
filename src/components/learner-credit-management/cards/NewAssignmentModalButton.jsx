import React from 'react';
import PropTypes from 'prop-types';
import {
  FullscreenModal,
  ActionRow,
  Button,
  useToggle,
  Hyperlink,
} from '@edx/paragon';
import AssignmentModalContent from './AssignmentModalContent';

const NewAssignmentModalButton = ({ course, children }) => {
  const [isOpen, open, close] = useToggle(false);

  return (
    <>
      <Button onClick={open}>{children}</Button>
      <FullscreenModal
        className="bg-light-200 text-left"
        title="Assign this course"
        isOpen={isOpen}
        onClose={close}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" as={Hyperlink} destination="https://edx.org" target="_blank">
              Help Center: Course Assignments
            </Button>
            <ActionRow.Spacer />
            <Button variant="tertiary" onClick={close}>Cancel</Button>
            {/* TODO: https://2u-internal.atlassian.net/browse/ENT-7826 */}
            <Button>Assign</Button>
          </ActionRow>
        )}
      >
        <AssignmentModalContent course={course} />
      </FullscreenModal>
    </>
  );
};

NewAssignmentModalButton.propTypes = {
  course: PropTypes.shape().isRequired, // Pass-thru prop to `BaseCourseCard`
  children: PropTypes.node.isRequired, // Represents the button text
};

export default NewAssignmentModalButton;
