import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import Dashboard from './components/Dashboard';
import BlockchainExplorer from './components/BlockchainExplorer';
import VotingInterface from './components/VotingInterface';
import Registration from './components/Registration';
import './App.css';
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [blockCount, setBlockCount] = useState(0);

  useEffect(() => {
    socket.on('block_mined', (data) => {
      setBlockCount(data.block_count);
    });

    return () => {
      socket.off('block_mined');
    };
  }, []);

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'blockchain':
        return <BlockchainExplorer />;
      case 'vote':
        return <VotingInterface />;
      case 'register':
        return <Registration />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <Navbar expand="lg" className="custom-navbar" variant="dark">
        <Container>
          <Navbar.Brand href="#home" className="fw-bold">
            🗳️ Blockchain Voting System
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
                className="mx-1"
              >
                📊 Dashboard
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'blockchain'} 
                onClick={() => setActiveTab('blockchain')}
                className="mx-1"
              >
                🔗 Blockchain Explorer
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'vote'} 
                onClick={() => setActiveTab('vote')}
                className="mx-1"
              >
                🗳️ Vote
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'register'} 
                onClick={() => setActiveTab('register')}
                className="mx-1"
              >
                👨‍💼 Admin
              </Nav.Link>
            </Nav>
            <Navbar.Text className="glass-card px-3 py-2">
              📦 Blocks: <strong>{blockCount}</strong>
            </Navbar.Text>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Container className="my-4 fade-in">
        {renderContent()}
      </Container>
    </div>
  );
}

export default App;