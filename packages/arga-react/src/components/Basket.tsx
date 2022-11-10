import React from 'react';
import { Link } from 'wouter';
import {
  Container,
  Grid,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Box
} from '@mui/material';
// import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import DeleteIcon from '@mui/icons-material/Delete';
// import FileDownloadIcon from '@mui/icons-material/FileDownload'
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useCart } from 'react-use-cart';
import SequenceDownload from './SequenceDownload';

export const displayFields = {
  occurrenceID: 'Accession',
  dataResourceName: 'Dataset',
  scientificName: 'Scientific Name',
  vernacularName: 'Common Name',
  dynamicProperties_geneticAccessionURI: 'Accession URL',
  numberOfSequences: 'Sequence count',
  eventDate: 'Date'
};

export function formatSavedSequence(outputObj: any) {
  return (
    <TableContainer>
      <Table
        size="small"
        sx={{ border: '1px solid rgba(224, 224, 224, 1)' }}
        aria-label="Saved items table"
      >
        <TableBody>
          {Object.keys(outputObj)
            .sort()
            .map((fieldname) => (
              <TableRow key={fieldname}>
                <TableCell sx={{ width: '20%' }} data-test-id="fieldName">
                  {fieldname}
                </TableCell>
                <TableCell sx={{ width: '80%' }} data-test-id="fieldValue">
                  {outputObj[fieldname]}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function pruneSequenceObject(record) {
  if (!record.data) {
    return 'Error: no data found for {record.id}';
  }

  const outputObj = {};
  Object.keys(record.data).forEach((it) => {
    if (Object.keys(displayFields).includes(it)) {
      outputObj[displayFields[it]] = record.data[it];
    }
  });

  if (record.data.associatedSequences) {
    outputObj[displayFields.numberOfSequences] =
      record.data.associatedSequences.length;
  } else {
    outputObj[displayFields.numberOfSequences] = 1;
  }

  return outputObj;
}

const buttonStyle = {
  marginRight: 2,
  textTransform: 'none'
};

function BasketItems() {
  const { isEmpty, items, removeItem, emptyCart } = useCart();

  let content = (
    <Typography sx={{ marginLeft: 2 }}>
      No items in your saved basket
    </Typography>
  );

  if (!isEmpty) {
    content = (
      <List>
        <Box sx={{ marginLeft: 2 }}>
          <Button
            variant="contained"
            color="primary"
            sx={buttonStyle}
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (
                window.confirm(
                  'Are you sure? All saved items will be removed.'
                ) === true
              ) {
                emptyCart();
              }
            }}
          >
            Clear all saved items
          </Button>
        </Box>
        {items.map((item) => (
          <ListItem key={item.id}>
            <ListItemText>
              <Paper sx={{ padding: 2 }}>
                {formatSavedSequence(pruneSequenceObject(item))}
                <Box sx={{ marginTop: 2 }}>
                  <SequenceDownload data={item.data} size="medium" />
                  <br />
                  <Button
                    variant="outlined"
                    sx={buttonStyle}
                    startIcon={<CloudUploadIcon />}
                    onClick={() => {
                      window.alert('Not yet implemented');
                    }}
                  >
                    Export sequence file to Galaxy
                  </Button>
                  <Button
                    variant="outlined"
                    sx={buttonStyle}
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      if (window.confirm('Are you sure?') === true) {
                        removeItem(item.id);
                      }
                    }}
                  >
                    Remove from list
                  </Button>
                </Box>
              </Paper>
            </ListItemText>
          </ListItem>
        ))}
      </List>
    );
  }
  return content;
}

function Basket() {
  return (
    <Container sx={{ marginTop: '80px', marginBottom: '72px', padding: 1 }}>
      <Button
        component={Link}
        to="/"
        variant="contained"
        color="primary"
        startIcon={<ArrowBackIcon />}
        sx={{ marginLeft: 2 }}
      >
        Back to Search
      </Button>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Box sx={{ marginLeft: 2 }}>
            <h2>Saved sequences</h2>
          </Box>
          <BasketItems />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Basket;
