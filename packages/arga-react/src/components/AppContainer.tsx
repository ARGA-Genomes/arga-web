import React from 'react';
import { Route } from 'wouter';
import Basket from './Basket';
import Search from './Search';
// import ArgaToolbar from './ArgaToolbar'

function AppContainer(): React.ReactElement {
  return (
    <div>
      {/* <ArgaToolbar /> */}
      <Route path="/">
        <Search />
      </Route>
      <Route path="/basket">
        <Basket />
      </Route>
    </div>
  );
}

export default AppContainer;
