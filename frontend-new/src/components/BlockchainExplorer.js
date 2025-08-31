import React, { useState, useEffect } from 'react';
import { Card, Accordion, Badge, Container, Spinner, Row, Col } from 'react-bootstrap';

const BlockchainExplorer = () => {
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChain();
    const interval = setInterval(fetchChain, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchChain = async () => {
    try {
      const response = await fetch('http://localhost:5000/chain');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setChain(data.chain || []);
      setLoading(false);
      setError('');
    } catch (error) {
      console.error('Error fetching chain:', error);
      setError('Failed to load blockchain data. Make sure the backend is running.');
      setLoading(false);
    }
  };

  const formatHash = (hash) => {
    if (!hash || hash === '0') return hash;
    return `${hash.substring(0, 12)}...${hash.substring(hash.length - 6)}`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Convert to milliseconds if it's in seconds
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading blockchain data...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card className="enhanced-card">
          <Card.Body className="text-center py-5">
            <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
            <h5 className="text-danger">Connection Error</h5>
            <p className="text-muted">{error}</p>
            <p className="text-muted small">
              Make sure your backend server is running on port 5000
            </p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4 text-center" style={{ color: '#2C3E50', fontWeight: '700' }}>
        <i className="fas fa-link me-2"></i>
        Blockchain Explorer
      </h2>

      <Card className="enhanced-card mb-4">
        <Card.Header className="card-header-custom">
          <i className="fas fa-info-circle me-2"></i>
          Blockchain Information
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p className="mb-2">
                <strong>Total Blocks:</strong> <Badge bg="primary">{chain.length}</Badge>
              </p>
              <p className="mb-2">
                <strong>Chain Status:</strong> <Badge bg="success">Valid</Badge>
              </p>
            </Col>
            <Col md={6}>
              <p className="mb-0">
                <strong>Total Transactions:</strong>{' '}
                <Badge bg="info">
                  {chain.reduce((total, block) => total + (block.transactions ? block.transactions.length : 0), 0)}
                </Badge>
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <div className="blockchain-accordion">
        <Accordion defaultActiveKey="0">
          {chain.map((block, index) => (
            <Accordion.Item eventKey={index.toString()} key={index}>
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100 me-3">
                  <div>
                    <i className="fas fa-cube me-2"></i>
                    Block #{block.index}
                    {block.index === 0 && (
                      <Badge bg="warning" text="dark" className="ms-2">
                        Genesis Block
                      </Badge>
                    )}
                  </div>
                  <Badge bg="secondary">
                    {block.transactions ? block.transactions.length : 0} transactions
                  </Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Card className="enhanced-card">
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <p>
                          <strong>Block Hash:</strong><br />
                          <span className="hash-display d-block mt-1">
                            {formatHash(block.hash)}
                          </span>
                          <small className="text-muted">SHA-256 Hash</small>
                        </p>
                        <p>
                          <strong>Previous Hash:</strong><br />
                          <span className="hash-display d-block mt-1">
                            {formatHash(block.previous_hash)}
                          </span>
                          <small className="text-muted">Parent block reference</small>
                        </p>
                      </Col>
                      <Col md={6}>
                        <p>
                          <strong>Timestamp:</strong><br />
                          <span className="d-block mt-1">
                            {formatTimestamp(block.timestamp)}
                          </span>
                          <small className="text-muted">Block creation time</small>
                        </p>
                        <p>
                          <strong>Nonce:</strong><br />
                          <code className="d-block mt-1">{block.nonce || 0}</code>
                          <small className="text-muted">Proof-of-Work value</small>
                        </p>
                      </Col>
                    </Row>
                    
                    <hr />
                    
                    <h6 className="mb-3">
                      <i className="fas fa-exchange-alt me-2"></i>
                      Transactions ({block.transactions ? block.transactions.length : 0})
                    </h6>
                    
                    {block.transactions && block.transactions.length > 0 ? (
                      <div className="mt-3">
                        {block.transactions.map((tx, txIndex) => (
                          <Card key={txIndex} className="mb-2 transaction-card">
                            <Card.Body className="p-3">
                              <Row>
                                <Col md={5}>
                                  <small className="text-muted d-block">Voter Hash</small>
                                  <span className="hash-display d-block">
                                    {formatHash(tx.voter_id || tx.hash)}
                                  </span>
                                </Col>
                                <Col md={4}>
                                  <small className="text-muted d-block">Candidate</small>
                                  <Badge bg="info" className="mt-1">
                                    {tx.candidate || 'Unknown'}
                                  </Badge>
                                </Col>
                                <Col md={3}>
                                  <small className="text-muted d-block">Time</small>
                                  <span className="d-block">
                                    {formatTimestamp(tx.timestamp)}
                                  </span>
                                </Col>
                              </Row>
                              {tx.hash && (
                                <Row className="mt-2">
                                  <Col>
                                    <small className="text-muted d-block">Transaction Hash</small>
                                    <span className="hash-display d-block small">
                                      {formatHash(tx.hash)}
                                    </span>
                                  </Col>
                                </Row>
                              )}
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="fas fa-inbox fa-2x mb-3 text-muted"></i>
                        <p className="text-muted mb-0">No transactions in this block</p>
                        <small className="text-muted">Genesis blocks typically have no transactions</small>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>

      {chain.length === 0 && (
        <Card className="enhanced-card text-center py-5">
          <Card.Body>
            <i className="fas fa-inbox fa-3x mb-3" style={{ color: '#BDC3C7' }}></i>
            <h5 className="text-muted">No blocks in the chain yet</h5>
            <p className="text-muted">Blocks will appear here once votes are cast and mined.</p>
            <small className="text-muted">
              Make sure your backend server is running and try casting some votes.
            </small>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default BlockchainExplorer;