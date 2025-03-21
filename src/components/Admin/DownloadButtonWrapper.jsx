import PropTypes from 'prop-types';
import DownloadCsvButton from '../../containers/DownloadCsvButton';
import { useTableData } from './TableDataContext';

const DownloadButtonWrapper = ({
  tableMetadata,
  actionSlug,
  downloadButtonLabel,
  isTableDataMissing,
}) => {
  const { tablesWithData } = useTableData();

  // Check if this is a LearnerActivityTable
  const isLearnerActivityTable = [
    'learners-active-week',
    'learners-inactive-week',
    'learners-inactive-month',
  ].includes(actionSlug);

  return (
    <DownloadCsvButton
      id={tableMetadata.csvButtonId}
      fetchMethod={tableMetadata.csvFetchMethod}
      disabled={isLearnerActivityTable ? !tablesWithData[actionSlug] : isTableDataMissing(actionSlug)}
      buttonLabel={downloadButtonLabel}
    />
  );
};

DownloadButtonWrapper.propTypes = {
  tableMetadata: PropTypes.shape({
    csvButtonId: PropTypes.string,
    csvFetchMethod: PropTypes.func,
  }).isRequired,
  actionSlug: PropTypes.string,
  downloadButtonLabel: PropTypes.string,
  isTableDataMissing: PropTypes.func.isRequired,
};

DownloadButtonWrapper.defaultProps = {
  actionSlug: undefined,
  downloadButtonLabel: undefined,
};

export default DownloadButtonWrapper;
