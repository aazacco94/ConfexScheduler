import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import styled from 'styled-components';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Hotels from './pages/Hotels';
import Sessions from './pages/Sessions';
import Upload from './pages/Upload';
import Dates from './pages/Dates';
import Scheduled from './pages/Scheduled';
import './App.scss';
import { SchedulerProvider } from './data/scheduler-context';

/**
 * A styled bootstrap container for the app body.
 * Ensures that the body expands to the full height of the viewport and makes the footer
 * stick to the bottom.
 */
const AppBodyContainer = styled(Container).attrs({
  fluid: true,
  className: 'px-0 d-flex flex-column',
})`
  min-height: 100vh;
  & .container {
    flex-grow: 1;
  }
`;

function App() {
  return (
    <Router>
      <Header />
      <AppBodyContainer>
        <SchedulerProvider>
          <Routes>
            <Route path="/dates" element={<Dates />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/scheduled" element={<Scheduled />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </SchedulerProvider>
        <Footer />
      </AppBodyContainer>
    </Router>
  );
}

export default App;
