import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@blueprintjs/core';
import { IconName } from '@blueprintjs/icons';

type Props = {
  iconName: IconName;
  text: string;
  link: string;
  active: boolean;
};

export default function SidebarItem(props: Props) {
  const { iconName, text, link, active } = props;

  return (
    <Link to={link}>
      <Button
        className="bp3-minimal"
        icon={iconName}
        text={text}
        style={{ color: '#fff', width: '100%', padding: '20px' }}
        alignText="left"
        active={active}
      />
    </Link>
  );
}
