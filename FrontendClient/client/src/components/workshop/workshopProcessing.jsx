import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  Factory, 
  Package, 
  TrendingUp, 
  Clock,
  Users,
  ShoppingCart,
  Warehouse,
  Scissors,
  Hammer,
  PaintBucket,
  CheckCircle,
  Truck,
  Edit3,
  Plus,
  Eye,
  Zap,
  AlertTriangle,
  Box,
  Wrench,
  Droplets,
  Ruler,
  ChevronRight,
  User,
  Phone,
  MapPin,
  X,
  Calendar,
  DollarSign,
  BarChart3,
  Save,
  ArrowRight,
  ArrowDown
} from 'lucide-react';

// Animations
const slideIn = keyframes`
  from { transform: translateX(-10px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

// Styled Components
const Dashboard = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  font-family: 'Inter', sans-serif;
  padding: 1rem;
  overflow-x: hidden;
`;

const Header = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem 2rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #E2E8F0;
`;

const Title = styled.h1`
  margin: 0;
  color: #1E293B;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.75rem;
  font-weight: 700;
`;

const MainLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => props.color};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #1E293B;
  margin: 0.5rem 0;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #64748B;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  align-items: start;
`;

const ProductionPipeline = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #E2E8F0;
`;

const PipelineHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #F1F5F9;
`;

const PipelineTitle = styled.h2`
  margin: 0;
  color: #1E293B;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
`;

const ProductionStages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StageSection = styled.div`
  background: #F8FAFC;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 2px solid ${props => props.color}20;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.color};
    transform: translateX(5px);
  }
  
  &::before {
    content: '';
    position: absolute;
    left: -1.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.color};
    border: 3px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  &::after {
    content: '';
    position: absolute;
    left: -1.5rem;
    top: 50%;
    transform: translateY(50%);
    width: 2px;
    height: calc(100% + 1.5rem);
    background: ${props => props.color}40;
    z-index: 1;
  }
  
  &:last-child::after {
    display: none;
  }
`;

const StageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #E2E8F0;
`;

const StageTitle = styled.h3`
  margin: 0;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const StageCount = styled.span`
  background: ${props => props.color};
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
`;

const OrdersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  animation: ${slideIn} 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.selected ? '#3B82F6' : '#CBD5E1'};
  }
  
  ${props => props.selected && `
    border-color: #3B82F6;
    background: #F0F9FF;
    animation: ${pulse} 0.5s ease;
  `}
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.75rem;
`;

const OrderId = styled.div`
  font-weight: bold;
  color: #1E293B;
  font-size: 0.9rem;
`;

const PriorityBadge = styled.span`
  background: ${props => props.high ? '#EF4444' : '#F59E0B'};
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const OrderDetails = styled.div`
  color: #64748B;
  font-size: 0.8rem;
  margin-bottom: 1rem;
  line-height: 1.4;
`;

const ProgressBar = styled.div`
  background: #E2E8F0;
  height: 6px;
  border-radius: 3px;
  margin: 0.75rem 0;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  background: ${props => props.color};
  height: 100%;
  width: ${props => props.progress}%;
  transition: width 0.5s ease;
  border-radius: 3px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  background: ${props => {
    switch(props.variant) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'danger': return '#EF4444';
      default: return '#3B82F6';
    }
  }};
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
  font-weight: 500;

  &:hover {
    background: ${props => {
      switch(props.variant) {
        case 'success': return '#059669';
        case 'warning': return '#D97706';
        case 'danger': return '#DC2626';
        default: return '#2563EB';
      }
    }};
    transform: translateY(-1px);
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const DetailPanel = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #E2E8F0;
`;

const InventoryPanel = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #E2E8F0;
`;

const PanelTitle = styled.h3`
  color: #1E293B;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OrderInfo = styled.div`
  background: #F8FAFC;
  border-radius: 0.75rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid #E2E8F0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoLabel = styled.span`
  color: #64748B;
  font-size: 0.8rem;
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: #1E293B;
  font-size: 0.9rem;
  font-weight: 600;
`;

const ClientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: #64748B;
`;

const MaterialsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const MaterialItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #F8FAFC;
  border-radius: 0.5rem;
  border: 1px solid #E2E8F0;
`;

const MaterialInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const MaterialIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const MaterialDetails = styled.div`
  flex: 1;
`;

const MaterialName = styled.div`
  font-weight: 600;
  color: #1E293B;
  font-size: 0.85rem;
`;

const MaterialLevel = styled.div`
  font-size: 0.75rem;
  color: #64748B;
`;

const MaterialStats = styled.div`
  text-align: right;
`;

const MaterialQuantity = styled.div`
  font-weight: bold;
  color: ${props => props.low ? '#EF4444' : '#1E293B'};
  font-size: 1rem;
`;

const MaterialUnit = styled.div`
  font-size: 0.7rem;
  color: #64748B;
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #E2E8F0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #1E293B;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
`;

// Dummy data generators
const generateOrder = (id) => {
  const types = ['Standard', 'Premium', 'Deluxe', 'Economy'];
  const sizes = ['Adult', 'Child', 'Oversized'];
  const materials = ['Oak', 'Pine', 'Mahogany', 'Plywood'];
  const clients = [
    { name: 'John Kamau', phone: '+254712345678', location: 'Nairobi' },
    { name: 'Mary Wanjiku', phone: '+254723456789', location: 'Mombasa' },
    { name: 'David Ochieng', phone: '+254734567890', location: 'Kisumu' }
  ];
  const client = clients[Math.floor(Math.random() * clients.length)];
  
  return {
    id: `COFF-${String(id).padStart(3, '0')}`,
    type: types[Math.floor(Math.random() * types.length)],
    size: sizes[Math.floor(Math.random() * sizes.length)],
    material: materials[Math.floor(Math.random() * materials.length)],
    client: client.name,
    phone: client.phone,
    location: client.location,
    priority: Math.random() > 0.7 ? 'HIGH' : 'NORMAL',
    status: 'requested',
    createdAt: new Date(),
    progress: 0,
    price: [15000, 25000, 40000, 8000][Math.floor(Math.random() * 4)],
    materialsUsed: {
      cutting: { plywood: 2.5, sawBlades: 1, sandpaper: 3 },
      assembling: { nails: 45, screws: 25, glue: 0.8, hinges: 4 },
      polishing: { polish: 1.2, brushes: 2, cloth: 2.5 },
      finishing: { handles: 2, lining: 3, trim: 4, varnish: 0.5 }
    }
  };
};

const initialInventory = [
  { id: 1, name: 'Plywood Sheets', quantity: 45, unit: 'sheets', color: '#8B5CF6', lowThreshold: 20, icon: <Box size={18} /> },
  { id: 2, name: 'Nails', quantity: 1250, unit: 'pieces', color: '#EF4444', lowThreshold: 500, icon: <Wrench size={18} /> },
  { id: 3, name: 'Screws', quantity: 890, unit: 'pieces', color: '#F59E0B', lowThreshold: 300, icon: <Wrench size={18} /> },
  { id: 4, name: 'Wood Glue', quantity: 35, unit: 'liters', color: '#3B82F6', lowThreshold: 15, icon: <Droplets size={18} /> },
  { id: 5, name: 'Wood Polish', quantity: 28, unit: 'liters', color: '#10B981', lowThreshold: 10, icon: <Droplets size={18} /> },
  { id: 6, name: 'Handles', quantity: 67, unit: 'sets', color: '#0EA5E9', lowThreshold: 25, icon: <Box size={18} /> }
];

const CoffinProductionDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState(initialInventory);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editingStage, setEditingStage] = useState('');
  const [production, setProduction] = useState({
    requested: [],
    approved: [],
    cutting: [],
    assembling: [],
    polishing: [],
    finishing: [],
    completed: []
  });

  // Initialize with dummy data
  useEffect(() => {
    const initialOrders = Array.from({ length: 15 }, (_, i) => generateOrder(i + 1));
    setOrders(initialOrders);
    
    const initialProduction = {
      requested: initialOrders.slice(0, 4),
      approved: initialOrders.slice(4, 6),
      cutting: initialOrders.slice(6, 8).map(order => ({ ...order, progress: 25 })),
      assembling: initialOrders.slice(8, 10).map(order => ({ ...order, progress: 50 })),
      polishing: initialOrders.slice(10, 12).map(order => ({ ...order, progress: 75 })),
      finishing: initialOrders.slice(12, 13).map(order => ({ ...order, progress: 90 })),
      completed: initialOrders.slice(13, 15).map(order => ({ ...order, progress: 100 }))
    };
    setProduction(initialProduction);
    setSelectedOrder(initialProduction.requested[0]);
  }, []);

  // Real-time simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setProduction(prev => {
        const newProduction = { ...prev };
        
        if (newProduction.cutting.length > 0 && Math.random() > 0.7) {
          const order = newProduction.cutting[0];
          newProduction.cutting = newProduction.cutting.slice(1);
          newProduction.assembling.push({ ...order, progress: 50 });
        }
        
        if (newProduction.assembling.length > 0 && Math.random() > 0.6) {
          const order = newProduction.assembling[0];
          newProduction.assembling = newProduction.assembling.slice(1);
          newProduction.polishing.push({ ...order, progress: 75 });
        }
        
        if (newProduction.polishing.length > 0 && Math.random() > 0.5) {
          const order = newProduction.polishing[0];
          newProduction.polishing = newProduction.polishing.slice(1);
          newProduction.finishing.push({ ...order, progress: 90 });
        }
        
        if (newProduction.finishing.length > 0 && Math.random() > 0.4) {
          const order = newProduction.finishing[0];
          newProduction.finishing = newProduction.finishing.slice(1);
          newProduction.completed.push({ ...order, progress: 100 });
        }

        if (Math.random() > 0.8 && orders.length < 20) {
          const newOrder = generateOrder(orders.length + 1);
          setOrders(prev => [...prev, newOrder]);
          newProduction.requested.push(newOrder);
        }

        return newProduction;
      });

    }, 3000);

    return () => clearInterval(interval);
  }, [orders.length]);

  const approveOrder = (order) => {
    setProduction(prev => ({
      ...prev,
      requested: prev.requested.filter(o => o.id !== order.id),
      approved: [...prev.approved, order]
    }));
    setSelectedOrder(order);
  };

  const startProduction = (order) => {
    setProduction(prev => ({
      ...prev,
      approved: prev.approved.filter(o => o.id !== order.id),
      cutting: [...prev.cutting, { ...order, progress: 0 }]
    }));
    setSelectedOrder(order);
  };

  const openMaterialsModal = (order, stage) => {
    setEditingOrder(order);
    setEditingStage(stage);
    setShowMaterialsModal(true);
  };

  const getStageColor = (stage) => {
    const colors = {
      requested: '#F59E0B',
      approved: '#0EA5E9',
      cutting: '#EF4444',
      assembling: '#8B5CF6',
      polishing: '#3B82F6',
      finishing: '#10B981',
      completed: '#059669'
    };
    return colors[stage] || '#64748B';
  };

  const getStageIcon = (stage) => {
    const icons = {
      requested: <Clock size={20} />,
      approved: <CheckCircle size={20} />,
      cutting: <Scissors size={20} />,
      assembling: <Hammer size={20} />,
      polishing: <PaintBucket size={20} />,
      finishing: <CheckCircle size={20} />,
      completed: <Truck size={20} />
    };
    return icons[stage] || <Package size={20} />;
  };

  const stats = {
    total: orders.length,
    inProduction: production.cutting.length + production.assembling.length + production.polishing.length + production.finishing.length,
    completed: production.completed.length,
    pending: production.requested.length
  };

  const lowStockItems = inventory.filter(item => item.quantity <= item.lowThreshold);

  return (
    <Dashboard>
      <Header>
        <Title>
          <Factory size={32} color="#1E293B" />
          Coffin Production Dashboard
        </Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ActionButton 
            onClick={() => setShowRequestsModal(true)}
            style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
            variant="warning"
          >
            <ShoppingCart size={18} />
            View Requests ({production.requested.length})
          </ActionButton>
          <ActionButton style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
            <Plus size={18} />
            New Order
          </ActionButton>
        </div>
      </Header>

      <MainLayout>
        <StatsGrid>
          <StatCard color="#F59E0B">
            <StatLabel><ShoppingCart size={20} /> Total Orders</StatLabel>
            <StatNumber>{stats.total}</StatNumber>
          </StatCard>
          <StatCard color="#EF4444">
            <StatLabel><Clock size={20} /> In Production</StatLabel>
            <StatNumber>{stats.inProduction}</StatNumber>
          </StatCard>
          <StatCard color="#10B981">
            <StatLabel><CheckCircle size={20} /> Completed</StatLabel>
            <StatNumber>{stats.completed}</StatNumber>
          </StatCard>
          <StatCard color="#0EA5E9">
            <StatLabel><Users size={20} /> Pending Approval</StatLabel>
            <StatNumber>{stats.pending}</StatNumber>
          </StatCard>
        </StatsGrid>

        <ContentGrid>
          <ProductionPipeline>
            <PipelineHeader>
              <PipelineTitle>
                <TrendingUp size={24} />
                Production Pipeline
              </PipelineTitle>
              <div style={{ color: '#64748B', fontSize: '0.9rem' }}>
                Real-time production tracking
              </div>
            </PipelineHeader>

            <ProductionStages>
              {['requested', 'approved', 'cutting', 'assembling', 'polishing', 'finishing', 'completed'].map(stage => (
                <StageSection key={stage} color={getStageColor(stage)}>
                  <StageHeader>
                    <StageTitle color={getStageColor(stage)}>
                      {getStageIcon(stage)}
                      {stage.charAt(0).toUpperCase() + stage.slice(1)} Stage
                    </StageTitle>
                    <StageCount color={getStageColor(stage)}>
                      {production[stage]?.length || 0} Orders
                    </StageCount>
                  </StageHeader>

                  <OrdersGrid>
                    {production[stage]?.map((order) => (
                      <OrderCard 
                        key={order.id} 
                        selected={selectedOrder?.id === order.id}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <OrderHeader>
                          <OrderId>{order.id}</OrderId>
                          <PriorityBadge high={order.priority === 'HIGH'}>
                            <Zap size={12} />
                            {order.priority}
                          </PriorityBadge>
                        </OrderHeader>

                        <OrderDetails>
                          <div style={{ fontWeight: '600', color: '#1E293B', marginBottom: '0.25rem' }}>
                            {order.type} {order.size}
                          </div>
                          <div style={{ color: '#64748B' }}>
                            Material: {order.material} • Client: {order.client}
                          </div>
                        </OrderDetails>

                        {order.progress > 0 && order.progress < 100 && (
                          <ProgressBar>
                            <ProgressFill 
                              progress={order.progress} 
                              color={getStageColor(stage)}
                            />
                          </ProgressBar>
                        )}

                        <ActionButtons>
                          {stage === 'requested' && (
                            <ActionButton 
                              variant="success"
                              onClick={(e) => {
                                e.stopPropagation();
                                approveOrder(order);
                              }}
                            >
                              <CheckCircle size={16} />
                              Approve
                            </ActionButton>
                          )}
                          
                          {stage === 'approved' && (
                            <ActionButton 
                              onClick={(e) => {
                                e.stopPropagation();
                                startProduction(order);
                              }}
                            >
                              <ArrowRight size={16} />
                              Start Production
                            </ActionButton>
                          )}
                          
                          {['cutting', 'assembling', 'polishing', 'finishing'].includes(stage) && (
                            <ActionButton 
                              onClick={(e) => {
                                e.stopPropagation();
                                openMaterialsModal(order, stage);
                              }}
                            >
                              <Edit3 size={16} />
                              Materials
                            </ActionButton>
                          )}
                          
                          <ActionButton variant={stage === 'completed' ? 'success' : ''}>
                            <Eye size={16} />
                            Details
                          </ActionButton>
                        </ActionButtons>
                      </OrderCard>
                    ))}
                  </OrdersGrid>
                </StageSection>
              ))}
            </ProductionStages>
          </ProductionPipeline>

          <Sidebar>
            <DetailPanel>
              {selectedOrder ? (
                <>
                  <PanelTitle>
                    <Eye size={20} />
                    Order Details
                  </PanelTitle>
                  
                  <OrderInfo>
                    <InfoGrid>
                      <InfoItem>
                        <InfoLabel>Order ID</InfoLabel>
                        <InfoValue>{selectedOrder.id}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Type</InfoLabel>
                        <InfoValue>{selectedOrder.type}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Size</InfoLabel>
                        <InfoValue>{selectedOrder.size}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Material</InfoLabel>
                        <InfoValue>{selectedOrder.material}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Price</InfoLabel>
                        <InfoValue>KSh {selectedOrder.price?.toLocaleString()}</InfoValue>
                      </InfoItem>
                      <InfoItem>
                        <InfoLabel>Priority</InfoLabel>
                        <InfoValue>
                          <PriorityBadge high={selectedOrder.priority === 'HIGH'}>
                            {selectedOrder.priority}
                          </PriorityBadge>
                        </InfoValue>
                      </InfoItem>
                    </InfoGrid>
                  </OrderInfo>

                  <PanelTitle>
                    <User size={20} />
                    Client Information
                  </PanelTitle>
                  <OrderInfo>
                    <ClientInfo>
                      <User size={16} />
                      {selectedOrder.client}
                    </ClientInfo>
                    <ClientInfo>
                      <Phone size={16} />
                      {selectedOrder.phone}
                    </ClientInfo>
                    <ClientInfo>
                      <MapPin size={16} />
                      {selectedOrder.location}
                    </ClientInfo>
                    <ClientInfo>
                      <Calendar size={16} />
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </ClientInfo>
                  </OrderInfo>

                  <PanelTitle>
                    <BarChart3 size={20} />
                    Materials Used
                  </PanelTitle>
                  <OrderInfo>
                    {Object.entries(selectedOrder.materialsUsed || {}).map(([stage, materials]) => (
                      <div key={stage} style={{ marginBottom: '1rem' }}>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          fontWeight: '600', 
                          color: getStageColor(stage),
                          marginBottom: '0.5rem',
                          textTransform: 'capitalize'
                        }}>
                          {stage} Stage
                        </div>
                        {Object.entries(materials).map(([material, quantity]) => (
                          quantity > 0 && (
                            <div key={material} style={{ 
                              fontSize: '0.75rem', 
                              color: '#64748B',
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: '0.25rem',
                              padding: '0.25rem 0'
                            }}>
                              <span style={{ textTransform: 'capitalize' }}>{material.replace(/([A-Z])/g, ' $1')}:</span>
                              <span style={{ fontWeight: '600', color: '#1E293B' }}>{quantity}</span>
                            </div>
                          )
                        ))}
                      </div>
                    ))}
                  </OrderInfo>
                </>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#64748B', 
                  padding: '3rem 1rem'
                }}>
                  <Eye size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <div style={{ fontSize: '1rem', fontWeight: '500' }}>Select an order to view details</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Click on any order card to see detailed information</div>
                </div>
              )}
            </DetailPanel>

            <InventoryPanel>
              <PanelTitle>
                <Warehouse size={20} />
                Materials Inventory
              </PanelTitle>
              <MaterialsGrid>
                {inventory.map(item => (
                  <MaterialItem key={item.id}>
                    <MaterialInfo>
                      <MaterialIcon color={item.color}>
                        {item.icon}
                      </MaterialIcon>
                      <MaterialDetails>
                        <MaterialName>{item.name}</MaterialName>
                        <MaterialLevel>Low stock: {item.lowThreshold} {item.unit}</MaterialLevel>
                      </MaterialDetails>
                    </MaterialInfo>
                    <MaterialStats>
                      <MaterialQuantity low={item.quantity <= item.lowThreshold}>
                        {item.quantity}
                      </MaterialQuantity>
                      <MaterialUnit>{item.unit}</MaterialUnit>
                    </MaterialStats>
                  </MaterialItem>
                ))}
              </MaterialsGrid>
              
              {lowStockItems.length > 0 && (
                <div style={{ 
                  background: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.85rem',
                  color: '#92400E'
                }}>
                  <AlertTriangle size={18} />
                  <div>
                    <div style={{ fontWeight: '600' }}>Low Stock Alert</div>
                    <div style={{ fontSize: '0.8rem' }}>{lowStockItems.length} items need restocking</div>
                  </div>
                </div>
              )}
            </InventoryPanel>
          </Sidebar>
        </ContentGrid>
      </MainLayout>

      {/* Materials Modal */}
      {showMaterialsModal && editingOrder && (
        <ModalOverlay onClick={() => setShowMaterialsModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <Edit3 size={24} />
                Edit Materials - {editingStage.toUpperCase()} Stage
              </ModalTitle>
              <ActionButton 
                variant="danger" 
                onClick={() => setShowMaterialsModal(false)}
                style={{ width: 'auto', padding: '0.5rem' }}
              >
                <X size={18} />
              </ActionButton>
            </ModalHeader>
            
            <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: '#64748B' }}>
              Order: <strong>{editingOrder.id}</strong> • {editingOrder.type} {editingOrder.size}
            </div>
            
            <div style={{ background: '#F8FAFC', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1E293B', marginBottom: '1rem' }}>
                Current Materials Used:
              </div>
              {Object.entries(editingOrder.materialsUsed?.[editingStage] || {}).map(([material, quantity]) => (
                quantity > 0 && (
                  <div key={material} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #E2E8F0'
                  }}>
                    <span style={{ textTransform: 'capitalize', color: '#64748B' }}>
                      {material.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span style={{ fontWeight: '600', color: '#1E293B' }}>{quantity}</span>
                  </div>
                )
              ))}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <ActionButton 
                variant="danger" 
                onClick={() => setShowMaterialsModal(false)}
                style={{ width: 'auto', padding: '0.75rem 1.25rem' }}
              >
                <X size={16} />
                Close
              </ActionButton>
              <ActionButton 
                variant="success"
                onClick={() => setShowMaterialsModal(false)}
                style={{ width: 'auto', padding: '0.75rem 1.25rem' }}
              >
                <Save size={16} />
                Save Changes
              </ActionButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Requests Modal */}
      {showRequestsModal && (
        <ModalOverlay onClick={() => setShowRequestsModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <ShoppingCart size={24} />
                Pending Order Requests ({production.requested.length})
              </ModalTitle>
              <ActionButton 
                variant="danger" 
                onClick={() => setShowRequestsModal(false)}
                style={{ width: 'auto', padding: '0.5rem' }}
              >
                <X size={18} />
              </ActionButton>
            </ModalHeader>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
              {production.requested.map((order) => (
                <div key={order.id} style={{ 
                  background: '#F8FAFC', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.75rem',
                  padding: '1.25rem',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#1E293B', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                        {order.id}
                      </div>
                      <div style={{ color: '#64748B', fontSize: '0.85rem' }}>
                        {order.type} {order.size} • {order.material}
                      </div>
                    </div>
                    <PriorityBadge high={order.priority === 'HIGH'}>
                      {order.priority}
                    </PriorityBadge>
                  </div>
                  
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '1rem' }}>
                    <ClientInfo style={{ marginBottom: '0.25rem' }}>
                      <User size={14} />
                      {order.client} • {order.location}
                    </ClientInfo>
                    <ClientInfo>
                      <DollarSign size={14} />
                      KSh {order.price?.toLocaleString()}
                    </ClientInfo>
                  </div>
                  
                  <ActionButton 
                    variant="success"
                    onClick={() => {
                      approveOrder(order);
                      setShowRequestsModal(false);
                    }}
                    style={{ width: '100%' }}
                  >
                    <CheckCircle size={16} />
                    Approve Order
                  </ActionButton>
                </div>
              ))}
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Dashboard>
  );
};

export default CoffinProductionDashboard;