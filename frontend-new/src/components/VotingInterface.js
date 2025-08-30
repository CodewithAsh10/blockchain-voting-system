import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';

const VotingInterface = () => {
  const [voterId, setVoterId] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!voterId || !selectedCandidate) {
      setMessage('Please fill all fields');
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
          voter_id: voterId,
          candidate: selectedCandidate,
          timestamp: Date.now() / 1000
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Vote cast successfully!');
        setVariant('success');
        setVoterId('');
        setSelectedCandidate('');
      } else {
        setMessage(`❌ ${data.message}`);
        setVariant('danger');
      }
    } catch (error) {
      setMessage('❌ Error connecting to server');
      setVariant('danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <h2 className="text-center mb-4 fw-bold" style={{ 
        background: 'linear-gradient(45deg, #6366f1, #10b981)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        🗳️ Cast Your Vote
      </h2>
      
      {message && (
        <Alert variant={variant} className="glass-alert">
          {message}
        </Alert>
      )}
      
      <Card className="enhanced-card voting-form">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold mb-2">👤 Voter ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your voter ID"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                className="glass-form-control"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold mb-2">🎯 Select Candidate</Form.Label>
              <Form.Select 
                value={selectedCandidate} 
                onChange={(e) => setSelectedCandidate(e.target.value)}
                className="glass-select"
                disabled={loading}
              >
                <option value="">Choose a candidate</option>
                <option value="Candidate A">Candidate A</option>
                <option value="Candidate B">Candidate B</option>
                <option value="Candidate C">Candidate C</option>
                <option value="Candidate D">Candidate D</option>
              </Form.Select>
            </Form.Group>

            <div className="text-center">
              <Button 
                type="submit" 
                className="glass-btn"
                disabled={loading}
              >
                {loading ? 'Casting Vote...' : '🗳️ Cast Vote'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default VotingInterface;