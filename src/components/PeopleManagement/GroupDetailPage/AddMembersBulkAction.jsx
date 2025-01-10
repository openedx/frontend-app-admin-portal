import PropTypes from 'prop-types';
import { StatefulButton } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useGetAllEnterpriseLearnerEmails } from '../data/hooks/useEnterpriseLearnersTableData';
import { getSelectedEmailsByRow } from '../utils';

const AddMembersBulkAction = ({
  isEntireTableSelected,
  selectedFlatRows,
  onHandleAddMembersBulkAction,
  enterpriseId,
  enterpriseGroupLearners,
}) => {
  const intl = useIntl();
  const { fetchLearnerEmails, addButtonState } = useGetAllEnterpriseLearnerEmails({
    enterpriseId,
    isEntireTableSelected,
    onHandleAddMembersBulkAction,
    enterpriseGroupLearners,
  });
  const handleOnClick = () => {
    if (isEntireTableSelected) {
      fetchLearnerEmails();
      return;
    }
    const addedMemberEmails = enterpriseGroupLearners.map(learner => learner.memberDetails.userEmail);
    const emails = getSelectedEmailsByRow(selectedFlatRows).filter(email => !addedMemberEmails.includes(email));
    onHandleAddMembersBulkAction(emails);
  };

  return (
    <StatefulButton
      labels={{
        default: intl.formatMessage({
          id: 'people.management.add.new.group.modal.button',
          defaultMessage: 'Add',
          description: 'Button state text for adding members from datatable',
        }),
        pending: intl.formatMessage({
          id: 'people.management.add.new.group.modal.pending',
          defaultMessage: 'Adding...',
          description: 'Button state text for adding members from datatable',
        }),
        complete: intl.formatMessage({
          id: 'people.management.add.new.group.modal.complete',
          defaultMessage: 'Add',
          description: 'Button state text for adding members from datatable',
        }),
        error: intl.formatMessage({
          id: 'people.management.add.new.group.modal.try.again',
          defaultMessage: 'Try again',
          description: 'Button state text for trying to add members again',
        }),
      }}
      state={addButtonState}
      onClick={handleOnClick}
      disabledStates={['pending']}
    />
  );
};

AddMembersBulkAction.propTypes = {
  selectedFlatRows: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  enterpriseId: PropTypes.string.isRequired,
  onHandleAddMembersBulkAction: PropTypes.func.isRequired,
  isEntireTableSelected: PropTypes.bool,
  enterpriseGroupLearners: PropTypes.arrayOf(PropTypes.string),
};

export default AddMembersBulkAction;
