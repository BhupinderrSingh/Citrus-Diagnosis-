import React from 'react';
import CitriScanDashboard from './CitriScanDashboard'; 

export default function App() {
  // Eventually, this is where you will check if a user is authenticated via Firebase
  // or if their Web3 wallet is connected. 
  
  // For today, we just route them straight to the main AI diagnostic engine.
  return (
    <CitriScanDashboard />
  );
}