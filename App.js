import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import { LoadScript, GoogleMap } from '@react-google-maps/api';
import Autocomplete from 'react-google-autocomplete';
import stateData from './states.json';

const containerStyle = {
  width: '400px',
  height: '400px',
};

// Center coordinates for different states including Virginia
const stateCoordinates = {
  "New York": { lat: 40.730610, lng: -73.935242 },
  "California": { lat: 34.052235, lng: -118.243683 },
  "Texas": { lat: 31.968599, lng: -99.901810 },
  "Florida": { lat: 27.994402, lng: -81.760254 },
  "Illinois": { lat: 40.633125, lng: -89.398529 },
  "Virginia": { lat: 37.431573, lng: -78.656894 } // Virginia coordinates (approximate center)
};

const libraries = ['places', 'marker'];

const AddressAutocomplete = ({ apiKey, onPlaceSelected }) => {
  return (
    <Autocomplete
      apiKey={apiKey}
      onPlaceSelected={onPlaceSelected}
      style={{ width: '400px', height: '40px' }}
      placeholder="Search for a location"
      options={{
        types: ['address'],
        componentRestrictions: { country: "us" },
      }}
    />
  );
};

function App() {
  const [selectedState, setSelectedState] = useState(""); 
  const [address, setAddress] = useState(''); 
  const [mapCenter, setMapCenter] = useState(null); 
  const [showMap, setShowMap] = useState(false); 
  const [addressSelected, setAddressSelected] = useState(false); // New state to track if an address is selected
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const handleStateChange = (event) => {
    setSelectedState(event.target.value);
    setAddress(''); 
    setMapCenter(null); 
    setShowMap(false); 
    setAddressSelected(false); // Reset address selection
  };

  const handlePlaceSelected = (place) => {
    const selectedAddress = place.formatted_address;
    setAddress(selectedAddress);
    
    const location = place.geometry.location;
    const lat = location.lat();
    const lng = location.lng();
    
    console.log(`Selected Address: ${selectedAddress}, Latitude: ${lat}, Longitude: ${lng}`); // Debugging log

    setMapCenter({ lat, lng });
    setShowMap(true);
    setAddressSelected(true); // Mark that an address has been selected
  };

  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      // Clear previous marker if it exists
      markerRef.current.setMap(null);
    }

    const position = mapCenter || stateCoordinates[selectedState];

    if (position) {
      console.log(`Setting marker at: ${position.lat}, ${position.lng}`); // Log the position
      try {
        if (window.google && window.google.maps) {
          const AdvancedMarkerElement = window.google.maps.marker.AdvancedMarkerElement;

          // Log whether the map reference is available
          console.log('Map reference:', mapRef.current);

          // Check if AdvancedMarkerElement is available
          if (AdvancedMarkerElement) {
            const marker = new AdvancedMarkerElement({
              position: position,
              map: mapRef.current,
              title: address || `${selectedState} Center`,
            });

            markerRef.current = marker; // Store the marker reference
            markerRef.current.setMap(mapRef.current); // Explicitly set the map to the marker
          } else {
            console.log("Using default Marker for testing.");
            const marker = new window.google.maps.Marker({
              position: position,
              map: mapRef.current,
              title: address || `${selectedState} Center`,
            });

            markerRef.current = marker; // Store the marker reference
            markerRef.current.setMap(mapRef.current); // Explicitly set the map to the marker
            console.error("AdvancedMarkerElement is not available. Used default Marker.");
          }
        } else {
          console.error("Google Maps API is not loaded properly."); // Log if not loaded
        }
      } catch (error) {
        console.error("Error creating marker:", error); // Log any errors
      }
    }
  }, [mapCenter, selectedState, address]); // Run effect when mapCenter, selectedState, or address changes

  return (
    <div className="App">
      <header className="App-header">
        {addressSelected ? (
          <>
<h2>Contests</h2>

{[
  {
    position: "President and Vice President",
    candidates: [
      "Kamala D. Harris and Tim Walz (Democratic)",
      "Donald J. Trump and J.D. Vance (Republican)",
      "Jill E. Stein and Butch Ware III (Green)",
      "Chase R. Oliver and Mike ter Maat (Libertarian)",
      "Claudia De la Cruz and Karina Garcia (Independent)",
      "Cornel R. West and Melina Abdullah (Independent)"
    ],
    district: "United States Of America (statewide)",
    numberElected: 1,
    numberVotingFor: 1,
  },
  {
    position: "Member, United States Senate",
    candidates: [
      "Timothy M. Kaine (Democratic)",
      "Hung Cao (Republican)"
    ],
    district: "United States Of America (statewide)",
    numberElected: 1,
    numberVotingFor: 1,
    financeInfo: "Hung Cao (HUNG CAO FOR VIRGINIA) - donations from various donors totaling over $3,000"
  },
  {
    position: "Member, House of Representatives (10th District)",
    candidates: [
      "Suhas Subramanyam (Democratic)",
      "Mike W. Clancy (Republican)"
    ],
    district: "10 (congressional)",
    numberElected: 1,
    numberVotingFor: 1,
    financeInfo: "Suhas Subramanyam (SUHAS FOR VIRGINIA) - significant donations totaling over $10,000"
  },
  // Add other contest data here
].map((contest, index) => (
  <div key={index} className="contest">
    <h3>{contest.position}</h3>
    <p><strong>Candidates:</strong></p>
    <ul>
      {contest.candidates.map((candidate, idx) => (
        <li key={idx}>{candidate}</li>
      ))}
    </ul>
    <p><strong>District:</strong> {contest.district}</p>
    <p><strong>Number Elected:</strong> {contest.numberElected}</p>
    <p><strong>Number Voting For:</strong> {contest.numberVotingFor}</p>
    {contest.financeInfo && <p><strong>Finance Info:</strong> {contest.financeInfo}</p>}
  </div>
))}

<h2>State Competitiveness Status: Strong Tossup, Value: -3</h2>
          </>
        ) : (
          <>
            <img className="avatar" src={user.imageUrl} alt="User Avatar" />
            <p>Welcome to MyElection.</p>
            <p>Enter Your State</p>

            <select value={selectedState} onChange={handleStateChange}>
              <option value="">Select your state</option>
              <option value="New York">New York</option>
              <option value="California">California</option>
              <option value="Texas">Texas</option>
              <option value="Florida">Florida</option>
              <option value="Illinois">Illinois</option>
              <option value="Virginia">Virginia</option>
            </select>

            {/* Address Autocomplete */}
            <AddressAutocomplete
              apiKey="AIzaSyBBpKGqPVEdjFtMBOLXNrtv3kc2W8WfRq0"
              onPlaceSelected={handlePlaceSelected}
            />
            <div>
              <h1>Selected Address: {address}</h1>
            </div>

            {/* Load the map after selecting a state */}
            <LoadScript
              googleMapsApiKey="AIzaSyBBpKGqPVEdjFtMBOLXNrtv3kc2W8WfRq0"
              libraries={libraries}
            >
              {showMap && (
                <GoogleMap
                  onLoad={(map) => { 
                    mapRef.current = map; 
                    console.log("Map loaded:", map); // Log when the map is loaded
                  }} 
                  mapContainerStyle={containerStyle}
                  center={mapCenter || stateCoordinates[selectedState]}
                  zoom={10}
                />
              )}
            </LoadScript>
          </>
        )}
      </header>
    </div>
  );
}

function MyButton() {
  return (
    <button>
      Go
    </button>
  );
}

const user = {
  name: 'Kamala Harris',
  imageUrl: 'https://t3.ftcdn.net/jpg/05/65/51/76/360_F_565517615_Z40oYN7Kf8pBucn2K7IEoScX5Hs9PuZM.png',
  imageSize: 240,
};

export default App;
