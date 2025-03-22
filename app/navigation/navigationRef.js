import React from 'react';

// Create a navigation reference that can be accessed by services
export const navigationRef = React.createRef();

// Helper function to navigate even when we don't have access to the navigation prop
export function navigate(name, params) {
  if (navigationRef.current) {
    navigationRef.current.navigate(name, params);
  } else {
    console.warn('Navigation reference is not set yet');
  }
}

// Helper function to go back
export function goBack() {
  if (navigationRef.current) {
    navigationRef.current.goBack();
  } else {
    console.warn('Navigation reference is not set yet');
  }
}

// Export methods that can be used outside of React components
export default {
  navigationRef,
  navigate,
  goBack,
}; 