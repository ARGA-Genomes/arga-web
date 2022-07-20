import {
  Toolbar,
  Typography,
  AppBar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from '@mui/material'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import React from 'react'
import logo from '../assets/ARGA-logo-notext.png'

export default function ArgaToolbar() {
  const [openAbout, setOpenAbout] = React.useState(false)
  const handleAboutOpen = () => setOpenAbout(true)
  const handleAboutClose = () => setOpenAbout(false)

  return (
    <AppBar position="fixed">
      <Toolbar sx={{ height: 76, fontFamily: 'Raleway' }}>
        <img
          src={logo}
          alt="ARGA logo"
          style={{ height: 68, marginRight: 8 }}
        />
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
          <span style={{ fontWeight: 700 }}>Data Brwsr</span>{' '}
          <span style={{ fontWeight: 400 }}>Demo</span>
        </Typography>
        <IconButton
          size="medium"
          aria-label="about-arga"
          onClick={handleAboutOpen}
          color="inherit"
        >
          <InfoOutlined fontSize="large" />
        </IconButton>
        <Dialog open={openAbout} onClose={handleAboutClose}>
          <DialogTitle>About ARGA</DialogTitle>
          <DialogContent sx={{ padding: '0 24px 10px 24px' }}>
            <DialogContentText>
              ARGA is the Australian Reference Genome Atlas. It is an indexing
              service for aggregating, discovering, filtering and accessing
              complex life science data. ARGA is an NCRIS-enabled platform
              powered by the{' '}
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
            <Button onClick={handleAboutClose} autoFocus variant="outlined">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  )
}
