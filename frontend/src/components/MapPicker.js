import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

// Search component to add to the map
const LeafletSearch = ({ onLocationSelect }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: true,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      keepResult: true,
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (result) => {
      const { x, y, label } = result.location;
      onLocationSelect({ latitude: y, longitude: x, address: label });
    });

    return () => map.removeControl(searchControl);
  }, [map, onLocationSelect]);

  return null;
};

export default function MapPicker({ onLocationSelect, label }) {
  const [position, setPosition] = useState([28.6139, 77.2090]); // Default to Delhi

  const handleLocationSelect = (loc) => {
    setPosition([loc.latitude, loc.longitude]);
    onLocationSelect(loc);
  };

  return (
    <div className="map-picker">
      <h4>{label}</h4>
      <MapContainer center={position} zoom={13} style={{ height: '300px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} />
        <LeafletSearch onLocationSelect={handleLocationSelect} />
      </MapContainer>
    </div>
  );
}