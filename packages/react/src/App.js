import { CssBaseline } from '@mui/material'
import { BrowserRouter as Router } from 'react-router-dom'
import {
  ThemeProvider,
  createTheme,
  responsiveFontSizes,
} from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
// import { getDesignTokens, getThemedComponents } from './components/theme'
import React from 'react'
import './App.css'
import Search from './components/Search'
import theme from './components/theme'

// Taken from  https://stackoverflow.com/a/71701142/249327
const ColorModeContext = React.createContext({
  toggleColorMode: () => {
    // This is intentional
  },
})

function App() {
  // const theme = React.useMemo(
  //   () =>
  //     createTheme({
  //       palette: {
  //         mode,
  //       },
  //     }),
  //   [mode]
  // )
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setMode] = React.useState()

  React.useEffect(() => {
    setMode(prefersDarkMode ? 'dark' : 'light')
  }, [prefersDarkMode])

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))
      },
    }),
    []
  )

  let respTheme = React.useMemo(() => createTheme(theme), [mode])

  respTheme = responsiveFontSizes(respTheme)

  return (
    <Router>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={respTheme}>
          <CssBaseline />
          <Search />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </Router>
  )
}

export default App
