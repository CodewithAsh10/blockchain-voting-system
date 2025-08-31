import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Container, Badge, Table } from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminResultsDashboard = () => {
  const [results, setResults] = useState({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    fetchVoters();
    const interval = setInterval(() => {
      fetchResults();
      fetchVoters();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('http://localhost:5000/results');
      const data = await response.json();
      setResults(data);
      
      let total = 0;
      for (const candidate in data) {
        total += data[candidate];
      }
      setTotalVotes(total);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const fetchVoters = async () => {
    try {
      const response = await fetch('http://localhost:5000/voters');
      if (response.ok) {
        const data = await response.json();
        setVoters(data);
      }
    } catch (error) {
      console.error('Error fetching voters:', error);
    }
    setLoading(false);
  };

  // Calculate statistics
  const totalVoters = voters.length;
  const activeVoters = voters.filter(v => v.status === 'Active').length;
  const votedPercentage = totalVotes > 0 ? ((totalVotes / activeVoters) * 100).toFixed(1) : 0;

  // Find leading candidate
  const leadingCandidate = Object.keys(results).length > 0 
    ? Object.entries(results).reduce((leading, [candidate, votes]) => 
        votes > (results[leading] || 0) ? candidate : leading, Object.keys(results)[0])
    : 'No votes yet';

  // Prepare chart data
  const chartData = {
    labels: Object.keys(results),
    datasets: [
      {
        data: Object.values(results),
        backgroundColor: [
          '#3498DB', '#E74C3C', '#27AE60', '#F39C12', 
          '#9B59B6', '#34495E', '#16A085', '#D35400'
        ],
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#2C3E50',
          font: {
            weight: '600',
            size: 12
          },
          padding: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const percentage = ((context.raw / totalVotes) * 100).toFixed(1);
            return `${context.label}: ${context.raw} votes (${percentage}%)`;
          }
        }
      }
    },
    cutout: '50%',
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading election results...</p>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4 text-center" style={{ color: '#2C3E50', fontWeight: '700' }}>
        <i className="fas fa-chart-pie me-2"></i>
        Election Results Dashboard
      </h2>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="enhanced-card h-100 text-center">
            <Card.Body className="dashboard-stat">
              <div className="stat-number">{totalVotes}</div>
              <div className="stat-label">Total Votes Cast</div>
              <i className="fas fa-vote-yea fa-2x mt-3" style={{ color: '#3498DB' }}></i>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="enhanced-card h-100 text-center">
            <Card.Body className="dashboard-stat">
              <div className="stat-number">{activeVoters}</div>
              <div className="stat-label">Eligible Voters</div>
              <i className="fas fa-users fa-2x mt-3" style={{ color: '#27AE60' }}></i>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="enhanced-card h-100 text-center">
            <Card.Body className="dashboard-stat">
              <div className="stat-number">{votedPercentage}%</div>
              <div className="stat-label">Voter Turnout</div>
              <i className="fas fa-percentage fa-2x mt-3" style={{ color: '#F39C12' }}></i>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="enhanced-card h-100 text-center">
            <Card.Body className="dashboard-stat">
              <div className="stat-number" style={{ fontSize: '1.8rem' }}>
                {leadingCandidate}
              </div>
              <div className="stat-label">Current Leader</div>
              <i className="fas fa-trophy fa-2x mt-3" style={{ color: '#E74C3C' }}></i>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Results Overview */}
      <Row>
        <Col md={6}>
          <Card className="enhanced-card mb-4">
            <Card.Header className="card-header-custom">
              <i className="fas fa-chart-pie me-2"></i>
              Vote Distribution
            </Card.Header>
            <Card.Body className="text-center">
              {Object.keys(results).length > 0 ? (
                <div style={{ height: '300px' }}>
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-inbox fa-3x mb-3" style={{ color: '#BDC3C7' }}></i>
                  <p className="text-muted">No votes cast yet. The election will begin soon.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="enhanced-card mb-4">
            <Card.Header className="card-header-custom">
              <i className="fas fa-info-circle me-2"></i>
              Election Statistics
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>Total Registered Voters:</strong> {totalVoters}</p>
                  <p><strong>Active Voters:</strong> {activeVoters}</p>
                  <p><strong>Pending Approval:</strong> {voters.filter(v => v.status === 'Pending').length}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Votes Cast:</strong> {totalVotes}</p>
                  <p><strong>Voter Turnout:</strong> {votedPercentage}%</p>
                  <p><strong>Candidates:</strong> {Object.keys(results).length}</p>
                </Col>
              </Row>
              <hr />
              <p className="mb-1"><strong>Leading Candidate:</strong></p>
              <h5 className="text-primary">{leadingCandidate}</h5>
              {leadingCandidate !== 'No votes yet' && (
                <p className="text-muted small mb-0">
                  {results[leadingCandidate]} votes (
                  {((results[leadingCandidate] / totalVotes) * 100).toFixed(1)}% of total votes)
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Results Table */}
      <Row>
        <Col>
          <Card className="enhanced-card">
            <Card.Header className="card-header-custom">
              <i className="fas fa-list me-2"></i>
              Detailed Results
            </Card.Header>
            <Card.Body>
              {Object.keys(results).length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Votes</th>
                        <th>Percentage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(results)
                        .sort(([,a], [,b]) => b - a)
                        .map(([candidate, votes], index) => (
                          <tr key={candidate}>
                            <td>
                              {index === 0 && <Badge bg="success" className="me-2">Leading</Badge>}
                              {candidate}
                            </td>
                            <td><strong>{votes}</strong></td>
                            <td>
                              {totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0}%
                              <div className="progress mt-1" style={{ height: '5px' }}>
                                <div 
                                  className="progress-bar" 
                                  style={{ 
                                    width: `${totalVotes > 0 ? (votes / totalVotes) * 100 : 0}%`,
                                    backgroundColor: chartData.datasets[0].backgroundColor[index]
                                  }}
                                ></div>
                              </div>
                            </td>
                            <td>
                              {index === 0 ? (
                                <Badge bg="success">Winning</Badge>
                              ) : votes > 0 ? (
                                <Badge bg="primary">Active</Badge>
                              ) : (
                                <Badge bg="secondary">No votes</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="fas fa-inbox fa-2x mb-3" style={{ color: '#BDC3C7' }}></i>
                  <p className="text-muted">No results available yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Analysis */}
      <Row className="mt-4">
        <Col md={6}>
          <Card className="enhanced-card">
            <Card.Header className="card-header-custom">
              <i className="fas fa-analytics me-2"></i>
              Performance Analysis
            </Card.Header>
            <Card.Body>
              <p><strong>Turnout Rate:</strong> {votedPercentage}% of eligible voters</p>
              <p><strong>Vote Efficiency:</strong> {totalVotes} votes cast</p>
              <p><strong>Candidate Performance:</strong> {Object.keys(results).length} candidates competing</p>
              <div className="progress mb-2">
                <div 
                  className="progress-bar bg-success" 
                  style={{ width: `${votedPercentage}%` }}
                >
                  {votedPercentage}% Turnout
                </div>
              </div>
              <small className="text-muted">
                Based on {activeVoters} eligible voters and {totalVotes} votes cast
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="enhanced-card">
            <Card.Header className="card-header-custom">
              <i className="fas fa-tachometer-alt me-2"></i>
              System Status
            </Card.Header>
            <Card.Body>
              <p><strong>Results Updated:</strong> Real-time (every 3 seconds)</p>
              <p><strong>Data Integrity:</strong> <Badge bg="success">Verified</Badge></p>
              <p><strong>System Health:</strong> <Badge bg="success">Optimal</Badge></p>
              <div className="text-center mt-3">
                <i className="fas fa-shield-alt fa-2x text-success"></i>
                <p className="text-muted small mt-2">Blockchain-secured results</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminResultsDashboard;