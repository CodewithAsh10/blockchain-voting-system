import React, { useState, useEffect } from 'react';
import { Card, Accordion, Badge, Spinner } from 'react-bootstrap';

const BlockchainExplorer = () => {
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChain();
    const interval = setInterval(fetchChain, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchChain = async () => {
    try {
      const response = await fetch('http://localhost:5000/chain');
      const data = await response.json();
      setChain(data.chain);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chain:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading blockchain data...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2 className="text-center mb-4 fw-bold" style={{ 
        background: 'linear-gradient(45deg, #6366f1, #10b981)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        🔗 Blockchain Explorer
      </h2>
      
      <div className="blockchain-explorer">
        <Accordion className="accordion-glass">
          {chain.map((block, index) => (
            <Accordion.Item eventKey={index.toString()} key={index}>
              <Accordion.Header>
                <div className="d-flex align-items-center w-100">
                  <span className="me-3">Block #{block.index}</span>
                  <Badge bg="secondary" className="me-2">
                    {block.transactions?.length || 0} transactions
                  </Badge>
                  {block.index === 0 && (
                    <Badge bg="success" className="me-2">
                      Genesis Block
                    </Badge>
                  )}
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Card className="enhanced-card">
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Hash:</strong>
                      <div className="hash-text text-truncate">{block.hash}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Previous Hash:</strong>
                      <div className="hash-text text-truncate">{block.previous_hash}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Timestamp:</strong>
                      <div>{new Date(block.timestamp * 1000).toLocaleString()}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Nonce:</strong>
                      <div>{block.nonce}</div>
                    </div>
                    
                    {block.transactions && block.transactions.length > 0 && (
                      <>
                        <strong>Transactions:</strong>
                        <ul className="list-unstyled mt-2">
                          {block.transactions.map((tx, txIndex) => (
                            <li key={txIndex} className="mb-2 p-2 glass-card rounded">
                              <div>
                                <strong>Voter:</strong> {tx.voter_id?.substring(0, 10)}...
                              </div>
                              <div>
                                <strong>Candidate:</strong> {tx.candidate}
                              </div>
                              <div>
                                <strong>Time:</strong> {new Date(tx.timestamp * 1000).toLocaleTimeString()}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default BlockchainExplorer;