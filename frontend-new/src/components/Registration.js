import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';

const Registration = () => {
  const [voterId, setVoterId] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!voterId || !adminKey) {
      setMessage('Please fill all fields');
      setVariant('danger');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voter_id: voterId,
          admin_key: adminKey
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Voter registered successfully!');
        setVariant('success');
        setVoterId('');
        setAdminKey('');
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
        👨‍💼 Voter Registration (Admin Only)
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
                placeholder="Enter voter ID to register"
                value={voterId}
                onChange={(e) => setVoterId(e.target.value)}
                className="glass-form-control"
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold mb-2">🔑 Admin Key</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="glass-form-control"
                disabled={loading}
              />
              <Form.Text className="text-muted">
                Default admin key: <code>admin123</code>
              </Form.Text>
            </Form.Group>

            <div className="text-center">
              <Button 
                type="submit" 
                className="glass-btn"
                disabled={loading}
              >
                {loading ? 'Registering...' : '👥 Register Voter'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Registration;