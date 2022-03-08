import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { MsalProvider } from '@azure/msal-react'
import { IPublicClientApplication } from '@azure/msal-browser';

import ProvideAppContext from './AppContext';
import ErrorMessage from './components/ErrorMessage';
import NavBar from './components/NavBar';
import Welcome from './components/Welcome';
import 'bootstrap/dist/css/bootstrap.css';
type AppProps = {
  pca: IPublicClientApplication
};

export default function App({ pca }: AppProps) {
  return (
    <MsalProvider instance={pca}>
      <ProvideAppContext>
        <Router>
          <NavBar />
          <Container>
            <ErrorMessage />
            <Route exact path="/"
              render={(props) =>
                <Welcome {...props} />
              } />
          </Container>
        </Router>
      </ProvideAppContext>
    </MsalProvider>
  );
}