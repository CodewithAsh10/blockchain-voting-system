import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, InputGroup, Button, Row, Col, Alert } from 'react-bootstrap';

const VoterList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [voters, setVoters] = useState([]);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVoters();
    const interval = setInterval(fetchVoters, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchVoters = async () => {
    try {
      const response = await fetch('http://localhost:5000/voters');
      if (response.ok) {
        const data = await response.json();
        setVoters(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching voters:', error);
      setLoading(false);
    }
  };

  const approveVoter = async (voterHash) => {
    try {
      const response = await fetch('http://localhost:5000/approve_voter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voter_hash: voterHash,
          admin_key: 'admin123'
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Voter approved successfully');
        setVariant('success');
        fetchVoters();
      } else {
        setMessage(data.message);
        setVariant('danger');
      }
    } catch (error) {
      setMessage('Error approving voter');
      setVariant('danger');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Active': 'success',
      'Pending': 'warning',
      'Suspended': 'danger'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  const filteredVoters = voters.filter(voter => {
    const matchesSearch = voter.original_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voter.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voter.place.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || voter.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, 12)}...${hash.substring(hash.length - 6)}`;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading voter data...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-center" style={{ color: '#2C3E50', fontWeight: '700' }}>
        <i className="fas fa-user-check me-2"></i>
        Voter Approval Management
      </h2>

      {message && (
        <Alert variant={variant} className={variant === 'success' ? 'alert-custom-success' : 'alert-custom-danger'}>
          <i className={`fas ${variant === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
          {message}
        </Alert>
      )}

      <Card className="enhanced-card mb-4">
        <Card.Header className="card-header-custom">
          <i className="fas fa-filter me-2"></i>
          Filter Voters
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by ID, name, email, or place..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control-custom"
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-control-custom select-custom"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending Approval</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="enhanced-card">
        <Card.Header className="card-header-custom d-flex justify-content-between align-items-center">
          <span>
            <i className="fas fa-list me-2"></i>
            Voter Records ({filteredVoters.length})
          </span>
          <Badge bg="primary">
            Total: {voters.length} voters
          </Badge>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover striped>
              <thead>
                <tr>
                  <th>Voter ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Place</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVoters.map((voter, index) => (
                  <tr key={index}>
                    <td><code>{voter.original_id}</code></td>
                    <td>{voter.name}</td>
                    <td>{voter.email}</td>
                    <td>{voter.place}</td>
                    <td>{voter.age}</td>
                    <td>{getStatusBadge(voter.status)}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        {voter.status === 'Pending' && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            title="Approve Voter"
                            onClick={() => approveVoter(voter.hashed_id)}
                          >
                            <i className="fas fa-check"></i> Approve
                          </Button>
                        )}
                        {voter.status === 'Active' && (
                          <Button
                            variant="outline-warning"
                            size="sm"
                            title="Suspend Voter"
                            disabled
                          >
                            <i className="fas fa-ban"></i> Suspend
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {filteredVoters.length === 0 && (
            <div className="text-center py-5">
              <i className="fas fa-users fa-3x text-muted mb-3"></i>
              <h5 className="text-muted">No voters found</h5>
              <p className="text-muted">
                {voters.length === 0 
                  ? "No voters have registered yet."
                  : "Try adjusting your search criteria"
                }
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      <Row className="mt-4">
        <Col md={3}>
          <Card className="enhanced-card text-center">
            <Card.Body>
              <div className="stat-number">{voters.length}</div>
              <div className="stat-label">Total Voters</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="enhanced-card text-center">
            <Card.Body>
              <div className="stat-number text-warning">
                {voters.filter(v => v.status === 'Pending').length}
              </div>
              <div className="stat-label">Pending Approval</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="enhanced-card text-center">
            <Card.Body>
              <div className="stat-number text-success">
                {voters.filter(v => v.status === 'Active').length}
              </div>
              <div className="stat-label">Active Voters</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="enhanced-card text-center">
            <Card.Body>
              <div className="stat-number text-danger">
                {voters.filter(v => v.status === 'Suspended').length}
              </div>
              <div className="stat-label">Suspended</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VoterList;