import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Truck,
  Calendar,
  PlusCircle,
  X,
  Loader2,
  CheckCircle,
  MapPin,
  DollarSign,
  Car,
  Edit,
  Trash2,
  Route,
  Fuel,
  Gauge,
  Settings,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Clean color palette
const Colors = {
  cardBg: '#FFFFFF',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  borderColor: '#E5E7EB',
  shadow: '0 4px 12px rgba(0,0,0,0.05)',
  accentBlue: '#1e293b',
  dangerRed: '#EF4444',
  successGreen: '#10B981',
  buttonBg: '#2563EB',
  buttonHover: '#1D4ED8',
  progressBg: '#F3F4F6',
  hoverGray: '#F9FAFB',
};

// --- Styled Components ---
const DispatchContainer = styled.div`
  background-color: ${Colors.cardBg};
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: ${Colors.shadow};
  border: 1px solid ${Colors.borderColor};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h4`
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: ${Colors.textPrimary};

  svg {
    color: ${Colors.accentBlue};
  }
`;

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background-color: ${Colors.buttonBg};
  color: white;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background-color: ${Colors.buttonHover};
  }

  &:disabled {
    background-color: ${Colors.textSecondary};
    cursor: not-allowed;
  }
`;

const TripCard = styled.div`
  background: ${Colors.cardBg};
  border: 1px solid ${Colors.borderColor};
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${Colors.shadow};
    border-color: ${Colors.accentBlue}40;
  }
`;

const TripHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TripLabel = styled.div`
  background: ${Colors.accentBlue};
  color: white;
  padding: 0.3rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: ${Colors.textSecondary};
  font-size: 0.85rem;
  background: ${Colors.progressBg};
  padding: 0.3rem 1rem;
  border-radius: 2rem;
`;

const VehicleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  flex-wrap: wrap;
`;

const VehicleTag = styled.span`
  background: ${Colors.progressBg};
  padding: 0.2rem 0.8rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  color: ${Colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const RouteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${Colors.progressBg};
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  margin: 1rem 0;
  flex-wrap: wrap;
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: ${Colors.textPrimary};
`;

const Arrow = styled.span`
  color: ${Colors.textSecondary};
  font-size: 1rem;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1.5rem;
  margin: 1rem 0;
  flex-wrap: wrap;
`;

const Stat = styled.div`
  font-size: 0.9rem;
  color: ${Colors.textSecondary};

  strong {
    color: ${Colors.textPrimary};
    margin-right: 0.25rem;
    font-weight: 600;
  }
`;

const FuelEstimate = styled.div`
  background: #10b98110;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  margin: 0.75rem 0;
  font-size: 0.9rem;
  color: #059669;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${Colors.borderColor};
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid ${Colors.borderColor};
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.danger ? Colors.dangerRed : Colors.accentBlue)};
    color: white;
    border-color: ${(props) => (props.danger ? Colors.dangerRed : Colors.accentBlue)};
  }
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
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ModalHeader = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${Colors.borderColor};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${Colors.textSecondary};

  &:hover {
    color: ${Colors.dangerRed};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 0.4rem;
  font-size: 0.9rem;
  color: ${Colors.textPrimary};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid ${Colors.borderColor};
  border-radius: 0.5rem;
  font-size: 0.95rem;

  &:focus {
    outline: none;
    border-color: ${Colors.accentBlue};
  }
`;

const MapContainer = styled.div`
  height: 200px;
  width: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid ${Colors.borderColor};
  margin-bottom: 1rem;

  iframe {
    border: none;
    width: 100%;
    height: 100%;
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${Colors.borderColor};
  border-radius: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: ${Colors.shadow};
`;

const SearchResultItem = styled.div`
  padding: 0.6rem 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid ${Colors.borderColor};
  font-size: 0.9rem;

  &:hover {
    background: ${Colors.hoverGray};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const SummaryBox = styled.div`
  background: ${Colors.progressBg};
  padding: 1rem;
  border-radius: 0.75rem;
  margin: 1rem 0;

  p {
    margin: 0.5rem 0;
    display: flex;
    justify-content: space-between;
    font-size: 0.95rem;
  }

  strong {
    color: ${Colors.accentBlue};
  }
`;

const RateInput = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;

  input {
    flex: 1;
    padding: 0.6rem 0.75rem;
    border: 1px solid ${Colors.borderColor};
    border-radius: 0.5rem;
    font-size: 0.95rem;
  }

  span {
    color: ${Colors.textSecondary};
    font-weight: 500;
  }
`;

// TomTom API Configuration
const TOMTOM_API_KEY = 'vrEBolWtMhzwL9icvdOoNQlHbghvBE1F';
const API_BASE_URL = 'http://localhost:5000/api/v1/restpoint';
const DEFAULT_MORTUARY = {
  lat: -1.2921,
  lon: 36.8219,
  address: 'LEE FUNERAL SERVICES',
};

const DispatchSection = ({ deceasedId, onUpdate }) => {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('System');
  const [trips, setTrips] = useState([]);

  // Form state
  const [tripName, setTripName] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleCC, setVehicleCC] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [negotiatedPrice, setNegotiatedPrice] = useState('');
  const [ratePerKm, setRatePerKm] = useState(100); // Default rate per km

  // Location state
  const [destination, setDestination] = useState('');
  const [destinationLat, setDestinationLat] = useState(null);
  const [destinationLon, setDestinationLon] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [travelTime, setTravelTime] = useState(null);

  // Calculations
  const [fuelCost, setFuelCost] = useState(null);
  const [fuelEstimate, setFuelEstimate] = useState(null);
  const [transportCost, setTransportCost] = useState(null);
  const [totalCost, setTotalCost] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) setUsername(storedUser);
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [deceasedId, id]);

  const fetchTrips = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dispatch/${deceasedId || id}`);
      if (response.data.success) {
        setTrips(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const calculateFuelCost = () => {
    if (!vehicleCC || !distance) return null;

    const cc = parseFloat(vehicleCC);
    let kmPerLiter = cc < 1500 ? 15 : cc < 2000 ? 12 : cc < 3000 ? 9 : cc < 4000 ? 6 : 4;

    const roundTrip = distance * 2;
    const fuelNeeded = roundTrip / kmPerLiter;
    return {
      liters: Math.round(fuelNeeded * 10) / 10,
      cost: Math.round(fuelNeeded * 180), // KES 180 per liter
    };
  };

  const calculateTransportCost = () => {
    if (!distance) return null;
    const roundTrip = distance * 2;
    return Math.round(roundTrip * ratePerKm);
  };

  useEffect(() => {
    if (distance) {
      const fuel = calculateFuelCost();
      if (fuel) {
        setFuelEstimate(fuel.liters);
        setFuelCost(fuel.cost);
      }

      const transport = calculateTransportCost();
      setTransportCost(transport);

      // Total cost = fuel + transport
      const total = (fuel?.cost || 0) + (transport || 0);
      setTotalCost(total);
    }
  }, [distance, vehicleCC, ratePerKm]);

  const searchLocation = async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?key=${TOMTOM_API_KEY}&countrySet=KE&limit=5`,
      );
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const calculateRoute = async (lat, lon) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.tomtom.com/routing/1/calculateRoute/${DEFAULT_MORTUARY.lat},${DEFAULT_MORTUARY.lon}:${lat},${lon}/json?key=${TOMTOM_API_KEY}&travelMode=car`,
      );
      const data = await response.json();

      if (data.routes?.[0]) {
        const route = data.routes[0];
        const distanceKm = (route.summary.lengthInMeters / 1000).toFixed(1);
        const timeInSeconds = route.summary.travelTimeInSeconds;
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        setDistance(parseFloat(distanceKm));
        setTravelTime(timeString);
      }
    } catch (error) {
      console.error('Route error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDestinationSelect = (result) => {
    setDestination(result.address.freeformAddress);
    setDestinationLat(result.position.lat);
    setDestinationLon(result.position.lon);
    setSearchResults([]);
    calculateRoute(result.position.lat, result.position.lon);
  };

  const getMapUrl = () => {
    if (!destinationLat || !destinationLon) {
      return `https://www.openstreetmap.org/export/embed.html?bbox=36.7,-1.4,37.0,-1.2&layer=mapnik&marker=${DEFAULT_MORTUARY.lat},${DEFAULT_MORTUARY.lon}`;
    }

    const minLon = Math.min(DEFAULT_MORTUARY.lon, destinationLon) - 0.1;
    const maxLon = Math.max(DEFAULT_MORTUARY.lon, destinationLon) + 0.1;
    const minLat = Math.min(DEFAULT_MORTUARY.lat, destinationLat) - 0.1;
    const maxLat = Math.max(DEFAULT_MORTUARY.lat, destinationLat) + 0.1;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon},${minLat},${maxLon},${maxLat}&layer=mapnik&marker=${DEFAULT_MORTUARY.lat},${DEFAULT_MORTUARY.lon}&marker=${destinationLat},${destinationLon}`;
  };

  const resetForm = () => {
    setTripName('');
    setVehiclePlate('');
    setVehicleName('');
    setVehicleCC('');
    setDispatchDate('');
    setNegotiatedPrice('');
    setRatePerKm(100);
    setDestination('');
    setDestinationLat(null);
    setDestinationLon(null);
    setDistance(null);
    setTravelTime(null);
    setFuelCost(null);
    setFuelEstimate(null);
    setTransportCost(null);
    setTotalCost(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const fuel = calculateFuelCost();

    const tripData = {
      deceased_id: deceasedId || id,
      vehicle_plate: vehiclePlate,
      vehicle_name: vehicleName || null,
      vehicle_cc: vehicleCC || null,
      dispatch_date: dispatchDate,
      destination_address: destination,
      destination_lat: destinationLat,
      destination_lon: destinationLon,
      distance_km: distance,
      round_trip_km: distance ? distance * 2 : null,
      travel_time: travelTime,
      fuel_estimate: fuelEstimate,
      fuel_cost: fuelCost,
      rate_per_km: ratePerKm,
      total_cost: totalCost,
      negotiated_price: negotiatedPrice || null,
      trip_name: tripName || `Trip ${new Date(dispatchDate).toLocaleDateString()}`,
      origin_address: DEFAULT_MORTUARY.address,
      origin_lat: DEFAULT_MORTUARY.lat,
      origin_lon: DEFAULT_MORTUARY.lon,
      created_by: username,
    };

    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/dispatch/${editingId}`, tripData);
        setMessage('Trip updated!');
      } else {
        await axios.post(`${API_BASE_URL}/dispatch`, tripData);
        setMessage('Trip added!');
      }

      setTimeout(async () => {
        setShowModal(false);
        resetForm();
        await fetchTrips();
        onUpdate?.();
        setMessage('');
      }, 1500);
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tripId) => {
    if (window.confirm('Delete this trip?')) {
      try {
        await axios.delete(`${API_BASE_URL}/dispatch/${tripId}`);
        await fetchTrips();
        onUpdate?.();
      } catch (error) {
        setMessage('Error deleting trip');
      }
    }
  };

  const handleEdit = (trip) => {
    setEditingId(trip.dispatch_id);
    setTripName(trip.trip_name);
    setVehiclePlate(trip.vehicle_plate);
    setVehicleName(trip.vehicle_name);
    setVehicleCC(trip.vehicle_cc);
    setDispatchDate(trip.dispatch_date?.split('T')[0]);
    setNegotiatedPrice(trip.negotiated_price || '');
    setRatePerKm(trip.rate_per_km || 100);
    setDestination(trip.destination_address);
    setDestinationLat(trip.destination_lat);
    setDestinationLon(trip.destination_lon);
    setDistance(trip.distance_km);
    setTravelTime(trip.travel_time);
    setShowModal(true);
  };

  return (
    <DispatchContainer>
      <Header>
        <Title>
          <Truck size={20} />
          Vehicle Trips
        </Title>
        <StyledButton
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <PlusCircle size={16} /> Add Trip
        </StyledButton>
      </Header>

      {message && (
        <div
          style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            background: message.includes('Error') ? '#FEE2E2' : '#D1FAE5',
            color: message.includes('Error') ? '#DC2626' : '#059669',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            textAlign: 'center',
          }}
        >
          {message}
        </div>
      )}

      {trips.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: Colors.textSecondary }}>
          No trips added yet
        </div>
      ) : (
        trips.map((trip) => {
          const displayPrice = trip.negotiated_price || trip.total_cost || 0;

          return (
            <TripCard key={trip.dispatch_id}>
              <TripHeader>
                <TripLabel>
                  <Route size={14} />
                  {trip.trip_name || 'Trip'}
                </TripLabel>
                <DateBadge>
                  <Calendar size={14} />
                  {new Date(trip.dispatch_date).toLocaleDateString()}
                </DateBadge>
              </TripHeader>

              <VehicleInfo>
                <Car size={16} color={Colors.accentBlue} />
                <strong style={{ fontSize: '0.95rem' }}>{trip.vehicle_plate}</strong>
                {trip.vehicle_name && (
                  <VehicleTag>
                    <Car size={12} /> {trip.vehicle_name}
                  </VehicleTag>
                )}
                {trip.vehicle_cc && (
                  <VehicleTag>
                    <Gauge size={12} /> {trip.vehicle_cc}CC
                  </VehicleTag>
                )}
              </VehicleInfo>

              <RouteInfo>
                <Location>
                  <MapPin size={14} color="#10B981" />
                  <span>{trip.origin_address}</span>
                </Location>
                <Arrow>→</Arrow>
                <Location>
                  <MapPin size={14} color="#EF4444" />
                  <span>{trip.destination_address}</span>
                </Location>
              </RouteInfo>

              <StatsRow>
                <Stat>
                  <strong>{trip.distance_km || 0}</strong> km one way
                </Stat>
                <Stat>
                  <strong>
                    {trip.round_trip_km ||
                      (trip.distance_km ? (trip.distance_km * 2).toFixed(1) : 0)}
                  </strong>{' '}
                  km round trip
                </Stat>
                {trip.travel_time && <Stat>⏱️ {trip.travel_time}</Stat>}
                {trip.rate_per_km && (
                  <Stat>
                    <Settings size={12} style={{ display: 'inline', marginRight: '2px' }} />
                    KES {trip.rate_per_km}/km
                  </Stat>
                )}
              </StatsRow>

              {trip.fuel_cost && (
                <FuelEstimate>
                  <Fuel size={14} />
                  <span>
                    Fuel: {trip.fuel_estimate}L (KES {trip.fuel_cost})
                  </span>
                </FuelEstimate>
              )}

              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Stat style={{ fontWeight: 500 }}>
                  <DollarSign size={14} style={{ display: 'inline', marginRight: '2px' }} />
                  {displayPrice.toLocaleString()}
                  <span
                    style={{ color: Colors.textSecondary, marginLeft: '4px', fontSize: '0.8rem' }}
                  >
                    {trip.negotiated_price ? '(final)' : '(est.)'}
                  </span>
                </Stat>

                <ActionButtons>
                  <ActionButton onClick={() => handleEdit(trip)}>
                    <Edit size={14} /> Edit
                  </ActionButton>
                  <ActionButton danger onClick={() => handleDelete(trip.dispatch_id)}>
                    <Trash2 size={14} /> Delete
                  </ActionButton>
                </ActionButtons>
              </div>
            </TripCard>
          );
        })
      )}

      <ModalOverlay style={{ display: showModal ? 'flex' : 'none' }}>
        <ModalContent>
          <ModalHeader>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
              {editingId ? 'Edit Trip' : 'New Trip'}
            </h3>
            <CloseButton
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              <X size={20} />
            </CloseButton>
          </ModalHeader>

          {/* Left Column */}
          <div>
            <FormGroup>
              <Label>Trip Name</Label>
              <Input
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="e.g., Trip A, Funeral Day"
              />
            </FormGroup>

            <FormGroup>
              <Label>Vehicle Plate *</Label>
              <Input
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                placeholder="KCA 123A"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Vehicle Name</Label>
              <Input
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                placeholder="e.g., Mercedes, Toyota"
              />
            </FormGroup>

            <FormGroup>
              <Label>Engine CC</Label>
              <Input
                value={vehicleCC}
                onChange={(e) => setVehicleCC(e.target.value)}
                placeholder="e.g., 2000"
              />
            </FormGroup>

            <FormGroup>
              <Label>Trip Date *</Label>
              <Input
                type="date"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Rate per Kilometer (KES) *</Label>
              <RateInput>
                <Input
                  type="number"
                  value={ratePerKm}
                  onChange={(e) => setRatePerKm(parseFloat(e.target.value) || 0)}
                  min="1"
                  step="1"
                  required
                />
                <span>/km</span>
              </RateInput>
            </FormGroup>

            <FormGroup style={{ position: 'relative' }}>
              <Label>Destination *</Label>
              <Input
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  searchLocation(e.target.value);
                }}
                placeholder="Search destination"
                required
              />
              {searchResults.length > 0 && (
                <SearchResults>
                  {searchResults.map((result, idx) => (
                    <SearchResultItem key={idx} onClick={() => handleDestinationSelect(result)}>
                      {result.address.freeformAddress}
                    </SearchResultItem>
                  ))}
                </SearchResults>
              )}
            </FormGroup>

            <FormGroup>
              <Label>Final Price (Optional)</Label>
              <Input
                type="number"
                value={negotiatedPrice}
                onChange={(e) => setNegotiatedPrice(e.target.value)}
                placeholder="Enter agreed price"
              />
              <small
                style={{ color: Colors.textSecondary, marginTop: '0.25rem', display: 'block' }}
              >
                This will override the calculated estimate
              </small>
            </FormGroup>
          </div>

          {/* Right Column */}
          <div>
            <MapContainer>
              <iframe src={getMapUrl()} title="Route Map" loading="lazy" />
            </MapContainer>

            {distance && (
              <SummaryBox>
                <p>
                  <span>📍 One way:</span> <strong>{distance} km</strong>
                </p>
                <p>
                  <span>🔄 Round trip:</span> <strong>{(distance * 2).toFixed(1)} km</strong>
                </p>
                <p>
                  <span>⏱️ Travel time:</span> <strong>{travelTime}</strong>
                </p>
                <p>
                  <span>💰 Transport ({ratePerKm}/km):</span> <strong>KES {transportCost}</strong>
                </p>
                {fuelCost && (
                  <>
                    <p>
                      <span>⛽ Fuel:</span>{' '}
                      <strong>
                        {fuelEstimate}L (KES {fuelCost})
                      </strong>
                    </p>
                    <p
                      style={{
                        borderTop: `1px solid ${Colors.borderColor}`,
                        marginTop: '0.5rem',
                        paddingTop: '0.5rem',
                        fontWeight: 'bold',
                      }}
                    >
                      <span>💰 Total estimate:</span>
                      <strong style={{ color: Colors.successGreen }}>KES {totalCost}</strong>
                    </p>
                  </>
                )}
              </SummaryBox>
            )}

            <StyledButton
              onClick={handleSubmit}
              disabled={
                isLoading || !destinationLat || !vehiclePlate || !dispatchDate || !ratePerKm
              }
              style={{ width: '100%', marginTop: '1rem' }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={16} /> {editingId ? 'Update' : 'Save'} Trip
                </>
              )}
            </StyledButton>
          </div>
        </ModalContent>
      </ModalOverlay>
    </DispatchContainer>
  );
};

export default DispatchSection;
