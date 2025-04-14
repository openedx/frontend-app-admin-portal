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

  // Identify tables that rely on the useTableData hook and have been migrated to the new DataTable component.
  const isTableUsingDataState = [
    'learners-active-week',
    'learners-inactive-week',
    'learners-inactive-month',
    'registered-unenrolled-learners',
  ].includes(actionSlug);

  return (
    <DownloadCsvButton
      id={tableMetadata.csvButtonId}
      fetchMethod={tableMetadata.csvFetchMethod}
      disabled={isTableUsingDataState ? !tablesWithData[actionSlug] : isTableDataMissing(actionSlug)}
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
