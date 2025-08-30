import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Container, Spinner } from 'react-bootstrap';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [results, setResults] = useState({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 3000);
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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching results:', error);
      setLoading(false);
    }
  };

  const chartData = {
    labels: Object.keys(results),
    datasets: [
      {
        label: 'Votes',
        data: Object.values(results),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  };

  const doughnutData = {
    labels: Object.keys(results),
    datasets: [
      {
        data: Object.values(results),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 12,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#f8fafc',
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Election Results',
        color: '#f8fafc',
        font: {
          size: 18,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#f8fafc',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#f8fafc',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#f8fafc',
          font: {
            size: 12,
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading election results...</p>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="text-center mb-4 fw-bold" style={{ 
        background: 'linear-gradient(45deg, #6366f1, #10b981)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        📊 Election Dashboard
      </h2>
      
      <Row className="dashboard-grid mb-4">
        <Col>
          <Card className="enhanced-card stat-card h-100">
            <Card.Body>
              <div className="stat-number">{totalVotes}</div>
              <div className="stat-label">Total Votes</div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="enhanced-card stat-card h-100">
            <Card.Body>
              <div className="stat-number">{Object.keys(results).length}</div>
              <div className="stat-label">Candidates</div>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="enhanced-card stat-card h-100">
            <Card.Body>
              <div className="stat-number">✓</div>
              <div className="stat-label">System Status</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col lg={8} className="mb-4">
          <Card className="enhanced-card h-100">
            <Card.Body>
              <Bar data={chartData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4} className="mb-4">
          <Card className="enhanced-card h-100">
            <Card.Body>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;