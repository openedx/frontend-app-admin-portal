import React, {useCallback, useMemo, useContext, useState} from 'react';
import {
  DataTable,
  TextFilter,
  CheckboxFilter,
  Badge,
  useToggle,
  IconButton,
  Icon,
  Tooltip,
  OverlayTrigger,
  useWindowSize,
  breakpoints
} from '@edx/paragon';
import { 
  Email,
  RemoveCircle 
} from '@edx/paragon/icons';
import debounce from 'lodash.debounce';

import { SubscriptionContext } from '../SubscriptionData';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import { useSubscriptionUsers } from '../data/hooks';
import { USER_BADGE_MAP, PAGE_SIZE, DEFAULT_PAGE, tabByLicenseStatus } from '../data/constants';
import { DEBOUNCE_TIME_MILLIS } from '../../../algoliaUtils';
import LicenseRevokeModal from '../../../containers/LicenseRevokeModal';
import LicenseRemindModal from '../../../containers/LicenseRemindModal';
import { ToastsContext } from '../../Toasts';


const userBadge = (userStatus) =>{
  const badgeLabel =  USER_BADGE_MAP[userStatus] 
    ? USER_BADGE_MAP[userStatus] 
    : USER_BADGE_MAP["UNDEFINED"]
  return <Badge variant={badgeLabel.variant}>{badgeLabel.label}</Badge>
}

const selectColumn = {
  id: 'selection',
  Header: DataTable.ControlledSelectHeader,
  Cell: DataTable.ControlledSelect,
  disableSortBy: true,
}

const modalZeroState = {
  open: false,
  user: null,
}

const LicenseManagementTable = () => {

  const [userStatusFilter, setUserStatusFilter] = useState(null);
  const [remindModal, setRemindModal] = useState(modalZeroState);
  const [revokeModal, setRevokeModal] = useState(modalZeroState);

  const { addToast } = useContext(ToastsContext);
  const { width } = useWindowSize();

  const showFiltersInSidebar = useMemo(() => {
    return width > breakpoints.medium.maxWidth;
  }, [width]);

  const { 
    errors,
    forceRefresh: forceRefreshSubscription, 
    setErrors,
  } = useContext(SubscriptionContext);

  const {
    activeTab,
    currentPage,
    overview,
    forceRefresh: forceRefreshOverview,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    subscription,
  } = useContext(SubscriptionDetailContext);

  
  // Users 
  const [users, forceRefreshUsers] = useSubscriptionUsers({
    activeTab,
    currentPage,
    searchQuery,
    subscriptionUUID: subscription.uuid,
    errors,
    setErrors,
    userStatusFilter,
  });
  const hasLoadedUsers = users?.numPages || users?.count;
  console.log("overview",overview);

  // Filtering 
  const updateFilters = (filters) =>{
    if(filters.length < 1){
      setSearchQuery(null);
      setUserStatusFilter(null);
    }else{
      filters.forEach((filter)=>{
        switch(filter.id){
          case "status":
            setUserStatusFilter(filter.value.join(','));
            break;
          case "email":
            setSearchQuery(filter.value);
            break;
        }
      });
    }
  }

  const debouncedUpdateFilters = debounce(
    updateFilters, 
    DEBOUNCE_TIME_MILLIS,
  );

  // handles pagination and filters
  const fetchData = useCallback(
    (args) => {
      console.log('fetchData args', args);
      // pages index from 1 in backend, Datable component index from 0
      if(args.pageIndex != currentPage - 1){
        setCurrentPage(args.pageIndex + 1);
      }
      debouncedUpdateFilters(args.filters);
    },
    [currentPage],
  );
 
  const data = useMemo(
    () => users?.results?.map(user => ({
      id: user.uuid,
      email: <span data-hj-suppress>{user.userEmail}</span>,
      status: userBadge(user.status),
    })),
    [users],
  );

  console.log("users: ",users);

  const remindActionColumn = () => {
    const altText= 'Remind learner';
    return {
      id: 'remind',
      Header: 'Remind',
      Cell: ({ row }) => {
        const selectedUser = users?.results[row.index];
        if(selectedUser.status === 'revoked' || selectedUser.status === 'activated'){
          return null;
        }
        return <OverlayTrigger
            placement={"top"}
            overlay={
              <Tooltip id={'tooltip-remind'}>
                {altText}
              </Tooltip>
            }
          >
            <IconButton 
              alt={altText}
              title={altText}
              src={Email} 
              iconAs={Icon} 
              variant="secondary" 
              onClick={() => 
                setRemindModal({
                  open:true, 
                  user: users?.results[row.index]
                })
              } 
            />
          </OverlayTrigger>
      },
    }
  }

  const revokeActionColumn = () => {
    const altText= 'Revoke license';

    return {
      id: 'revoke',
      Header: 'Revoke',
      Cell: ({row}) => {
        const selectedUser = users?.results[row.index];
        if(selectedUser.status === 'revoked'){
          return null;
        }
        return <OverlayTrigger
            placement={"top"}
            overlay={
              <Tooltip id={'tooltip-revoke'}>
                {altText}
              </Tooltip>
            }
          >
            <IconButton
              alt={altText}
              title={altText}
              src={RemoveCircle} 
              iconAs={Icon} 
              variant="danger" 
              onClick={() => 
                setRevokeModal({
                  open:true, 
                  user: selectedUser
                })
              }
            />
          </OverlayTrigger>
      },
    }
  }

  const actionColumn = () =>{
    const revokeText= 'Revoke license';
    const remindText= 'Remind learner';
    return {
      id: 'action',
      Header: '',
      Cell: ({row}) => {
        const selectedUser = users?.results[row.index];
        const displayRevoked = selectedUser.status === 'assigned' || selectedUser.status === 'activated';
        const displayRemind = selectedUser.status === 'assigned'; 
        return <>
          
          {displayRemind && 
            <OverlayTrigger
              placement={"top"}
              overlay={
                <Tooltip id={'tooltip-remind'}>
                  {remindText}
                </Tooltip>
              }
            >
              <IconButton
                alt={remindText}
                title={remindText}
                src={Email} 
                iconAs={Icon} 
                variant="secondary"
                onClick={() => 
                  setRemindModal({
                    open:true, 
                    user: users?.results[row.index]
                  })
                } 
              />
            </OverlayTrigger>
          }
          { displayRevoked &&
            <OverlayTrigger
              style={{margin: '22'}} 
              placement={"top"}
              overlay={
                <Tooltip id={'tooltip-revoke'}>
                  {revokeText}
                </Tooltip>
              }
            >
              <IconButton
                alt={revokeText}
                title={revokeText}
                src={RemoveCircle} 
                style={{marginLeft: displayRemind ? 0 : 44}} 

                iconAs={Icon} 
                variant="danger" 
                onClick={() => 
                  setRevokeModal({
                    open:true, 
                    user: selectedUser
                  })
                }
              />
            </OverlayTrigger>
          }
        
        </>
      },
    }
  }
  
  return(
    <>
      <DataTable
        showFiltersInSidebar={showFiltersInSidebar}
        isFilterable
        manualFilters
        isSelectable
        manualSelectColumn={selectColumn}
        SelectionStatusComponent={DataTable.ControlledSelectionStatus}
        defaultColumnValues={{ Filter: TextFilter }}
        isPaginated
        manualPagination
        itemCount={users.count}
        pageCount={users.numPages || 1}
        tableActions={[
          {
            buttonText: 'Download CSV',
            handleClick: (data) => console.log('Table Action', data),
          },
        ]}
        initialState={{
          pageSize: PAGE_SIZE,
          pageIndex: DEFAULT_PAGE - 1,
        }}
        initialTableOptions={{
          getRowId: row => row.id,
        }}
        fetchData={fetchData}
        data={data}
        columns={[
          {
            Header: 'Email address',
            accessor: 'email',
          },
          {
            Header: 'Status',
            accessor: 'status',
            Filter: CheckboxFilter,
            filter: 'includesValue',
            filterChoices: [{
              name: 'Active',
              number: overview.activated,
              value: 'activated',
            },
            {
              name: 'Pending',
              number: overview.assigned,
              value: 'assigned',
            },
            {
              name: 'Revoked',
              number: overview.revoked,
              value: 'revoked',
            }]
          },
          // TODO: 
          // {
          //   Header: 'Recent Action',
          //   accessor: 'recent',
          // },
        ]}
        additionalColumns={[
          // remindActionColumn(),
          // revokeActionColumn(),
          actionColumn()
        ]}
        bulkActions={[
          {
            buttonText: 'Revoke',
            handleClick: (data) => console.log('Download CSV', data),
          },
          {
            buttonText: 'Remind',
            handleClick: (data) => console.log('Download CSV', data),
          },
        ]}
      />
      {revokeModal.open && 
        <LicenseRevokeModal
          user={revokeModal.user}
          onSuccess={() => {
            addToast('License successfully revoked');
            // refresh subscription and user data to get updated revoke count and revoked user list
            forceRefreshSubscription();
            forceRefreshUsers();
            forceRefreshOverview();
          }}
          onClose={() => setRevokeModal(modalZeroState)}
          subscriptionPlan={subscription}
          licenseStatus={revokeModal.user?.status}
        />
      }
      {remindModal.open && 
        <LicenseRemindModal
          title="Remind User"
          user={remindModal.user}
          onSuccess={() => {
            addToast('Reminder successfully sent');
            forceRefreshUsers();
          }}
          subscriptionUUID={subscription.uuid}
          onClose={() => setRemindModal(modalZeroState)}
        />
      }
    </>
  )
}

export default LicenseManagementTable;