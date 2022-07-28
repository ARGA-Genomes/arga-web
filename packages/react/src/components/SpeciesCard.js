import React from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Collapse,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ShareIcon from '@mui/icons-material/Share'
import {
  // ExpandMore,
  // ExpandLess,
  Article,
} from '@mui/icons-material'
import logoimage from '../assets/ARGA-logo-notext.png'

const bieUrlPrefix = 'https://bie-ws.ala.org.au/ws/species/'
const biocacheUrlPrefix = 'https://biocache-ws.ala.org.au/ws/occurrences/search'
const biocacheUrlPostfix =
  '&fq=multimedia:%22Image%22&pageSize=1&facet=off&start=0&fq=-type_status:*&fq=-basis_of_record:PreservedSpecimen&fq=-identification_qualifier_s:%22Uncertain%22&fq=geospatial_kosher:true&fq=-user_assertions:50001&fq=-user_assertions:50005&sort=identification_qualifier_s'

function getImageUrl(imageId) {
  const idArr = imageId.slice(-4).split('')
  return `https://images.ala.org.au/store/${idArr[3]}/${idArr[2]}/${idArr[1]}/${idArr[0]}/${imageId}/thumbnail_square_darkGray`
}

function SpeciesCard({ record, index, setRecordState }) {
  const [expanded] = React.useState(false)
  const [imageState, setImageState] = React.useState({
    url: logoimage,
    isLoading: false,
    hasImage: false,
    bieChecked: false,
  })
  // console.log('record', record)
  // eslint-disable-next-line
  // const { recordOne } = record?.doclist?.docs[0] ?? recordOne
  // eslint-disable-next-line
  // const taxonConceptID = record.taxonConceptID

  // Try getting an image from BIE
  React.useEffect(() => {
    // const { taxonConceptID } = recordOne?.taxonConceptID
    if (!imageState.hasImage && !imageState.bieChecked) {
      console.log('BIE: taxonConceptID', record.doclist.docs[0].taxonConceptID)
      const fetchBieImage = async () => {
        setImageState((old) => ({ ...old, isLoading: true }))
        const resp = await fetch(
          `${bieUrlPrefix}${record.doclist.docs[0].taxonConceptID}`
        )
        const json = await resp.json()
        if (json.imageIdentifier) {
          // console.log('first call', taxonConceptID.slice(-4))
          setImageState((old) => ({
            ...old,
            isLoading: false,
            hasImage: true,
            bieChecked: true,
            url: getImageUrl(json.imageIdentifier),
          }))
        } else {
          setImageState((old) => ({
            ...old,
            isLoading: false,
            hasImage: false,
            bieChecked: true,
          }))
        }
      }
      fetchBieImage().catch((error) => {
        setImageState((old) => ({
          ...old,
          isLoading: false,
          bieChecked: true,
          message: error,
        }))
        // const msg = `Oops something went wrong. ${error.message}`
        // setSnackState({ status: true, message: msg })
      })
    }
  }, [imageState.url])

  // Fallback try getting an image from Biocache
  React.useEffect(() => {
    if (!imageState.hasImage && imageState.bieChecked) {
      console.log(
        'Biocache: taxonConceptID',
        record.doclist.docs[0].taxonConceptID
      )
      const fetchBiocacheImage = async () => {
        setImageState((old) => ({ ...old, isLoading: true }))
        const resp2 = await fetch(
          `${biocacheUrlPrefix}?q=lsid:${record.doclist.docs[0].taxonConceptID}${biocacheUrlPostfix}`
        )
        const json2 = await resp2.json()
        if (json2.occurrences && json2.occurrences.length === 1) {
          // console.log('second call YES', taxonConceptID.slice(-4))
          setImageState((old) => ({
            ...old,
            url: getImageUrl(json2.occurrences[0].image),
            hasImage: true,
            isLoading: false,
          }))
        } else {
          // console.log('second call NO', taxonConceptID.slice(-4))
          setImageState((old) => ({
            ...old,
            isLoading: false,
          }))
        }
      }
      fetchBiocacheImage().catch((error) => {
        setImageState((old) => ({
          ...old,
          isLoading: false,
          message: error,
        }))
      })
    }
  }, [imageState.bieChecked])

  // const handleExpandClick = () => {
  //   setExpanded(!expanded)
  // }

  // if (pageState.isLoading) {
  //   return <CircularProgress />
  // }

  return (
    <Card style={{}}>
      <CardHeader
        // avatar={<Avatar aria-label="Species">S</Avatar>}
        // action={
        //   <IconButton aria-label="settings">
        //     <MoreVertIcon />
        //   </IconButton>
        // }
        sx={{ height: '5vw', overflow: 'hidden' }}
        title={
          <Typography sx={{ fontWeight: 600, fontStyle: 'italic' }}>
            {record.groupValue}
          </Typography>
        }
        // subheader={record?.groupValue[0]?.vernacularName}
        subheader={record.doclist.docs[0].vernacularName}
        subheaderTypographyProps={{
          // overflow: 'hidden',
          fontSize: '0.8rem',
          // height: '2vw',
        }}
      />
      <Grid container justifyContent="center" height={200}>
        <CardMedia
          image={imageState.url}
          style={
            imageState.hasImage ? { opacity: 1 } : { filter: 'grayscale(90%)' }
          }
          // sx={{ display: 'flex', justifyContent: 'center' }}
          title="Taxon Image"
          component={imageState.isLoading ? CircularProgress : 'img'}
          height="200"
          alt={`Image of ${record.vernacularName || record.raw_scientificName}`}
        />
      </Grid>

      <CardContent>
        <Typography variant="body2" color="textSecondary" component="p">
          {record.doclist.docs.length} sequence record
          {record.doclist.docs.length > 1 ? `s are` : ' is'} available — expand
          to see details
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
        {/* <IconButton
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
          style={{ marginLeft: 'auto' }}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton> */}
        <IconButton
          sx={{ textTransform: 'none', marginLeft: 'auto' }}
          onClick={() =>
            setRecordState((old) => ({
              ...old,
              id: record.doclist.docs[0].id,
              speciesIndex: index,
            }))
          }
        >
          {' '}
          <Button size="small" variant="outlined" endIcon={<Article />}>
            {' '}
            View {record.doclist.docs.length}
          </Button>
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography component="h4" sx={{ borderBottom: '1px solid gray' }}>
            Sequences
          </Typography>
          {record.doclist.docs.map((sequence, idx) => (
            <Typography
              sx={{ borderTop: '1px' }}
              variant="body2"
              color="textSecondary"
              component="div"
            >
              {' '}
              <Typography
                component="h6"
                variant="body2"
                sx={{ paddingTop: '5px' }}
              >
                {index + 1}. {sequence.occurrenceID}
              </Typography>
              <Typography
                variant="body2"
                sx={{ padding: '5px 0', borderBottom: '1px solid gray' }}
              >
                Dataset: {sequence.dataResourceName}
                <br />
                Date: {sequence.eventDate && sequence.eventDate.slice(0, 10)}
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<Article />}
                  sx={{ textTransform: 'none' }}
                  onClick={() =>
                    setRecordState((old) => ({
                      ...old,
                      id: sequence.id,
                      speciesIndex: idx,
                    }))
                  }
                >
                  {' '}
                  View Record
                </Button>
              </Typography>{' '}
              {/* {Object.keys(sequence).map((item) => (
                <div>
                  <strong>{item}</strong> | {sequence[item]}
                </div>
              ))} */}
            </Typography>
          ))}
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default SpeciesCard
