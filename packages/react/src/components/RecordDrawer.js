import * as React from 'react';
import { SwipeableDrawer, Typography, Divider, Paper, List, ListItem, ListItemIcon, ListItemText, 
    TableContainer, Table, TableBody, IconButton, BottomNavigationAction, BottomNavigation, CircularProgress } from '@mui/material';
import { TravelExploreOutlined, ChevronRight, ChevronLeft } from '@mui/icons-material/';
import useMediaQuery from '@mui/material/useMediaQuery';
import theme from './theme';
import RecordSection from './RecordSection';

function getMiscFields(data, fieldListMap) {
  const miscFields = [];
  const allKnownFields = Object.values(fieldListMap).flat();
  Object.keys(data).forEach( field => !allKnownFields.includes(field) && miscFields.push(field) )
  return miscFields;
}

const fieldListMap = {
  "Summary":        ["scientificName", "dataResourceName", "dynamicProperties_ncbi_assembly_accession", "basisOfRecord", "eventDate"],
  "Record":         ["institutionName","collectionName", "dataResourceName", "datasetName", "basisOfRecord"],
  "Taxon":          ["scientificName", "raw_scientificName", "scientificNameAuthorship", "vernacularName", "taxonConceptID", "taxonRank", "kingdom", 
                      "phylum", "class", "order", "family", "genus", "matchType" ],
  "Location":       ["country", "countryCode", "stateProvince", "locality", "verbatimLocality", "decimalLatitude", "decimalLongitude", 
                      "geodeticDatum", "terrestrial"],
  "Occurrence":     ["occurrenceID", "institutionCode", "collectionCode", "catalogNumber", "recordNumber", "datasetID",
                      "basisOfRecord", "samplingProtocol", "preparations", "recordedBy", "establishmentMeans","reproductiveCondition", 
                      "occurrenceStatus"],
  "Event":          ["eventDate", "datePrecision", "eventRemarks", "marine"],
  "Identification": ["typeStatus", "identifiedBy", "identifiedByID", "identificationQualifier", "identificationID", "dateIdentified", 
                      "identificationAttributes", "verbatimIdentification"],
  "Other":          ["license", "bibliographicCitation",  "lastModifiedTime", "provenance", "geospatiallyKosher", "miscProperties" ]
};

export default function RecordDrawer({ drawerState, toggleDrawer, recordState, stepRecord }) {

  const anchor = "right";
  const largeScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const drawerWidth = (largeScreen) ? "50%" : "95%";
  console.log("drawerWidth", drawerWidth, largeScreen);

  return (
      <React.Fragment key={anchor}>
        <SwipeableDrawer 
          PaperProps={{sx:{ width: drawerWidth }}}
          anchor={anchor}
          open={drawerState}
          onClose={toggleDrawer}
          onOpen={toggleDrawer}
        >
          {recordState.isLoading && (
            <CircularProgress
              size={68}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                zIndex: 1,
              }}
            />
          )}
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            <ListItem alignItems="flex-start">
              <ListItemIcon>
                <IconButton onClick={toggleDrawer}><ChevronRight /></IconButton>
              </ListItemIcon>
              <ListItemIcon>
                <TravelExploreOutlined fontSize="large"/>
              </ListItemIcon>
              <ListItemText
                primary={
                  <React.Fragment>
                    <Typography
                      sx={{ fontSize: '1.2rem' }}
                      component="span"
                      variant="h6"
                      color="text.primary"
                    >
                      Genome Sequence Record 
                    </Typography>
                  </React.Fragment>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{  fontFamily: 'Roboto Mono', fontSize: '0.9rem' }}
                      component="span"
                      variant="p"
                      color="text.primary"
                    >
                      {recordState.data?.id}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            <Divider variant="" component="" />
            <Paper sx={{ width: '100%', marginBottom: '56px' }}>
              <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                  <TableBody>
                    { Object.keys(fieldListMap).map((section) => (
                      <RecordSection key={section} recordData={recordState.data} section={section} fieldList={fieldListMap[section]}/>
                    ))}
                    <RecordSection recordData={recordState.data} section="Misc" fieldList={getMiscFields(recordState.data, fieldListMap)}/>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </List>
          <Paper sx={{ position: 'fixed', bottom: 0, right: 0, width: drawerWidth }} elevation={3}>
            <BottomNavigation showLabels>
              <BottomNavigationAction 
                  label="Previous" 
                  icon={<ChevronLeft/>} 
                  onClick={()=>stepRecord(recordState.id, 'previous')}
                  disabled={recordState.isLoading}
              />
              <BottomNavigationAction 
                  label="Next" 
                  icon={<ChevronRight />} 
                  onClick={()=>stepRecord(recordState.id, 'next')}
                  disabled={recordState.isLoading}
              />
            </BottomNavigation>
          </Paper>
        </SwipeableDrawer>
      </React.Fragment>
  );
}
