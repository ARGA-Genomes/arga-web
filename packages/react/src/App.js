import { CssBaseline } from '@mui/material';
import {ThemeProvider} from "@mui/material/styles"
import {BrowserRouter as Router} from 'react-router-dom';
import './App.css';
import Search from './components/Search';
import theme from './components/theme';

function App() {

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Search />
      </ThemeProvider>
    </Router>
  );
}

export default App;
