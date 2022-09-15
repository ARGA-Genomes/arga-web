import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from 'react-oidc-context'
import './assets/App.css'
import config from './components/config'
import theme from './components/theme'
import Search from './components/Search'

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AuthProvider
          client_id={config.client_id}
          authority={config.authority}
          redirect_uri={config.redirect_uri}
          onSigninCallback={() => {
            // console.log(user)
            window.history.replaceState({ path: '/' }, '', '/')
          }}
        >
          <CssBaseline />
          <Search />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
