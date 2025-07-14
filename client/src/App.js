import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DebtorList from './pages/DebtorList';
import AddDebtor from './pages/AddDebtor';
import DebtorDetail from './pages/DebtorDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto px-4 py-4 sm:py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/debtors" element={<DebtorList />} />
            <Route path="/add-debtor" element={<AddDebtor />} />
            <Route path="/debtors/:id" element={<DebtorDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 