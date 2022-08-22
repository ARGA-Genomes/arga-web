import { createTheme } from '@mui/material'

const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#233C4B', // dark blue
      // main: '#1C303B',
    },
    secondary: {
      main: '#f96f00', // orange
    },
    warning: {
      // main: '#FEC743',
      main: '#cb9f36', // yellow-mustard
    },
    error: {
      main: '#34A59D', // aqua blue
    },
    success: {
      // main: '#A0CA68',
      main: '#80a253', // forest green
    },
    background: {
      default: '#E0E0E0',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#182a34',
    },
  },
  typography: {
    fontFamily: `"Rubik", "Work Sans", "Roboto", "Helvetica", "Arial", sans-serif`,
    fontSize: 14,
    color: '#4a4a4a',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
  },
  components: {
    // MuiAppBar: {
    //   styleOverrides: {
    //     colorPrimary: {
    //       // backgroundColor: '#1b3949',
    //       color: 'white',
    //     },
    //   },
    // },
    MuiTypography: {
      h5: {
        fontWeight: 600, // not working
      },
    },
    // MuiDataGrid: {
    //   styleOverrides: {
    //     root: {
    //       footerContainer: {
    //         border: '1px solid red',
    //         left: 0,
    //         bottom: 0, // <-- KEY
    //         zIndex: 2,
    //         position: 'sticky'
    //       }
    //     }
    //   }
    // }
  },
})

export default theme
