import { useCallback, useMemo, useState } from "react";
import debounce from "lodash.debounce";

const useCouponCodeSelections = (couponCodes, totalCouponCount) => {
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [hasAllCodesSelected, setAllCodesSelected] = useState(false);

  const onSelectedRowsChanged = useCallback(
    (selectedRowIds) => {
      const newSelectedCodes = Object.keys(selectedRowIds).map((codeIdx) => couponCodes[codeIdx]);
      setSelectedCodes(newSelectedCodes);
      setAllCodesSelected(newSelectedCodes?.length === totalCouponCount);
    }, [couponCodes]
  );

  // CHECK: Is debounce necessary?
  const debouncedOnSelectedRowsChanged = useMemo(
    () => debounce(onSelectedRowsChanged, 300),
    [onSelectedRowsChanged]
  );

  return {
    selectedCodes,
    setSelectedCodes,
    hasAllCodesSelected,
    setAllCodesSelected,
    onSelectedRowsChanged: debouncedOnSelectedRowsChanged
  };
};

export default useCouponCodeSelections;
