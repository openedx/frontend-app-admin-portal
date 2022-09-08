import React, {
  createContext, useState, useMemo, useCallback,
} from 'react';
import PropTypes from 'prop-types';

export const ToastsContext = createContext();

function ToastsProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message) => {
    setToasts(prevToasts => [
      ...prevToasts,
      {
        id: prevToasts.length,
        message,
      },
    ]);
  };

  const removeToast = useCallback((id) => {
    const index = toasts.findIndex(toast => toast.id === id);
    setToasts((prevToasts) => {
      const newToasts = [...prevToasts];
      newToasts.splice(index, 1);
      return newToasts;
    });
  }, [toasts]);

  const contextValue = useMemo(() => [toasts, addToast, removeToast], [removeToast, toasts]);

  return (
    <ToastsContext.Provider value={contextValue}>
      {children}
    </ToastsContext.Provider>
  );
}

ToastsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ToastsProvider;
