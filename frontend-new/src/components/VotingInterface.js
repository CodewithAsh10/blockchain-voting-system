import React, { useState, useEffect } from 'react';
import { Navbar, Container, Badge, Button, Form, Card, Alert, Row, Col } from 'react-bootstrap';

const VoterInterface = ({ user, onLogout, blockCount, highlight }) => {
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const [loading, setLoading] = useState(false);
  const [voterStatus, setVoterStatus] = useState('');
  const [voterInfo, setVoterInfo] = useState(null);

  useEffect(() => {
    const fetchVoterInfo = async () => {
      try {
        const response = await fetch('http://localhost:5000/voters');
        if (response.ok) {
          const voters = await response.json();
          const currentVoter = voters.find(v => v.original_id === user.id);
          
          if (currentVoter) {
            setVoterInfo(currentVoter);
            setVoterStatus(currentVoter.status);
            if (currentVoter.status !== 'Active') {
              setMessage(`Your account status is: ${currentVoter.status}. Please contact administrator.`);
              setVariant('warning');
            }
          } else {
            setMessage('Voter information not found. Please contact administrator.');
            setVariant('danger');
          }
        }
      } catch (error) {
        console.error('Error fetching voter information:', error);
        setMessage('Error connecting to server. Please try again.');
        setVariant('danger');
      }
    };

    fetchVoterInfo();
  }, [user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!selectedCandidate) {
      setMessage('Please select a candidate');
      setVariant('danger');
      setLoading(false);
      return;
    }

    if (voterStatus !== 'Active') {
      setMessage('Your account is not approved for voting. Please contact administrator.');
      setVariant('danger');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voter_id: user.id,
          candidate: selectedCandidate,
          timestamp: Date.now() / 1000
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Vote cast successfully! Your vote has been recorded on the blockchain.');
        setVariant('success');
        setSelectedCandidate('');
      } else {
        setMessage(data.message);
        setVariant('danger');
      }
    } catch (error) {
      setMessage('Error connecting to server. Please try again.');
      setVariant('danger');
    }
    setLoading(false);
  };

  if (!voterInfo) {
    return (
      <div className="App">
        <Navbar expand="lg" className="navbar-custom" variant="dark">
          <Container>
            <Navbar.Brand href="#home">
              <i className="fas fa-vote-yea me-2"></i>
              Voter Portal
            </Navbar.Brand>
            <Button 
              variant="outline-light" 
              size="sm" 
              className="ms-3"
              onClick={onLogout}
            >
              <i className="fas fa-sign-out-alt me-1"></i>
              Logout
            </Button>
          </Container>
        </Navbar>

        <Container className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading voter information...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar expand="lg" className="navbar-custom" variant="dark">
        <Container>
          <Navbar.Brand href="#home">
            <i className="fas fa-vote-yea me-2"></i>
            Voter Portal
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Navbar.Text className={highlight ? 'highlight-animation' : ''}>
              <i className="fas fa-cube me-1"></i>
              Blocks: <Badge bg="light" text="dark">{blockCount}</Badge>
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

      <Container className="my-4">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <h2 className="mb-4 text-center" style={{ color: '#2C3E50', fontWeight: '700' }}>
              <i className="fas fa-ballot me-2"></i>
              Cast Your Vote
            </h2>

            <Card className="enhanced-card mb-4">
              <Card.Header className="card-header-custom">
                <i className="fas fa-user me-2"></i>
                Voter Information
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Name:</strong> {voterInfo.name || 'Not provided'}</p>
                    <p><strong>Voter ID:</strong> <code>{voterInfo.original_id}</code></p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Email:</strong> {voterInfo.email || 'Not provided'}</p>
                    <p><strong>Place:</strong> {voterInfo.place || 'Not provided'}</p>
                    <p><strong>Age:</strong> {voterInfo.age || 'Not provided'}</p>
                    <p><strong>Status:</strong> 
                      {voterStatus === 'Active' ? (
                        <Badge bg="success" className="ms-2">Active</Badge>
                      ) : voterStatus === 'Pending' ? (
                        <Badge bg="warning" className="ms-2">Pending Approval</Badge>
                      ) : voterStatus === 'Suspended' ? (
                        <Badge bg="danger" className="ms-2">Suspended</Badge>
                      ) : (
                        <Badge bg="secondary" className="ms-2">Unknown</Badge>
                      )}
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {message && (
              <Alert variant={variant} className={variant === 'success' ? 'alert-custom-success' : 'alert-custom-danger'}>
                <i className={`fas ${variant === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                {message}
              </Alert>
            )}

            <Card className="enhanced-card">
              <Card.Header className="card-header-custom">
                <i className="fas fa-pencil-alt me-2"></i>
                Voting Form
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label className="form-label-custom">
                      <i className="fas fa-user-tie me-2"></i>
                      Select Candidate
                    </Form.Label>
                    <Form.Select 
                      value={selectedCandidate} 
                      onChange={(e) => setSelectedCandidate(e.target.value)}
                      className="form-control-custom select-custom"
                      disabled={loading || voterStatus !== 'Active'}
                    >
                      <option value="">Choose a candidate</option>
                      <option value="Candidate A">Candidate A - Reform Party</option>
                      <option value="Candidate B">Candidate B - Progress Party</option>
                      <option value="Candidate C">Candidate C - Unity Party</option>
                      <option value="Candidate D">Candidate D - Future Party</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      {voterStatus !== 'Active' 
                        ? 'Your account must be approved by admin before voting'
                        : 'Your vote is anonymous and cannot be changed once submitted.'
                      }
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid">
                    <Button 
                      type="submit" 
                      className="btn-custom-primary"
                      disabled={loading || !selectedCandidate || voterStatus !== 'Active'}
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Processing Vote...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          Cast Your Vote
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <Card className="enhanced-card mt-4">
              <Card.Header className="card-header-custom">
                <i className="fas fa-info-circle me-2"></i>
                Voting Guidelines
              </Card.Header>
              <Card.Body>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="fas fa-shield-alt text-primary me-2"></i>
                    <strong>Secure:</strong> Your vote is encrypted and recorded on the blockchain
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-eye-slash text-primary me-2"></i>
                    <strong>Anonymous:</strong> Your identity is protected through cryptographic hashing
                  </li>
                  <li className="mb-2">
                    <i className="fas fa-ban text-primary me-2"></i>
                    <strong>Tamper-Proof:</strong> Once cast, your vote cannot be altered or deleted
                  </li>
                  <li className="mb-0">
                    <i className="fas fa-user-check text-primary me-2"></i>
                    <strong>Approval Required:</strong> Admin must approve your account before voting
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default VoterInterface;
