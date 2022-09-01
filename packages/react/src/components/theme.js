import { createTheme } from '@mui/material'
import { lighten, darken } from '@mui/material/styles'

const light = 0.8
const mid = 0.4
const argaColours = {
  primary: '#233C4B', // dark blue
  secondary: '#f96f00', // orange
  warning: '#cb9f36', // yellow-mustard
  error: '#34A59D', // aqua blue
  success: '#80a253', // forest green
  grid: '#045a8d',
}
const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: argaColours.primary, // dark blue
      light: lighten(argaColours.primary, light),
      mid: lighten(argaColours.primary, mid),
    },
    secondary: {
      main: argaColours.secondary, // orange
      light: lighten(argaColours.secondary, light),
      mid: lighten(argaColours.secondary, mid),
    },
    warning: {
      // main: '#FEC743',
      main: argaColours.warning, // yellow-mustard
      light: lighten(argaColours.warning, light),
      mid: lighten(argaColours.warning, mid),
    },
    error: {
      main: argaColours.error, // aqua blue
      light: lighten(argaColours.error, light),
      mid: lighten(argaColours.error, mid),
    },
    success: {
      // main: '#A0CA68',
      main: argaColours.success, // forest green
      light: lighten(argaColours.success, light),
      mid: lighten(argaColours.success, mid),
    },
    grids: {
      main: argaColours.grid, // from https://colorbrewer2.org/#type=sequential&scheme=PuBu&n=5
      border: lighten(argaColours.grid, 0.7),
      coloursForCounts: {
        10: lighten(argaColours.grid, 0.9),
        50: lighten(argaColours.grid, 0.7),
        100: lighten(argaColours.grid, 0.4),
        500: lighten(argaColours.grid, 0),
        1000: darken(argaColours.grid, 0.2),
      },
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
