import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import '../styles/main.css';

// Component to handle map recentering
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
};

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }) => {
  const selectLocation = async (lat, lng) => {
    console.log(`[MapPicker] Map clicked at coordinates: lat=${lat}, lng=${lng}`);
    
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      console.log('[MapPicker] Reverse geocoding request:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[MapPicker] Reverse geocoding response:', data);
      
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      const location = { latitude: lat, longitude: lng, address };
      
      console.log('[MapPicker] Map click location resolved:', location);
      onLocationSelect(location);
    } catch (error) {
      console.error('[MapPicker] Reverse geocoding failed for map click:', {
        coordinates: { lat, lng },
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      const fallbackLocation = { 
        latitude: lat, 
        longitude: lng, 
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` 
      };
      console.log('[MapPicker] Using coordinates as fallback for map click');
      onLocationSelect(fallbackLocation);
    }
  };

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      selectLocation(lat, lng);
    }
  });
  return null;
};

export default function MapPicker({ onLocationSelect, label, autoGetUserLocation = false }) {
  const [position, setPosition] = useState([28.6139, 77.2090]); // Default to Delhi
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Get user's current location on component mount only if enabled and not already selected
    if (autoGetUserLocation && !selectedLocation) {
      getUserLocation();
    }
  }, [autoGetUserLocation]);

  const getUserLocation = () => {
    console.log('[MapPicker] Attempting to get user location');
    
    if (!navigator.geolocation) {
      console.error('[MapPicker] Geolocation not supported by browser');
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    console.log('[MapPicker] Geolocation request started');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`[MapPicker] Location obtained: lat=${latitude}, lng=${longitude}, accuracy=${accuracy}m`);
        
        setPosition([latitude, longitude]);
        
        try {
          console.log('[MapPicker] Starting reverse geocoding');
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('[MapPicker] Reverse geocoding successful:', data);
          
          const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          const currentLocation = { latitude, longitude, address };
          
          setSelectedLocation(currentLocation);
          setSearchQuery(address);
          setShowSuggestions(false); // Close suggestions
          onLocationSelect(currentLocation);
          console.log('[MapPicker] User location set successfully:', address);
        } catch (error) {
          console.error('[MapPicker] Reverse geocoding failed:', error.message);
          const fallbackLocation = { 
            latitude, 
            longitude, 
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
          };
          setSelectedLocation(fallbackLocation);
          setSearchQuery(fallbackLocation.address);
          setShowSuggestions(false); // Close suggestions
          onLocationSelect(fallbackLocation);
          console.log('[MapPicker] Using coordinates as fallback address');
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('[MapPicker] Geolocation error:', {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString()
        });
        
        let errorMessage = 'Failed to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Unknown error occurred.';
        }
        
        alert(errorMessage);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleLocationSelect = (loc) => {
    console.log('[MapPicker] Location selected:', loc);
    const newPosition = [loc.latitude, loc.longitude];
    setPosition(newPosition);
    setSelectedLocation(loc);
    setSearchQuery(loc.address);
    setShowSuggestions(false); // Close suggestions dropdown
    onLocationSelect(loc);
    console.log('[MapPicker] Location selection completed');
  };

  const clearLocation = () => {
    console.log('[MapPicker] Clearing selected location');
    setSelectedLocation(null);
    setSearchQuery('');
    setShowSuggestions(false);
    onLocationSelect(null);
    console.log('[MapPicker] Location cleared successfully');
  };

  const handleSearchSubmit = async () => {
    const query = searchQuery.trim();
    if (!query) {
      console.warn('[MapPicker] Search attempted with empty query');
      return;
    }

    console.log(`[MapPicker] Starting search for: "${query}"`);
    setIsSearching(true);
    setShowSuggestions(false); // Close suggestions during search
    
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`;
      console.log('[MapPicker] Geocoding request URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[MapPicker] Geocoding response:', data);
      
      if (data && data.length > 0) {
        const result = data[0];
        const location = {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          address: result.display_name
        };
        console.log('[MapPicker] Search successful, location found:', location);
        handleLocationSelect(location);
      } else {
        console.warn('[MapPicker] No results found for search query:', query);
        alert(`No location found for "${query}". Please try a different search term.`);
      }
    } catch (error) {
      console.error('[MapPicker] Search failed:', {
        query,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      alert('Search failed. Please check your internet connection and try again.');
    } finally {
      setIsSearching(false);
      console.log('[MapPicker] Search operation completed');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.trim().length > 0 && !selectedLocation);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim().length > 0 && !selectedLocation) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionClick = () => {
    setShowSuggestions(false);
    handleSearchSubmit();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%'
    }}>
      {/* Search Input */}
      <div style={{
        position: 'relative',
        marginBottom: '15px'
      }}>
        <div>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            {/* Search/Location Icon */}
            <div style={{
              position: 'absolute',
              left: '16px',
              zIndex: 2,
              color: '#667eea',
              fontSize: '18px'
            }}>
              {isGettingLocation ? '📍' : '🔍'}
            </div>
            
            {/* Search Input */}
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)';
                handleInputFocus(e);
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                handleInputBlur(e);
              }}
              onKeyPress={handleKeyPress}
              placeholder={isGettingLocation ? "Getting your location..." : "Search for a location..."}
              disabled={isGettingLocation}
              style={{
                width: '100%',
                padding: '18px 20px 18px 50px',
                border: '2px solid #e2e8f0',
                borderRadius: '15px',
                fontSize: '16px',
                backgroundColor: 'white',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
            />
            
            {/* Action Buttons */}
            <div style={{ position: 'absolute', right: '8px', display: 'flex', gap: '8px' }}>
              {/* My Location Button */}
              <button
                type="button"
                onClick={getUserLocation}
                disabled={isGettingLocation}
                style={{
                  padding: '12px',
                  background: 'linear-gradient(135deg, #38a169 0%, #48bb78 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  cursor: isGettingLocation ? 'not-allowed' : 'pointer',
                  opacity: isGettingLocation ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(56, 161, 105, 0.3)'
                }}
                title="Get my location"
              >
                📍
              </button>
              
              {/* Search/Clear Button */}
              {selectedLocation ? (
                <button
                  type="button"
                  onClick={clearLocation}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(229, 62, 62, 0.3)'
                  }}
                >
                  Clear
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  disabled={isSearching || !searchQuery.trim() || isGettingLocation}
                  style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: (isSearching || !searchQuery.trim() || isGettingLocation) ? 'not-allowed' : 'pointer',
                    opacity: (isSearching || !searchQuery.trim() || isGettingLocation) ? 0.6 : 1,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Search Suggestions */}
        {showSuggestions && searchQuery && !selectedLocation && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            marginTop: '8px',
            zIndex: 10,
            maxHeight: '200px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f1f5f9',
              backgroundColor: '#f8fafc'
            }}>
              <span style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '500'
              }}>
                💡 Click to search for this location
              </span>
            </div>
            <div style={{
              padding: '8px 0'
            }}>
              <div 
                role="button"
                tabIndex={0}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                onClick={handleSuggestionClick}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSuggestionClick();
                  }
                }}
                aria-label={`Select location: ${searchQuery}`}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: 'white'
                }}>
                  📍
                </div>
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#1e293b'
                  }}>
                    {searchQuery}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#64748b'
                  }}>
                    Click to select this location
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div style={{
        position: 'relative',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        border: '2px solid #e2e8f0'
      }}>
        <MapContainer 
          center={position} 
          zoom={13} 
          style={{ 
            height: '250px', 
            width: '100%',
            borderRadius: '15px'
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={position} />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          <MapRecenter center={position} />
        </MapContainer>
        
        {/* Map Overlay Info */}
        <div style={{
          position: 'absolute',
          bottom: '15px',
          left: '15px',
          right: '15px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px 16px',
          borderRadius: '10px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <span>🗺️</span>
            <span>Search above or click on the map to select a location</span>
          </div>
        </div>
      </div>
    </div>
  );
}