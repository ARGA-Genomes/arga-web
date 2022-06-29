import * as React from 'react';
import { Table, TableBody, TableRow, TableCell, Collapse, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { startCase, words, replace } from "lodash";

function getFieldValue(field, data) {
  let value = findValueForKey(data.processed, field) || findValueForKey(data.raw, field) || findValueForKey(data, field) || undefined;

  if (typeof value === 'object') {
    // Misc properties - output as a formatted JSX elements
    value = replace(JSON.stringify(value, null, 1), /\{\s*|\s*\}|"/g,"");
    value = replace(value, /,*\n\s+/g,"\n");
    value = replace(value, /\]\s*$/g, "");
    let rows = value.split(/(\n)/gi);
    let newRows = [];
    for (var i = 1; i < rows.length; i += 1) {
      newRows.push(<React.Fragment key={i}><Typography component="p" sx={{ fontFamily: 'Roboto Mono', fontSize: '14px', wordWrap: 'break-all', marginTop: 0 }}>{rows[i]}</Typography></React.Fragment>);
    }
    value = <React.Fragment key={field}>{newRows}</React.Fragment>;
  } else if (typeof value === 'boolean') {
    // print out boolean values as String (otherwise `false` values will be excluded from output)
    value = value.toString();
  } else if (typeof value === 'string' && value.length > 15 && /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/.test(value)) {
    // ISO date - show date portion only
    value = value.substring(0,10);
  } else if (false && typeof value === 'object') {
    value = replace(JSON.stringify(value, null, 1));
  }

  const fixedWidthFields = ["taxonConceptID", "basisOfRecord", "catalogNumber", "occurrenceStatus", 
      "countryCode", "decimalLatitude", "decimalLongitude", "geodeticDatum","dynamicProperties_ncbi_biosample_attributes_json","name_and_lsid","common_name_and_lsid"];
  if (field.endsWith('scientificName') && words(value).length > 1) {
    value = (<em>{value}</em>);
  } else if (value && fixedWidthFields.includes(field) ){
    value = (<Typography sx={{ fontFamily: 'Roboto Mono', fontSize: '13px', wordWrap: 'break-all' }}>{value}</Typography>)
  }

  return value;
}

function mungeFieldName(field) {
  field = replace(field, "dynamicProperties_", "");
  field = replace(field, "ncbi_", "NCBI_");

  return field;
}

/**
 * Do a deep search for a key in a nested object (JSON doc)
 * 
 * @param {*} obj - nested object
 * @param {*} key = key to find value of (first instance found is returned)
 * @returns value for provided key
 */
function findValueForKey(obj, key) {
  let value = "";

  for (let k in obj) {
    if (k === key && Object.keys(obj[k]).length > 0)  {
      value = obj[k];
    } else if (!value && typeof obj[k] === 'object') {
      value = findValueForKey(obj[k], key);
    }
  }
  
  return value
}

export default function RecordSection({recordData, section, fieldList}) {
  const [open, setOpen] = React.useState(true);

  return (
    <React.Fragment key="section">
      <TableRow sx={{  backgroundColor: "rgb(240, 240, 240)" }} onClick={() => setOpen(!open)}>
        <TableCell style={{ width: "80%", paddingBottom: 4, paddingTop: 4}}>
          <Typography variant="h6" component="p" style={{fontSize:"1.1em"}}>
            {section}
          </Typography>
        </TableCell>
        <TableCell align="right" style={{ width: "10%", paddingBottom: 4, paddingTop: 4 }}>
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ padding: 0 }} colSpan={2}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Table aria-label="collapsible table" sx={{ tableLayout: 'fixed' }}>
              <TableBody>
              { fieldList.map((field) => (
                 getFieldValue(field, recordData) ?  (
                 <TableRow 
                      key={field} 
                      sx={{ ':last-child td': { borderBottom: 0 } }} >
                    <TableCell style={{ width: "30%", padding: 5, paddingLeft: 16, verticalAlign: 'top', opacity: 0.8 }} 
                        colSpan={6}>{startCase(mungeFieldName(field))}</TableCell>
                    <TableCell style={{ width: "70%", padding: 5, paddingLeft: 16, verticalAlign: 'top', wordBreak: 'break-all' }} 
                        colSpan={6}>{getFieldValue(field, recordData)}</TableCell>
                  </TableRow>) : <React.Fragment key={field}/>
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}