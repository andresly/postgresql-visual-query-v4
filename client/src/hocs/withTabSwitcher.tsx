import React, { useState, ComponentType } from 'react';

interface WithTabSwitcherProps {
  toggle: (tab: string) => void;
  activeTab: string;
}

export const withTabSwitcher =
  <P extends object>(WrappedComponent: ComponentType<P & WithTabSwitcherProps>) =>
  (props: P): React.ReactElement => {
    const [activeTab, setActiveTab] = useState('1');

    const toggle = (tab: string): void => {
      if (activeTab !== tab) {
        setActiveTab(tab);
      }
    };

    return <WrappedComponent {...props} toggle={toggle} activeTab={activeTab} />;
  };
