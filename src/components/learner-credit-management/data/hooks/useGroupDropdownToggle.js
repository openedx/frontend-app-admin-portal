import { useCallback } from "react";
import { getGroupMemberEmails } from "./useEnterpriseFlexGroups";
import { logError } from '@edx/frontend-platform/logging';

const useGroupDropdownToggle = ({ setCheckedGroups, setGroupMemberEmails, onGroupSelectionsChanged, checkedGroups, groupMemberEmails }) => {
  const handleCheckedGroupsChanged = async (e) => {
    const { value, checked, id } = e.target;
    //  if (checked) {
    //   try {
    //     const memberEmails = await getGroupMemberEmails(id);
    //     setCheckedGroups((prev) => ({
    //       ...prev,
    //       [id]: {
    //         checked,
    //         name: value,
    //         memberEmails,
    //       }
    //     }));
    //     const newEmails = [];
    //     const updatedMembers = memberEmails.filter(member => !groupMemberEmails.includes(member));
    //     setGroupMemberEmails(prev => [...prev, ...updatedMembers])
    //   } catch (err) {
    //     logError(err);
    //   }
    // } else if (!checked) {
    //   setCheckedGroups((prev) => ({
    //     ...prev,
    //     [id]: {
    //       ...prev[id],
    //       checked: false,
    //     }
    //   }));
    //   let membersToRemove = checkedGroups[id].memberEmails;
    //   console.log(membersToRemove)
    //   const updatedMembers = groupMemberEmails.filter(member => !membersToRemove.includes(member));
    //   setGroupMemberEmails(updatedMembers);
    // }
    if (checked) {
      try {
        const memberEmails = await getGroupMemberEmails(id);
        setCheckedGroups((prev) => ({
          ...prev,
          [id]: {
            checked,
            name: value,
            memberEmails,
          },
        }));
      } catch (err) {
        logError(err);
      }
    } else if (!checked) {
      setCheckedGroups((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          checked: false,
        },
      }));
    }
  };

  const handleGroupsChanged = useCallback(async (groups) => {
    if (Object.keys(groups).length === 0) {
      setGroupMemberEmails([]);
      onGroupSelectionsChanged([]);
    }
  }, [onGroupSelectionsChanged]);

  const handleSubmitGroup = () => {
    const memberEmails = [];
    Object.keys(checkedGroups).forEach(group => {
      if (checkedGroups[group].checked) {
        checkedGroups[group].memberEmails.forEach(email => {
          if (!memberEmails.includes(email)) {
            memberEmails.push(email);
          }
        });
      }
    });
    setGroupMemberEmails(memberEmails);
  };

  return {
    handleCheckedGroupsChanged,
    handleGroupsChanged,
    handleSubmitGroup,
  }
};

export default useGroupDropdownToggle;