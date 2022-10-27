import {
  Toolbar,
  Typography,
  AppBar,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { Link } from 'react-router-dom'
// import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined'
// import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import React, { useState, useCallback } from 'react'
import { useAuth } from 'react-oidc-context'
import { useCart } from 'react-use-cart'
import theme from './theme'
import logo from '../assets/ARGA-logo-notext.png'

export default function ArgaToolbar() {
  const [openAbout, setOpenAbout] = useState(false)
  const handleAboutOpen = () => setOpenAbout(true)
  const handleAboutClose = () => setOpenAbout(false)
  // const showBasket = () => {
  //   console.log('basket should appear')
  // }

  const auth = useAuth()
  const toggleLogin = useCallback(() => {
    if (auth.isAuthenticated) {
      auth.signoutRedirect()
    } else {
      auth.signinRedirect()
    }
  }, [auth])

  const { totalItems } = useCart()

  // CSS styles
  const styles = {
    button: {
      textTransform: 'none',
      // margin: '6px 0',
      color: theme.palette.background.paper,
      borderColor: theme.palette.background.paper,
      marginRight: 2,
    },
  }

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ height: 76, fontFamily: 'Raleway' }}>
        <a href="https://arga.org.au">
          <img
            src={logo}
            alt="ARGA logo"
            style={{ height: 68, marginRight: 8 }}
          />
        </a>
        <Typography
          variant="span"
          sx={{ fontSize: '14px', lineHeight: '15px', marginRight: 4 }}
        >
          <span style={{ fontWeight: 700 }}>A</span>
          <span style={{ fontWeight: 400 }}>ustralian</span>
          <br />
          <span style={{ fontWeight: 700 }}>R</span>
          <span style={{ fontWeight: 400 }}>eference</span>
          <br />
          <span style={{ fontWeight: 700 }}>G</span>
          <span style={{ fontWeight: 400 }}>enome</span>
          <br />
          <span style={{ fontWeight: 700 }}>A</span>
          <span style={{ fontWeight: 400 }}>tlas</span>
        </Typography>
        <Typography
          sx={{
            fontWeight: 500,
            fontFamily: 'Raleway',
            flexGrow: 1,
            typography: { sm: 'h5', xs: 'h6' },
          }}
        >
          <span style={{ fontWeight: 700 }}>SeqBrwsr</span>{' '}
          <span style={{ fontWeight: 400 }}>Demo</span>
        </Typography>
        <Tooltip title="About ARGA">
          <IconButton
            size="medium"
            aria-label="about-arga"
            onClick={handleAboutOpen}
            // color="warning"
            sx={styles.button}
          >
            <InfoOutlined fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title={auth.isAuthenticated ? 'Logout' : 'Login'}>
          <Button
            variant="outlined"
            // color="warning"
            aria-label="show-basket"
            onClick={toggleLogin}
            sx={styles.button}
          >
            {auth.isAuthenticated ? 'Logout' : 'Login'}
          </Button>
        </Tooltip>
        <Tooltip title="View your saved sequences basket">
          <IconButton
            component={Link}
            to="/basket"
            size="medium"
            aria-label="view-basket"
            // onClick={viewBasket}
            sx={styles.button}
          >
            <Badge badgeContent={totalItems} color="secondary">
              <ShoppingCartOutlinedIcon fontSize="large" />
            </Badge>
          </IconButton>
        </Tooltip>
        <Dialog open={openAbout} onClose={handleAboutClose}>
          <DialogTitle>About ARGA</DialogTitle>
          <DialogContent sx={{ padding: '0 24px 10px 24px' }}>
            <DialogContentText>
              {/* TODO: pull this content out of a MD file in a GH Wiki or from the static WP site */}
              site ARGA is the Australian Reference Genome Atlas. It is an
              indexing service for aggregating, discovering, filtering and
              accessing complex life science data. ARGA is an NCRIS-enabled
              platform powered by the{' '}
              <a href="https://ala.org.au" target="_blank" rel="noreferrer">
                Atlas of Living Australia (ALA)
              </a>
              , in collaboration with{' '}
              <a
                href="https://bioplatforms.com/"
                target="_blank"
                rel="noreferrer"
              >
                Bioplatforms Australia
              </a>{' '}
              and the{' '}
              <a
                href="https://www.biocommons.org.au/"
                target="_blank"
                rel="noreferrer"
              >
                Australian BioCommons
              </a>
              , with investment from the{' '}
              <a href="https://ardc.edu.au/" target="_blank" rel="noreferrer">
                Australian Research Data Commons (ARDC)
              </a>
              .
            </DialogContentText>
            <DialogContentText>&nbsp;</DialogContentText>
            <DialogContentText>
              This &quot;Data Brwsr Demo&quot; app is a simple search interface
              for finding and inspecting the raw sequence data records. It is
              not intended to reflect the final ARGA user interface.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleAboutClose}
              autoFocus
              variant="contained"
              color="primary"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  )
}
