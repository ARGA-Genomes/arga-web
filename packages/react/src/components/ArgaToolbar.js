import { Toolbar, Typography } from '@mui/material'
import React from 'react'
import logo from '../ARGA-logo-notext.png'

export default function ArgaToolbar() {
  return (
    <Toolbar sx={{ height: 80, fontFamily: 'Raleway' }}>
      {/* <SvgIcon style={{ height: 90, width: 282 }}> //  transform: 'scale(2.5)'
        <ArgaLogo />
      </SvgIcon> */}
      <img src={logo} alt="ARGA logo" style={{ height: 70, marginRight: 8 }} />
      <Typography
        variant="span"
        sx={{ fontSize: '14px', lineHeight: '16px', marginRight: 5 }}
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
      <Typography variant="h5" sx={{ fontWeight: 500, fontFamily: 'Raleway' }}>
        <span style={{ fontWeight: 700 }}>Data Brwsr</span>{' '}
        <span style={{ fontWeight: 300 }}>Demo</span>
      </Typography>
    </Toolbar>
  )
}
