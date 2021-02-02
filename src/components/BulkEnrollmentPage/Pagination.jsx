import { DataTable } from '@edx/paragon';
import { connectPagination } from 'react-instantsearch-dom';


const AlgoliaPagination = () => {
  return <DataTable.TableFooter
        />
}


export default connectPagination(AlgoliaPagination);
