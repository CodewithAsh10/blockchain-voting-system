import React, { useState } from 'react';
import { Navbar, Nav, Container, Badge, Button } from 'react-bootstrap';
import AdminResultsDashboard from './AdminResultsDashboard';
import BlockchainExplorer from './BlockchainExplorer';
import VoterList from './VoterList';

const AdminDashboard = ({ user, onLogout, blockCount, highlight }) => {
  const [activeTab, setActiveTab] = useState('voters');

  const renderContent = () => {
    switch(activeTab) {
      case 'results':
        return <AdminResultsDashboard />;
      case 'blockchain':
        return <BlockchainExplorer />;
      case 'voters':
        return <VoterList />;
      default:
        return <VoterList />;
    }
  };

  return (
    <div className="App">
      <Navbar expand="lg" className="navbar-custom" variant="dark">
        <Container>
          <Navbar.Brand href="#home">
            <i className="fas fa-shield-alt me-2"></i>
            Admin Dashboard
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                active={activeTab === 'voters'} 
                onClick={() => setActiveTab('voters')}
                className="d-flex align-items-center"
              >
                <i className="fas fa-users me-1"></i>
                Voter Approval
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'results'} 
                onClick={() => setActiveTab('results')}
                className="d-flex align-items-center"
              >
                <i className="fas fa-chart-bar me-1"></i>
                Results
              </Nav.Link>
              <Nav.Link 
                active={activeTab === 'blockchain'} 
                onClick={() => setActiveTab('blockchain')}
                className="d-flex align-items-center"
              >
                <i className="fas fa-link me-1"></i>
                Blockchain
              </Nav.Link>
            </Nav>
            <Navbar.Text className={highlight ? 'highlight-animation' : ''}>
              <i className="fas fa-cube me-1"></i>
              Blocks: <Badge bg="light" text="dark">{blockCount}</Badge>
            </Navbar.Text>
            <Navbar.Text className="ms-3">
              <i className="fas fa-user-shield me-1"></i>
              {user.name}
            </Navbar.Text>
            <Button 
              variant="outline-light" 
              size="sm" 
              className="ms-3"
              onClick={onLogout}
            >
              <i className="fas fa-sign-out-alt me-1"></i>
              Logout
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="my-4 flex-grow-1">
        {renderContent()}
      </Container>
    </div>
  );
};

export default AdminDashboard;