const config = {
  // authority: import.meta.env.VITE_OIDC_AUTHORITY,
  // client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
  // redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
  authority: process.env.REACT_APP_OIDC_AUTHORITY,
  client_id: process.env.REACT_APP_OIDC_CLIENT_ID,
  redirect_uri: process.env.REACT_APP_OIDC_REDIRECT_URI,
}

export default config
