import { useParams } from 'react-router-dom';
import { DEFAULT_TAB } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const useCurrentTab = () => {
  const params = useParams();
  return params.tab ?? DEFAULT_TAB;
};
