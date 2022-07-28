import React from 'react'
import {
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
import { ExpandMore, ExpandLess } from '@mui/icons-material'
import logoimage from '../assets/ARGA-logo-notext.png'

const bieUrlPrefix = 'https://bie-ws.ala.org.au/ws/species/'
const biocacheUrlPrefix = 'https://biocache-ws.ala.org.au/ws/occurrences/search'
const biocacheUrlPostfix =
  '&fq=multimedia:%22Image%22&pageSize=1&facet=off&start=0&fq=-type_status:*&fq=-basis_of_record:PreservedSpecimen&fq=-identification_qualifier_s:%22Uncertain%22&fq=geospatial_kosher:true&fq=-user_assertions:50001&fq=-user_assertions:50005&sort=identification_qualifier_s'

function getImageUrl(imageId) {
  const idArr = imageId.slice(-4).split('')
  return `https://images.ala.org.au/store/${idArr[3]}/${idArr[2]}/${idArr[1]}/${idArr[0]}/${imageId}/thumbnail_square_darkGray`
}

function SpeciesCard({ record }) {
  const [expanded, setExpanded] = React.useState(false)
  const [imageState, setImageState] = React.useState({
    url: logoimage,
    isLoading: false,
    hasImage: false,
  })
  // console.log('record', record)
  // eslint-disable-next-line
  // const { taxonConceptID } = record.doclist.docs[0].taxonConceptID
  // eslint-disable-next-line
  const taxonConceptID = record.taxonConceptID

  React.useEffect(() => {
    if (taxonConceptID) {
      const fetchBieImage = async () => {
        setImageState((old) => ({ ...old, isLoading: true }))
        const resp = await fetch(`${bieUrlPrefix}/${taxonConceptID}`)
        const json = await resp.json()
        if (json.imageIdentifier) {
          // console.log('first call', taxonConceptID.slice(-4))
          setImageState((old) => ({
            ...old,
            isLoading: false,
            hasImage: true,
            url: getImageUrl(json.imageIdentifier),
          }))
        } else if (json) {
          // try biocache API as fallback
          const fetchBiocacheImage = async () => {
            setImageState((old) => ({ ...old, isLoading: true }))
            const resp2 = await fetch(
              `${biocacheUrlPrefix}?q=lsid:${taxonConceptID}${biocacheUrlPostfix}`
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
      }
      fetchBieImage().catch((error) => {
        setImageState((old) => ({
          ...old,
          isLoading: false,
          message: error,
        }))
        // const msg = `Oops something went wrong. ${error.message}`
        // setSnackState({ status: true, message: msg })
      })
    }
  }, [record.taxonConceptID])

  const handleExpandClick = () => {
    setExpanded(!expanded)
  }

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
        subheader={record?.vernacularName}
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
        <IconButton
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
          style={{ marginLeft: 'auto' }}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography component="h4">Details</Typography>
          <Typography
            Typography
            variant="body2"
            color="textSecondary"
            component="p"
          >
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
          </Typography>
          <Typography
            Typography
            variant="body2"
            color="textSecondary"
            component="p"
          >
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
            aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
            eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est,
            qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit,
            sed quia non numquam eius modi tempora incidunt ut labore et dolore
            magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis
            nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut
            aliquid ex ea commodi consequatur? Quis autem vel eum iure
            reprehenderit qui in ea voluptate velit esse quam nihil molestiae
            consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla
            pariatur?
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default SpeciesCard
