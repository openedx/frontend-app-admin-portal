import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow, Button,
} from '@edx/paragon';
import { 
  Email,
  RemoveCircle 
} from '@edx/paragon/icons';

const LicenseManagementTableBulkActions = ({selectedUsers, canRemindLicense, canRevokeLicense}) =>{
  
  const [numberCanRemind, numberCanRevoke] = useMemo(()=>{
    let remindCount = 0;
    let revokeCount = 0;
    console.log('counting');
    
    selectedUsers.forEach(user =>{
      const userStatus = user.original.status;
      if (canRemindLicense(userStatus)){
        remindCount++;
      }
      if(canRevokeLicense(userStatus)){
        revokeCount++;
      }
    });
    return [remindCount, revokeCount];
  },[selectedUsers]);

  return (
    <ActionRow>
      <Button 
        variant="outline-primary" 
        iconBefore={Email}
      >
        Remind({numberCanRemind})
      </Button>
      <Button 
        variant="outline-danger" 
        iconBefore={RemoveCircle}
      >
        Revoke({numberCanRevoke})
      </Button>

    </ActionRow>
  )
}

export default LicenseManagementTableBulkActions;