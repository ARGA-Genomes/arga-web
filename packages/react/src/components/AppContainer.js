import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'
import Basket from './Basket'
import Search from './Search'
import ArgaToolbar from './ArgaToolbar'

function AppContainer() {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <ArgaToolbar />
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <Routes>
            <Route exact path="/" element={<Search />} />
            <Route path="/basket" element={<Basket />} />
          </Routes>
        </QueryParamProvider>
      </Box>
    </Router>
  )
}

export default AppContainer
