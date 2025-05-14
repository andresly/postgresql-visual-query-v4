import React, { useState } from 'react';

interface WithToggleProps {
  toggle?: () => void;
  toggleStatus?: boolean;
}

export const withToggle = <P extends object>(
  WrappedComponent: React.ComponentType<P & WithToggleProps>,
): React.FC<Omit<P, keyof WithToggleProps>> => {
  return (props) => {
    const [toggleStatus, setToggleStatus] = useState(false);

    const toggle = () => {
      setToggleStatus(!toggleStatus);
    };

    return <WrappedComponent {...(props as P)} toggle={toggle} toggleStatus={toggleStatus} />;
  };
};

export default withToggle;
