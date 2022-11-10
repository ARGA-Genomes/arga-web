import { AuthProvider } from 'react-oidc-context';
import { CartProvider } from 'react-use-cart';
import { MantineProvider } from '@mantine/core';
import './assets/App.css';
import config from './components/config';
import AppContainer from './components/AppContainer';
// import './App.css'

function onAddItem() {
  window.alert('Item was added to your saved sequences list');
}

function App() {
  return (
    <MantineProvider
      theme={{
        // Override any other properties from default theme
        fontFamily: 'Open Sans, sans serif',
        spacing: { xs: 15, sm: 20, md: 25, lg: 30, xl: 40 }
      }}
    >
      <AuthProvider
        client_id={config.client_id}
        authority={config.authority}
        redirect_uri={config.redirect_uri}
        onSigninCallback={() => {
          // console.log(user)
          window.history.replaceState({ path: '/' }, '', '/');
        }}
      >
        <CartProvider onItemAdd={onAddItem}>
          {/* <CssBaseline /> */}
          <AppContainer />
        </CartProvider>
      </AuthProvider>
    </MantineProvider>
  );
}

export default App;
