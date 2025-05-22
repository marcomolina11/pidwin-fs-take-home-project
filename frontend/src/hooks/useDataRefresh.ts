import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { fetchCurrentUser } from '../actions/login';
import { fetchRecentRolls } from '../actions/game';
import { selectToken } from '../selectors/authSelectors';

export const useDataRefresh = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
  const token = useSelector(selectToken);

  useEffect(() => {
    const refreshData = async () => {
      if (token) {
        await dispatch(fetchCurrentUser());
        await dispatch(fetchRecentRolls());
      }
      setLoading(false);
    };

    refreshData();
  }, [dispatch, token]);

  return { loading };
};
