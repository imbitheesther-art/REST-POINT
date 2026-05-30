// src/components/BeautifulMortuaryDashboard.jsx
import React, { useState, useEffect } from "react";
import { 
  Container, Row, Col, Card, Spinner, Modal, Button, 
  ListGroup, Badge, Form, Alert, Carousel, Dropdown, Table
} from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import GaugeChart from 'react-gauge-chart';
import 'chartjs-adapter-date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

// Bright colors for charts
const CHART_COLORS = ["#ff3b30", "#5856d6", "#ffcc00", "#ff2d55", "#007aff", "#34C759"];

const Colors = {
  primary: "#2C3E50",
  secondary: "#34495E", 
  accent: "#007aff",
  success: "#34C759",
  warning: "#ffcc00",
  danger: "#ff3b30",
  info: "#5856d6",
  light: "#F8F9FA",
  dark: "#495057"
};

// Custom colors for specific charts
const CUSTOM_COLORS = {
  primaryDark: '#2C3E50',      
  accentBlue: '#05668D',       
  kinSuccess: '#00A896',       
  autopsySuccess: '#6A0572',   
  warningYellow: '#F39C12',
  infoBlue: '#3498DB',
  transport: '#4ECDC4',
  storage: '#45B7D1',
  supplies: '#96CEB4',
  chemicals: '#FF6B6B'
};

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container fluid className="py-4">
          <Card className="text-center">
            <Card.Body className="py-5">
              <div className="mb-4" style={{fontSize: '4rem'}}>⚠️</div>
              <h4 className="text-danger mb-3">Component Error</h4>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Reload Dashboard
              </Button>
            </Card.Body>
          </Card>
        </Container>
      );
    }
    return this.props.children;
  }
}

// Safe data access helper functions
const getSafeData = (data, path, defaultValue = {}) => {
  try {
    const paths = path.split('.');
    let result = data;
    for (const p of paths) {
      result = result?.[p];
      if (result === undefined || result === null) return defaultValue;
    }
    return result || defaultValue;
  } catch (error) {
    console.warn(`Error accessing data path ${path}:`, error);
    return defaultValue;
  }
};

const getSafeArray = (data, path, defaultValue = []) => {
  const result = getSafeData(data, path, defaultValue);
  return Array.isArray(result) ? result : defaultValue;
};

const getSafeObject = (data, path, defaultValue = {}) => {
  const result = getSafeData(data, path, defaultValue);
  return typeof result === 'object' && !Array.isArray(result) ? result : defaultValue;
};

// Coffin image fallback
const COFFIN_IMAGE_FALLBACK = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjNywQkUQeRb-4xpUCLjpTOkLuDEuDYMIYQwD4T0UqLBDpQw9b65dodgKVP8JJ4e1mEDqwoyD8RXsego_DzYUlrAS-LIdn3oLEy5W3m60&s=10";

const BeautifulMortuaryDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    summary: {},
    caseStatus: {},
    revenue: { total: {}, extraServices: {} },
    serviceTypes: {},
    paymentFrequency: {},
    monthlyTrends: {},
    visitorTrends: {},
    coffinSales: [],
    averageStayDuration: {},
    hearseDistance: {},
    revenueMeta: { currency: 'KES' },
    dispatchAnalytics: {},
    coffinInventory: {},
    operationalMetrics: {},
    financialMetrics: {},
    performanceIndicators: {}
  });
  const [vehicleData, setVehicleData] = useState({
    fleetSummary: {},
    vehicles: [],
    topPerformers: {}
  });
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [timeFrame, setTimeFrame] = useState('monthly');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Mock data for new components
  const [casesTrendsData, setCasesTrendsData] = useState({
    monthly: [45, 52, 48, 65, 58, 72, 68, 75, 70, 65, 78, 85],
    quarterly: [145, 185, 195, 210],
    yearly: [785]
  });

  const [revenueByCategoryData, setRevenueByCategoryData] = useState({
    transport: {
      monthly: [120000, 135000, 142000, 158000, 145000, 162000, 178000, 195000, 182000, 175000, 190000, 205000],
      quarterly: [397000, 465000, 555000, 565000],
      yearly: [1982000]
    },
    storage: {
      monthly: [85000, 92000, 88000, 95000, 102000, 110000, 108000, 115000, 112000, 105000, 118000, 125000],
      quarterly: [265000, 307000, 335000, 348000],
      yearly: [1255000]
    },
    supplies: {
      monthly: [45000, 52000, 48000, 55000, 58000, 62000, 65000, 68000, 72000, 70000, 75000, 78000],
      quarterly: [145000, 175000, 205000, 223000],
      yearly: [748000]
    }
  });

  const [chemicalsData, setChemicalsData] = useState({
    formaldehyde: { monthly: [120, 135, 128, 145, 142, 158, 165, 172, 168, 162, 175, 182], unit: 'liters' },
    disinfectants: { monthly: [85, 92, 88, 95, 102, 110, 108, 115, 112, 105, 118, 125], unit: 'liters' },
    preservatives: { monthly: [45, 52, 48, 55, 58, 62, 65, 68, 72, 70, 75, 78], unit: 'kg' },
    embalming: { monthly: [65, 72, 68, 75, 78, 82, 85, 88, 92, 90, 95, 98], unit: 'liters' }
  });

  const [dispatchScheduleData, setDispatchScheduleData] = useState([
    { id: 1, name: "John Doe", age: 72, cause: "Natural Causes", location: "Nairobi", scheduled: "2024-01-15 09:00", status: "confirmed" },
    { id: 2, name: "Mary Smith", age: 65, cause: "Illness", location: "Mombasa", scheduled: "2024-01-15 11:30", status: "pending" },
    { id: 3, name: "Robert Johnson", age: 58, cause: "Accident", location: "Kisumu", scheduled: "2024-01-15 14:00", status: "confirmed" },
    { id: 4, name: "Sarah Williams", age: 80, cause: "Natural Causes", location: "Nakuru", scheduled: "2024-01-16 10:00", status: "pending" },
    { id: 5, name: "James Brown", age: 45, cause: "Illness", location: "Eldoret", scheduled: "2024-01-16 13:30", status: "confirmed" }
  ]);

  const [insuranceData, setInsuranceData] = useState({
    activePolicies: 342,
    monthlyPremium: 2850000,
    claimsThisMonth: 18,
    totalCoverage: 125000000,
    trends: {
      policies: [320, 325, 332, 338, 342, 345, 350, 348, 355, 360, 362, 365],
      claims: [12, 15, 14, 18, 16, 20, 18, 22, 25, 28, 30, 32],
      premiums: [2500000, 2550000, 2620000, 2680000, 2720000, 2780000, 2820000, 2850000, 2900000, 2950000, 2980000, 3000000]
    }
  });

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: Colors.primary,
        bodyColor: Colors.dark,
        borderColor: '#E9ECEF',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { 
        grid: { color: '#F8F9FA' },
        beginAtZero: true
      }
    }
  };

  // Get available years from data
  const getAvailableYears = () => {
    try {
      const revenueTotal = getSafeObject(dashboardData, 'revenue.total');
      const years = new Set();
      Object.keys(revenueTotal).forEach(monthYear => {
        const year = monthYear.split(' ')[1];
        if (year) years.add(parseInt(year));
      });
      return Array.from(years).sort((a, b) => b - a);
    } catch (error) {
      return [new Date().getFullYear()];
    }
  };

  // Format case status for display
  const formatCaseStatus = (status) => {
    const statusMap = {
      'RECEIVED': 'Received',
      'UNDER_CARE': 'Under Care',
      'PENDING': 'Pending',
      'COMPLETED': 'Completed'
    };
    return statusMap[status] || status;
  };

  // Get point color based on revenue value
  const getRevenuePointColor = (value, values) => {
    if (!values || values.length === 0) return CHART_COLORS[0];
    
    const maxRevenue = Math.max(...values);
    const minRevenue = Math.min(...values);
    const range = maxRevenue - minRevenue;
    
    if (range === 0) return CHART_COLORS[4]; // All values same
    
    const percentage = (value - minRevenue) / range;
    
    if (percentage >= 0.7) return '#34C759'; // Green - High revenue
    if (percentage >= 0.3) return '#ffcc00'; // Orange - Medium revenue
    return '#ff3b30'; // Red - Low revenue
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch mortuary analytics
        const mortuaryResponse = await fetch('http://localhost:5000/api/v1/restpoint/analytics/mortuary-analytics');
        
        if (!mortuaryResponse.ok) {
          throw new Error(`HTTP error! status: ${mortuaryResponse.status}`);
        }
        
        const mortuaryResult = await mortuaryResponse.json();
        
        if (mortuaryResult.success) {
          setDashboardData(mortuaryResult.data);
        } else {
          throw new Error(mortuaryResult.message || 'Mortuary API returned unsuccessful response');
        }

        // Fetch vehicle analytics
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const vehicleResponse = await fetch(`http://localhost:5000/api/v1/restpoint/vehicle-analytics?month=${currentMonth}&year=${currentYear}`);
        
        if (vehicleResponse.ok) {
          const vehicleResult = await vehicleResponse.json();
          if (vehicleResult.success) {
            setVehicleData(vehicleResult.data);
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChartClick = async (elements, chart, type) => {
    if (!elements || !elements.length) return;
    
    setLoadingDetails(true);
    setShowModal(true);

    try {
      const element = elements[0];
      let label, value;

      if (type === 'pie' || type === 'doughnut') {
        label = chart.data.labels[element.index];
        value = chart.data.datasets[0].data[element.index];
      } else {
        label = chart.data.labels[element.index];
        value = chart.data.datasets[element.datasetIndex].data[element.index];
      }

      // For demo purposes - in real app, you'd fetch detailed data
      const mockDetails = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        caseNumber: `CASE-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        service: label,
        status: ['RECEIVED', 'UNDER_CARE', 'PENDING', 'COMPLETED'][i % 4],
        amount: value,
        date: new Date(Date.now() - i * 86400000).toLocaleDateString()
      }));

      setSelectedData({
        label,
        value,
        details: mockDetails,
        type
      });
      
    } catch (error) {
      console.error('Error loading details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const renderModalContent = () => {
    if (!selectedData) return <p>No data selected</p>;

    return (
      <div>
        <h5>{selectedData.label}</h5>
        <p className="mb-3">Total: {selectedData.value} {selectedData.type === 'revenue' ? 'KES' : selectedData.type === 'distance' ? 'km' : 'cases'}</p>

        {loadingDetails ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Loading details...</p>
          </div>
        ) : selectedData.details?.length > 0 ? (
          <ListGroup style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {selectedData.details.map((detail) => (
              <ListGroup.Item key={detail.id}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{detail.caseNumber}</strong>
                    <br />
                    <small className="text-muted">
                      {detail.service} • {detail.date}
                    </small>
                  </div>
                  <div className="text-end">
                    <Badge bg={
                      detail.status === 'COMPLETED' ? 'success' :
                      detail.status === 'READY' ? 'primary' :
                      detail.status === 'UNDER_CARE' ? 'warning' : 'secondary'
                    }>
                      {detail.status}
                    </Badge>
                    <br />
                    <small className="text-muted">
                      {selectedData.type === 'revenue' ? `KES ${detail.amount?.toLocaleString()}` : 
                       selectedData.type === 'distance' ? `${detail.amount} km` : ''}
                    </small>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-muted">No records found.</p>
        )}
      </div>
    );
  };

  // Safe data access for rendering
  const summaryData = getSafeObject(dashboardData, 'summary');
  const caseStatusData = getSafeObject(dashboardData, 'caseStatus');
  const revenueTotalData = getSafeObject(dashboardData, 'revenue.total');
  const revenueExtraServicesData = getSafeObject(dashboardData, 'revenue.extraServices');
  const serviceTypesData = getSafeObject(dashboardData, 'serviceTypes');
  const paymentFrequencyData = getSafeObject(dashboardData, 'paymentFrequency');
  const monthlyTrendsData = getSafeObject(dashboardData, 'monthlyTrends');
  const visitorTrendsData = getSafeObject(dashboardData, 'visitorTrends');
  const coffinSalesData = getSafeArray(dashboardData, 'coffinSales');
  const averageStayDurationData = getSafeObject(dashboardData, 'averageStayDuration');
  const hearseDistanceData = getSafeObject(dashboardData, 'hearseDistance');
  const dispatchAnalyticsData = getSafeObject(dashboardData, 'dispatchAnalytics');
  const coffinInventoryData = getSafeObject(dashboardData, 'coffinInventory');
  const operationalMetricsData = getSafeObject(dashboardData, 'operationalMetrics');
  const financialMetricsData = getSafeObject(dashboardData, 'financialMetrics');
  const performanceIndicatorsData = getSafeObject(dashboardData, 'performanceIndicators');

  // Vehicle data
  const fleetSummary = getSafeObject(vehicleData, 'fleetSummary');
  const vehicles = getSafeArray(vehicleData, 'vehicles');
  const topPerformers = getSafeObject(vehicleData, 'topPerformers');

  // Prepare visitor trends data for chart
  const visitorTrendsChartData = visitorTrendsData && Object.keys(visitorTrendsData).length > 0 
    ? {
        labels: Object.keys(visitorTrendsData),
        datasets: [
          {
            label: 'Admissions',
            data: Object.values(visitorTrendsData).map(day => day.admissions || 0),
            backgroundColor: CHART_COLORS[1],
            borderColor: CHART_COLORS[1],
            borderWidth: 2
          },
          {
            label: 'Avg Processing Days',
            data: Object.values(visitorTrendsData).map(day => day.avgProcessingDays || 0),
            backgroundColor: CHART_COLORS[2],
            borderColor: CHART_COLORS[2],
            borderWidth: 2,
            yAxisID: 'y1'
          }
        ]
      }
    : null;

  // Prepare dispatch analytics data
  const dispatchTrendsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Weekly Dispatches',
        data: [
          dispatchAnalyticsData.weeklyDispatches || 0,
          Math.round((dispatchAnalyticsData.weeklyDispatches || 0) * 0.8),
          Math.round((dispatchAnalyticsData.weeklyDispatches || 0) * 1.2),
          Math.round((dispatchAnalyticsData.weeklyDispatches || 0) * 0.9)
        ],
        borderColor: CHART_COLORS[4],
        backgroundColor: `${CHART_COLORS[4]}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Prepare monthly revenue data with colored points
  const revenueValues = Object.values(revenueTotalData);
  const monthlyRevenueData = {
    labels: Object.keys(revenueTotalData),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: revenueValues,
        borderColor: CHART_COLORS[0],
        backgroundColor: `${CHART_COLORS[0]}20`,
        borderWidth: 4,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: revenueValues.map((value, index) => 
          getRevenuePointColor(value, revenueValues)
        ),
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBorderWidth: 3
      }
    ]
  };

  // Prepare car kilometer coverage data from API
  const carCoverageData = {
    labels: vehicles.map(vehicle => vehicle.vehiclePlate?.trim() || 'Unknown'),
    datasets: [
      {
        label: 'Distance Covered (km)',
        data: vehicles.map(vehicle => vehicle.kilometers?.currentMonth || 0),
        backgroundColor: [
          '#34C759',
          '#007aff',
          '#ffcc00',
          '#5856d6',
          '#ff2d55',
          '#00A896',
          '#F39C12'
        ],
        borderWidth: 0,
        borderRadius: 8
      }
    ]
  };

  // Prepare hearse distance data for line chart
  const hearseDistanceChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'KDK 456 G',
        data: [245, 280, 265, 310, 295, 320, 335, 300, 285, 270, 290, 315],
        borderColor: CUSTOM_COLORS.primaryDark,
        backgroundColor: `${CUSTOM_COLORS.primaryDark}20`,
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: CUSTOM_COLORS.primaryDark,
        pointBorderColor: Colors.white,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'KDK - 497 C',
        data: [180, 195, 210, 225, 240, 255, 270, 285, 260, 245, 230, 215],
        borderColor: CUSTOM_COLORS.accentBlue,
        backgroundColor: `${CUSTOM_COLORS.accentBlue}20`,
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: CUSTOM_COLORS.accentBlue,
        pointBorderColor: Colors.white,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'KCM 234 D',
        data: [120, 135, 150, 165, 180, 195, 210, 195, 180, 165, 150, 135],
        borderColor: CUSTOM_COLORS.warningYellow,
        backgroundColor: `${CUSTOM_COLORS.warningYellow}20`,
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: CUSTOM_COLORS.warningYellow,
        pointBorderColor: Colors.white,
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  // Financial metrics data
  const collectionRate = financialMetricsData.collectionRate || 0;
  const outstandingPercentage = financialMetricsData.outstandingPercentage || 0;
  const revenuePerCase = financialMetricsData.revenuePerCase || 0;

  // Operational metrics data for gauges
  const todayVisitors = operationalMetricsData.todayVisitors || 0;
  const monthlyVisitors = operationalMetricsData.monthlyVisitors || 0;

  // Financial trends data for line chart
  const financialTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Collection Rate (%)',
        data: [1.8, 1.9, 2.0, 2.1, 2.1, 2.0, 2.2, 2.1, 2.1, 2.0, 2.1, 2.1],
        borderColor: CHART_COLORS[4],
        backgroundColor: `${CHART_COLORS[4]}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Outstanding %',
        data: [98, 99, 98, 100, 100, 99, 98, 100, 100, 99, 100, 100],
        borderColor: CHART_COLORS[0],
        backgroundColor: `${CHART_COLORS[0]}20`,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  // Cases Handled Trends Data
  const getCasesTrendsData = () => {
    const data = timeFrame === 'monthly' ? casesTrendsData.monthly : 
                 timeFrame === 'quarterly' ? casesTrendsData.quarterly : 
                 casesTrendsData.yearly;
    
    const labels = timeFrame === 'monthly' ? 
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] :
      timeFrame === 'quarterly' ? ['Q1', 'Q2', 'Q3', 'Q4'] : 
      ['Year'];
    
    return {
      labels,
      datasets: [
        {
          label: 'Cases Handled',
          data,
          borderColor: CUSTOM_COLORS.accentBlue,
          backgroundColor: `${CUSTOM_COLORS.accentBlue}20`,
          borderWidth: 3,
          fill: true,
          tension: 0.4
        }
      ]
    };
  };

  // Revenue by Category Data
  const getRevenueByCategoryData = () => {
    const labels = timeFrame === 'monthly' ? 
      ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] :
      timeFrame === 'quarterly' ? ['Q1', 'Q2', 'Q3', 'Q4'] : 
      ['Year'];
    
    return {
      labels,
      datasets: [
        {
          label: 'Transport',
          data: timeFrame === 'monthly' ? revenueByCategoryData.transport.monthly :
                timeFrame === 'quarterly' ? revenueByCategoryData.transport.quarterly :
                revenueByCategoryData.transport.yearly,
          borderColor: CUSTOM_COLORS.transport,
          backgroundColor: `${CUSTOM_COLORS.transport}20`,
          borderWidth: 2,
          fill: true,
          tension: 0.3
        },
        {
          label: 'Storage',
          data: timeFrame === 'monthly' ? revenueByCategoryData.storage.monthly :
                timeFrame === 'quarterly' ? revenueByCategoryData.storage.quarterly :
                revenueByCategoryData.storage.yearly,
          borderColor: CUSTOM_COLORS.storage,
          backgroundColor: `${CUSTOM_COLORS.storage}20`,
          borderWidth: 2,
          fill: true,
          tension: 0.3
        },
        {
          label: 'Supplies',
          data: timeFrame === 'monthly' ? revenueByCategoryData.supplies.monthly :
                timeFrame === 'quarterly' ? revenueByCategoryData.supplies.quarterly :
                revenueByCategoryData.supplies.yearly,
          borderColor: CUSTOM_COLORS.supplies,
          backgroundColor: `${CUSTOM_COLORS.supplies}20`,
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }
      ]
    };
  };

  // Chemicals Usage Trends Data
  const getChemicalsUsageData = () => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      labels,
      datasets: [
        {
          label: 'Formaldehyde',
          data: chemicalsData.formaldehyde.monthly,
          borderColor: CUSTOM_COLORS.chemicals,
          backgroundColor: `${CUSTOM_COLORS.chemicals}20`,
          borderWidth: 2,
          fill: true
        },
        {
          label: 'Disinfectants',
          data: chemicalsData.disinfectants.monthly,
          borderColor: CUSTOM_COLORS.infoBlue,
          backgroundColor: `${CUSTOM_COLORS.infoBlue}20`,
          borderWidth: 2,
          fill: true
        },
        {
          label: 'Preservatives',
          data: chemicalsData.preservatives.monthly,
          borderColor: CUSTOM_COLORS.kinSuccess,
          backgroundColor: `${CUSTOM_COLORS.kinSuccess}20`,
          borderWidth: 2,
          fill: true
        },
        {
          label: 'Embalming',
          data: chemicalsData.embalming.monthly,
          borderColor: CUSTOM_COLORS.warningYellow,
          backgroundColor: `${CUSTOM_COLORS.warningYellow}20`,
          borderWidth: 2,
          fill: true
        }
      ]
    };
  };

  // Insurance Trends Data
  const getInsuranceTrendsData = () => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      labels,
      datasets: [
        {
          label: 'Active Policies',
          data: insuranceData.trends.policies,
          borderColor: CHART_COLORS[4],
          backgroundColor: `${CHART_COLORS[4]}20`,
          borderWidth: 3,
          fill: true,
          yAxisID: 'y'
        },
        {
          label: 'Monthly Premiums (KES)',
          data: insuranceData.trends.premiums.map(p => p / 100000),
          borderColor: CHART_COLORS[1],
          backgroundColor: `${CHART_COLORS[1]}20`,
          borderWidth: 3,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Dashboard</Alert.Heading>
          <p>{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container fluid className="py-4">
        {/* Header with Timeframe and Branch Controls */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2
              className="text-start p-3 text-white fw-bold rounded"
              style={{ backgroundColor: "#05668D" }}
            >
              Mortuary Analytics Dashboard
            </h2>
            <div className="mt-2">
              <small className="text-muted">Branch selection will be implemented later</small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary">
                📅 {selectedYear}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {getAvailableYears().map(year => (
                  <Dropdown.Item 
                    key={year} 
                    onClick={() => setSelectedYear(year)}
                    active={year === selectedYear}
                  >
                    {year}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            
            <Form.Select 
              style={{ width: '150px' }}
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
            >
              <option value="monthly">Monthly View</option>
              <option value="quarterly">Quarterly View</option>
              <option value="yearly">Yearly View</option>
            </Form.Select>
          </div>
        </div>

        {/* Main Charts Row */}
        <Row className="g-4">
          {/* Cases Handled Trends */}
          <Col xl={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h5 className="card-title mb-4">Cases Handled Trends</h5>
                <div style={{ height: '300px' }}>
                  <Line
                    data={getCasesTrendsData()}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        tooltip: {
                          ...chartOptions.plugins.tooltip,
                          callbacks: {
                            label: function(context) {
                              return `${context.dataset.label}: ${context.parsed.y} cases`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                <Row className="mt-3 text-center">
                  <Col xs={4}>
                    <div className="border-end">
                      <h6 className="text-primary">
                        {casesTrendsData.monthly[casesTrendsData.monthly.length - 1]}
                      </h6>
                      <small className="text-muted">Current Month</small>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div className="border-end">
                      <h6 className="text-success">
                        {casesTrendsData.monthly.reduce((a, b) => a + b, 0)}
                      </h6>
                      <small className="text-muted">YTD Total</small>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div>
                      <h6 className="text-warning">
                        {(casesTrendsData.monthly.reduce((a, b) => a + b, 0) / casesTrendsData.monthly.length).toFixed(1)}
                      </h6>
                      <small className="text-muted">Monthly Avg</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Monthly Revenue - Enhanced with Colored Points */}
          <Col xl={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">Monthly Revenue (KES)</h5>
                  <div className="d-flex gap-2">
                    <Badge bg="success" className="d-flex align-items-center">
                      <div className="bg-success rounded-circle me-1" style={{width: '8px', height: '8px'}}></div>
                      High
                    </Badge>
                    <Badge bg="warning" className="d-flex align-items-center">
                      <div className="bg-warning rounded-circle me-1" style={{width: '8px', height: '8px'}}></div>
                      Medium
                    </Badge>
                    <Badge bg="danger" className="d-flex align-items-center">
                      <div className="bg-danger rounded-circle me-1" style={{width: '8px', height: '8px'}}></div>
                      Low
                    </Badge>
                  </div>
                </div>
                <div style={{ height: '300px' }}>
                  {Object.keys(revenueTotalData).length > 0 ? (
                    <Line
                      data={monthlyRevenueData}
                      options={{
                        ...chartOptions,
                        plugins: {
                          ...chartOptions.plugins,
                          tooltip: {
                            ...chartOptions.plugins.tooltip,
                            callbacks: {
                              label: function(context) {
                                return `Revenue: KES ${context.parsed.y.toLocaleString()}`;
                              }
                            }
                          }
                        },
                        onClick: (e, elements) => {
                          if (elements && elements.length) handleChartClick(elements, e.chart, 'revenue');
                        }
                      }}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                      <div className="text-center">
                        <div style={{fontSize: '3rem'}}>📊</div>
                        <p>No revenue data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Revenue by Category (Transport, Storage, Supplies) */}
          <Col xl={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h5 className="card-title mb-4">Revenue by Category (KES)</h5>
                <div style={{ height: '300px' }}>
                  <Line
                    data={getRevenueByCategoryData()}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        tooltip: {
                          ...chartOptions.plugins.tooltip,
                          callbacks: {
                            label: function(context) {
                              return `${context.dataset.label}: KES ${context.parsed.y.toLocaleString()}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                <Row className="mt-3 text-center">
                  <Col xs={4}>
                    <div className="border-end">
                      <h6 className="text-info">
                        KES {revenueByCategoryData.transport.monthly.reduce((a, b) => a + b, 0).toLocaleString()}
                      </h6>
                      <small className="text-muted">Total Transport</small>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div className="border-end">
                      <h6 className="text-primary">
                        KES {revenueByCategoryData.storage.monthly.reduce((a, b) => a + b, 0).toLocaleString()}
                      </h6>
                      <small className="text-muted">Total Storage</small>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div>
                      <h6 className="text-success">
                        KES {revenueByCategoryData.supplies.monthly.reduce((a, b) => a + b, 0).toLocaleString()}
                      </h6>
                      <small className="text-muted">Total Supplies</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Chemicals Usage Trends */}
          <Col xl={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h5 className="card-title mb-4">Chemicals Usage Trends</h5>
                <div style={{ height: '300px' }}>
                  <Line
                    data={getChemicalsUsageData()}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        tooltip: {
                          ...chartOptions.plugins.tooltip,
                          callbacks: {
                            label: function(context) {
                              const chemical = context.dataset.label.toLowerCase();
                              const unit = chemicalsData[chemical]?.unit || 'units';
                              return `${context.dataset.label}: ${context.parsed.y} ${unit}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                <Row className="mt-3 text-center">
                  <Col xs={3}>
                    <div className="border-end">
                      <h6 className="text-danger">{chemicalsData.formaldehyde.monthly.reduce((a, b) => a + b, 0)}</h6>
                      <small className="text-muted">Formaldehyde (L)</small>
                    </div>
                  </Col>
                  <Col xs={3}>
                    <div className="border-end">
                      <h6 className="text-info">{chemicalsData.disinfectants.monthly.reduce((a, b) => a + b, 0)}</h6>
                      <small className="text-muted">Disinfectants (L)</small>
                    </div>
                  </Col>
                  <Col xs={3}>
                    <div className="border-end">
                      <h6 className="text-success">{chemicalsData.preservatives.monthly.reduce((a, b) => a + b, 0)}</h6>
                      <small className="text-muted">Preservatives (kg)</small>
                    </div>
                  </Col>
                  <Col xs={3}>
                    <div>
                      <h6 className="text-warning">{chemicalsData.embalming.monthly.reduce((a, b) => a + b, 0)}</h6>
                      <small className="text-muted">Embalming (L)</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Case Status Distribution */}
          <Col xl={4} lg={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h5 className="card-title mb-4">Case Status Distribution</h5>
                <div style={{ height: '300px' }}>
                  {Object.keys(caseStatusData).length > 0 ? (
                    <Pie
                      data={{
                        labels: Object.keys(caseStatusData).map(formatCaseStatus),
                        datasets: [
                          {
                            data: Object.values(caseStatusData),
                            backgroundColor: CHART_COLORS,
                            borderWidth: 2,
                            borderColor: '#fff'
                          }
                        ]
                      }}
                      options={{
                        ...chartOptions,
                        onClick: (e, elements) => {
                          if (elements && elements.length) handleChartClick(elements, e.chart, 'pie');
                        }
                      }}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                      <div className="text-center">
                        <div style={{fontSize: '3rem'}}>📋</div>
                        <p>No case status data</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Extra Services Revenue */}
          <Col xl={4} lg={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h5 className="card-title mb-4">Extra Services Revenue</h5>
                <div style={{ height: '300px' }}>
                  {revenueExtraServicesData && Object.keys(revenueExtraServicesData).length > 0 ? (
                    <Doughnut
                      data={{
                        labels: Object.keys(revenueExtraServicesData),
                        datasets: [
                          {
                            data: Object.values(revenueExtraServicesData).map(service => service.revenue || 0),
                            backgroundColor: CHART_COLORS,
                            borderWidth: 2,
                            borderColor: '#fff'
                          }
                        ]
                      }}
                      options={{
                        ...chartOptions,
                        onClick: (e, elements) => {
                          if (elements && elements.length) handleChartClick(elements, e.chart, 'doughnut');
                        }
                      }}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                      <div className="text-center">
                        <div style={{fontSize: '3rem'}}>💼</div>
                        <p>No extra services data</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Service Type Distribution */}
          <Col xl={4} lg={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h5 className="card-title mb-4">Service Type Distribution</h5>
                <div style={{ height: '300px' }}>
                  {Object.keys(serviceTypesData).length > 0 ? (
                    <Bar
                      data={{
                        labels: Object.keys(serviceTypesData),
                        datasets: [
                          {
                            label: 'Cases',
                            data: Object.values(serviceTypesData),
                            backgroundColor: [
                              CUSTOM_COLORS.primaryDark,
                              CUSTOM_COLORS.accentBlue,
                              CUSTOM_COLORS.warningYellow
                            ],
                            borderWidth: 0,
                            borderRadius: 8
                          }
                        ]
                      }}
                      options={{
                        ...chartOptions,
                        onClick: (e, elements) => {
                          if (elements && elements.length) handleChartClick(elements, e.chart, 'bar');
                        }
                      }}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                      <div className="text-center">
                        <div style={{fontSize: '3rem'}}>🏥</div>
                        <p>No service type data</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Dispatch Schedule for Tomorrow */}
          <Col xl={6} lg={12}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">Dispatch Schedule (Next 48 Hours)</h5>
                  <Badge bg="warning" className="px-3 py-2">
                    {dispatchScheduleData.length} Scheduled
                  </Badge>
                </div>
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Age</th>
                        <th>Cause</th>
                        <th>Location</th>
                        <th>Scheduled Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dispatchScheduleData.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <strong>{item.name}</strong>
                          </td>
                          <td>{item.age}</td>
                          <td>
                            <Badge bg={
                              item.cause === 'Natural Causes' ? 'success' :
                              item.cause === 'Illness' ? 'warning' : 'danger'
                            }>
                              {item.cause}
                            </Badge>
                          </td>
                          <td>{item.location}</td>
                          <td>
                            <Badge bg="info" className="px-3 py-1">
                              {item.scheduled}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={item.status === 'confirmed' ? 'success' : 'warning'}>
                              {item.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
                <div className="mt-3 text-center">
                  <Button variant="outline-primary" size="sm">
                    View Full Schedule
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Insurance Analytics */}
          <Col xl={6} lg={12}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h5 className="card-title mb-4">Insurance Analytics</h5>
                <Row className="mb-4">
                  <Col xs={3} className="text-center">
                    <div className="p-3 border rounded">
                      <h3 className="text-primary">{insuranceData.activePolicies}</h3>
                      <small className="text-muted">Active Policies</small>
                    </div>
                  </Col>
                  <Col xs={3} className="text-center">
                    <div className="p-3 border rounded">
                      <h3 className="text-success">KES {(insuranceData.monthlyPremium / 1000000).toFixed(1)}M</h3>
                      <small className="text-muted">Monthly Premium</small>
                    </div>
                  </Col>
                  <Col xs={3} className="text-center">
                    <div className="p-3 border rounded">
                      <h3 className="text-warning">{insuranceData.claimsThisMonth}</h3>
                      <small className="text-muted">Claims This Month</small>
                    </div>
                  </Col>
                  <Col xs={3} className="text-center">
                    <div className="p-3 border rounded">
                      <h3 className="text-info">KES {(insuranceData.totalCoverage / 1000000).toFixed(0)}M</h3>
                      <small className="text-muted">Total Coverage</small>
                    </div>
                  </Col>
                </Row>
                <div style={{ height: '250px' }}>
                  <Line
                    data={getInsuranceTrendsData()}
                    options={{
                      ...chartOptions,
                      scales: {
                        x: { grid: { display: false } },
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: { display: true, text: 'Active Policies' }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: { display: true, text: 'Premiums (KES 100K)' },
                          grid: { drawOnChartArea: false }
                        }
                      }
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Average Stay Duration */}
          <Col xl={4} lg={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h5 className="card-title mb-4">Average Stay Duration (Days)</h5>
                <div style={{ height: '300px' }}>
                  {Object.keys(averageStayDurationData).length > 0 ? (
                    <Bar
                      data={{
                        labels: Object.keys(averageStayDurationData),
                        datasets: [
                          {
                            label: 'Days',
                            data: Object.values(averageStayDurationData),
                            backgroundColor: CHART_COLORS[2],
                            borderWidth: 0,
                            borderRadius: 8
                          }
                        ]
                      }}
                      options={chartOptions}
                    />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                      <div className="text-center">
                        <div style={{fontSize: '3rem'}}>⏱️</div>
                        <p>No stay duration data</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Operational Metrics - Larger Gauges */}
          <Col xl={4} lg={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h5 className="card-title mb-4">Operational Metrics</h5>
                <div className="text-center">
                  <GaugeChart
                    id="today-visitors-gauge"
                    nrOfLevels={20}
                    colors={[CHART_COLORS[0], CHART_COLORS[2], CHART_COLORS[4]]}
                    arcWidth={0.3}
                    percent={todayVisitors / 100}
                    textColor={Colors.dark}
                    needleColor={Colors.dark}
                    needleBaseColor={Colors.dark}
                    formatTextValue={() => `${todayVisitors}`}
                    style={{ width: '100%', height: '200px' }}
                  />
                  <h6 className="mt-3">Today's Visitors</h6>
                  <small className="text-muted">Real-time visitor count</small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Monthly Visitors Gauge */}
          <Col xl={4} lg={6}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <h5 className="card-title mb-4">Monthly Visitors</h5>
                <div className="text-center">
                  <GaugeChart
                    id="monthly-visitors-gauge"
                    nrOfLevels={20}
                    colors={[CHART_COLORS[0], CHART_COLORS[2], CHART_COLORS[4]]}
                    arcWidth={0.3}
                    percent={monthlyVisitors / 500}
                    textColor={Colors.dark}
                    needleColor={Colors.dark}
                    needleBaseColor={Colors.dark}
                    formatTextValue={() => `${monthlyVisitors}`}
                    style={{ width: '100%', height: '200px' }}
                  />
                  <h6 className="mt-3">Monthly Total</h6>
                  <small className="text-muted">Current month visitors</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Financial Metrics - Professional Line Graph at Bottom */}
        <Row className="g-4 mt-2">
          <Col lg={12}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="card-title mb-4">Financial Performance Trends</h5>
                <div style={{ height: '400px' }}>
                  <Line
                    data={financialTrendsData}
                    options={{
                      ...chartOptions,
                      scales: {
                        x: { grid: { display: false } },
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          title: { display: true, text: 'Collection Rate (%)' },
                          min: 0,
                          max: 3
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          title: { display: true, text: 'Outstanding (%)' },
                          min: 95,
                          max: 100,
                          grid: { drawOnChartArea: false }
                        }
                      }
                    }}
                  />
                </div>
                <Row className="mt-4 text-center">
                  <Col md={4}>
                    <div className="border-end">
                      <h4 className="text-primary">{collectionRate}%</h4>
                      <small className="text-muted">Collection Rate</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="border-end">
                      <h4 className="text-success">KES {revenuePerCase.toLocaleString()}</h4>
                      <small className="text-muted">Revenue Per Case</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div>
                      <h4 className="text-warning">{outstandingPercentage}%</h4>
                      <small className="text-muted">Outstanding %</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Policy Details Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>{selectedData?.label} Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>{renderModalContent()}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </ErrorBoundary>
  );
};

export default BeautifulMortuaryDashboard;