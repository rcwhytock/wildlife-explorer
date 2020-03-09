import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Alignment, Button } from '@blueprintjs/core';

import Home from '../components/Home';
import routes from '../constants/routes.json';

export default function HomePage() {
  return (
    <>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>Blueprint</Navbar.Heading>
          <Navbar.Divider />
          <Link to={routes.COUNTER}>
            <Button className="bp3-minimal" icon="home" text="Classify" />
          </Link>
          <Link to={routes.COUNTER}>
            <Button className="bp3-minimal" icon="document" text="Explore" />
          </Link>
        </Navbar.Group>
      </Navbar>
      <Home />
    </>
  );
}
