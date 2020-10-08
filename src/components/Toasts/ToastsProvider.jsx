import React, { createContext, useState } from 'react';
import PropTypes from 'prop-types';

export const ToastsContext = createContext();

const ToastsProvider = ({ children }) => {
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

  const removeToast = (id) => {
    const index = toasts.findIndex(toast => toast.id === id);
    setToasts((prevToasts) => {
      const newToasts = [...prevToasts];
      newToasts.splice(index, 1);
      return newToasts;
    });
  };

  return (
    <ToastsContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastsContext.Provider>
  );
};

ToastsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ToastsProvider;
