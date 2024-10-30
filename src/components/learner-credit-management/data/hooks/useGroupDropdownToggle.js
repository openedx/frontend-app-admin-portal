import { useCallback, useRef, useEffect } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { getGroupMemberEmails } from './useEnterpriseFlexGroups';
import { GROUP_DROPDOWN_TEXT } from '../../../PeopleManagement/constants';

const useGroupDropdownToggle = ({
  setCheckedGroups,
  setGroupMemberEmails,
  onGroupSelectionsChanged,
  checkedGroups,
  setDropdownToggleLabel,
  dropdownToggleLabel,
}) => {
  const handleCheckedGroupsChanged = async (e) => {
    const { value, checked, id } = e.target;
    if (checked) {
      try {
        const memberEmails = await getGroupMemberEmails(id);
        setCheckedGroups((prev) => ({
          ...prev,
          [id]: {
            checked,
            name: value,
            memberEmails,
            isApplied: false,
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
          isUnapplied: false,
        },
      }));
    }
  };

  const dropdownRef = useRef(null);
  useEffect(() => {
    // Handles user clicking outside of the dropdown menu.
    function handleClickOutside(event) {
      console.log(dropdownRef)
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownToggleLabel(GROUP_DROPDOWN_TEXT);
        Object.keys(checkedGroups).forEach(group => {
          // If the user has checked the boxes but has not applied the selections,
          // we clear the selection when the user closes the menu.
          if (!checkedGroups[group].isApplied) {
            setCheckedGroups((prev) => ({
              ...prev,
              [group]: {
                ...prev[group],
                checked: false,
              },
            }));
            // If the user has unchecked the boxes but has not applied the selections,
            // we revert back to the previously selected boxes when the user closes the menu.
          } else if (!checkedGroups[group].isChecked && !checkedGroups[group]?.isUnapplied) {
            setDropdownToggleLabel(dropdownToggleLabel);
            setCheckedGroups((prev) => ({
              ...prev,
              [group]: {
                ...prev[group],
                checked: true,
              },
            }));
          }
        });
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [checkedGroups, setCheckedGroups, setDropdownToggleLabel, dropdownToggleLabel]);

  const handleGroupsChanged = useCallback(async (groups) => {
    if (Object.keys(groups).length === 0) {
      setGroupMemberEmails([]);
      onGroupSelectionsChanged([]);
    }
  }, [onGroupSelectionsChanged, setGroupMemberEmails]);

  const handleSubmitGroup = () => {
    const memberEmails = [];
    Object.keys(checkedGroups).forEach(group => {
      if (checkedGroups[group].checked) {
        checkedGroups[group].memberEmails.forEach(email => {
          if (!memberEmails.includes(email)) {
            memberEmails.push(email);
          }
        });
        setCheckedGroups((prev) => ({
          ...prev,
          [group]: {
            ...prev[group],
            isApplied: true,
          },
        }));
      } else if (!checkedGroups[group].checked && !checkedGroups[group].isUnapplied) {
        setCheckedGroups((prev) => ({
          ...prev,
          [group]: {
            ...prev[group],
            isUnapplied: true,
            checked: false,
          },
        }));
      }
    });
    setGroupMemberEmails(memberEmails);
  };

  return {
    dropdownRef,
    handleCheckedGroupsChanged,
    handleGroupsChanged,
    handleSubmitGroup,
  };
};

export default useGroupDropdownToggle;