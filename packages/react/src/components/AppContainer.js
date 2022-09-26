import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Basket from './Basket'
import Search from './Search'
import ArgaToolbar from './ArgaToolbar'

function AppContainer() {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <ArgaToolbar />

        <Routes>
          <Route exact path="/" element={<Search />} />
          <Route path="/basket" element={<Basket />} />
        </Routes>
      </Box>
    </Router>
  )
}

export default AppContainer
