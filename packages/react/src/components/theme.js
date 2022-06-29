import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#233C4B'
    },
    secondary: {
      main: '#F47C2E'
    },
    background: {
      default: '#E0E0E0',
      paper: '#FFFFFF',
    },
    text: {
      primary: "#182a34"
    }
  },
  typography: {
    "fontFamily": `"Rubik", "Work Sans", "Roboto", "Helvetica", "Arial", sans-serif`,
    "fontSize": 14,
    "fontWeightLight": 300,
    "fontWeightRegular": 400,
    "fontWeightMedium": 500
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          color: "white",
        }
      }
    },
    MuiTypography: {
      h5: {
        fontWeight: 600 // not working
      }
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
  }
});

export default theme;