import { CssBaseline } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
// import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from 'react-oidc-context'
import { CartProvider } from 'react-use-cart'
import './assets/App.css'
import config from './components/config'
import theme from './components/theme'
import AppContainer from './components/AppContainer'

function onAddItem() {
  window.alert('Item was added to your saved sequences list')
}

function App() {
  return (
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
        <CartProvider onItemAdd={onAddItem}>
          <CssBaseline />
          <AppContainer />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
