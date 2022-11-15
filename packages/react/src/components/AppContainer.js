import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AppShell } from '@mantine/core'
// import { Box } from '@mui/material'
// import Basket from './Basket'
// import Search from './Search'
import ArgaToolbar from './ArgaToolbar'

function AppContainer() {
  return (
    <Router>
      <AppShell
        // fixed
        padding="md"
        // navbar={
        //   <Navbar width={{ base: 300 }} height={500} p="xs">
        //     {/* Navbar content */}
        //   </Navbar>
        // }
        header={
          <ArgaToolbar />
          // <Header height={60} p="xs">
          //   {/* Header content */}
          // </Header>
        }
        styles={(theme) => ({
          main: {
            backgroundColor:
              theme.colorScheme === 'dark'
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        })}
      >
        {/* <Routes>
          <Route exact path="/" element={<Search />} />
          <Route path="/basket" element={<Basket />} />
        </Routes> */}
      </AppShell>
      {/* <Container sx={{ display: 'flex' }}>
        <ArgaToolbar />
        <Routes>
          <Route exact path="/" element={<Search />} />
          <Route path="/basket" element={<Basket />} />
        </Routes>
      </Container> */}
    </Router>
  )
}

export default AppContainer
