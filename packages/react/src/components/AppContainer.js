import React from 'react'
import { Route } from 'wouter'
import { Box } from '@mui/material'
import Basket from './Basket'
import Search from './Search'
import ArgaToolbar from './ArgaToolbar'

function AppContainer() {
  return (
    <Box sx={{ display: 'flex' }}>
      <ArgaToolbar />
      <Route path="/">
        <Search />
      </Route>
      <Route path="/basket">
        <Basket />
      </Route>
    </Box>
  )
}

export default AppContainer
