import React from 'react'
import {
  // Avatar,
  Button,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  // Chip,
  Collapse,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
  Badge,
  styled,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ShareIcon from '@mui/icons-material/Share'
import {
  // ExpandMore,
  // ExpandLess,
  Article,
  TextSnippet,
} from '@mui/icons-material'
// import { lighten } from '@mui/material/styles'
import logoimage from '../assets/ARGA Logomark MONO REVERSED.png'
import theme from './theme'

const bieUrlPrefix = 'https://bie-ws.ala.org.au/ws/species/'
const biocacheUrlPrefix = 'https://biocache-ws.ala.org.au/ws/occurrences/search'
const biocacheUrlPostfix =
  '&fq=multimedia:%22Image%22&pageSize=1&facet=off&start=0&fq=-type_status:*&fq=-basis_of_record:PreservedSpecimen&fq=-identification_qualifier_s:%22Uncertain%22&fq=geospatial_kosher:true&fq=-user_assertions:50001&fq=-user_assertions:50005&sort=identification_qualifier_s'

function getImageUrl(imageId) {
  const idArr = imageId.slice(-4).split('')
  return `https://images.ala.org.au/store/${idArr[3]}/${idArr[2]}/${idArr[1]}/${idArr[0]}/${imageId}/thumbnail_square_darkGray`
}

const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 11,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
    color: 'white',
  },
}))

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
      // console.log('BIE: taxonConceptID', record.doclist.docs[0].taxonConceptID)
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
      // console.log(
      //   'Biocache: taxonConceptID',
      //   record.doclist.docs[0].taxonConceptID
      // )
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

  // const [docs] = record.doclist.docs
  const drCounts = record.doclist.docs.reduce((accumulator, currentValue) => {
    if (accumulator[currentValue.dataResourceName]) {
      accumulator[currentValue.dataResourceName] += 1
    } else {
      accumulator[currentValue.dataResourceName] = 1
    }

    return accumulator
  }, {})

  // console.log('drCounts', drCounts)

  // const dataResourceArr = pageState.facetResults.dataResourceName
  // const newValueArray = []
  // for (let i = 0; i < dataResourceArr.length; i += 2) {
  //   const name = dataResourceArr[i]
  //   const count = dataResourceArr[i + 1]
  //   newValueArray.push({ name, count })
  // }

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
        sx={{
          overflow: 'hidden',
          height: '75px',
        }}
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
      <Grid
        container
        justifyContent="center"
        height={200}
        sx={{
          backgroundColor: theme.palette.primary.main,
        }}
      >
        <CardMedia
          image={imageState.url}
          style={
            imageState.hasImage
              ? { filter: 'none' }
              : {
                  filter: 'invert(25%)',
                }
          }
          // sx={{ display: 'flex', justifyContent: 'center' }}
          title="Taxon Image"
          component={imageState.isLoading ? CircularProgress : 'img'}
          height="200"
          alt={`Image of ${record.vernacularName || record.raw_scientificName}`}
        />
      </Grid>

      <CardContent sx={{ height: '105px', overflow: 'hidden' }}>
        <Typography variant="body2" color="textSecondary" component="div">
          {record.doclist.docs.length} sequence record{' '}
          {record.doclist.docs.length > 1 ? `s are` : ' is'} available
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          component="ul"
          sx={{ paddingInlineStart: '20px' }}
        >
          {Object.keys(drCounts).map((key) => (
            // <Chip
            //   avatar={<Avatar>{drCounts[key]}</Avatar>}
            //   label={key}
            //   size="small"
            //   // color="success"
            // />
            <li variant="body2" color="textSecondary" component="p" key={key}>
              {key}
              <StyledBadge
                color="success"
                badgeContent={drCounts[key]}
                showZero
              >
                <TextSnippet />
              </StyledBadge>
            </li>
          ))}
          {/* — expand to see details */}
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
        <Button
          sx={{ textTransform: 'none', marginLeft: 'auto' }}
          onClick={() =>
            setRecordState((old) => ({
              ...old,
              id: record.doclist.docs[0].id,
              speciesIndex: index,
            }))
          }
          size="small"
          variant="outlined"
          endIcon={<Article />}
        >
          View {record.doclist.docs.length}
        </Button>
      </CardActions>
      {/* TODO Collapse is not being used - was disabled for simplicioty so code below can be deleted */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography component="h4" sx={{ borderBottom: '1px solid gray' }}>
            Sequences
          </Typography>
          {record.doclist.docs.map((sequence, idx) => (
            <Typography
              key={sequence.id}
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
