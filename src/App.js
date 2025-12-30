// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CategoriesPage from './pages/CategoriesPage';
import ProductsPage from './pages/ProductsPage';
import SummaryPage from './pages/SummaryPage';
import AddCategoryPage from './pages/AddCategoryPage';
import AddProductPage from './pages/AddProductPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/categories" replace />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/products/:categoryId" element={<ProductsPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/add-category" element={<AddCategoryPage />} />
          <Route path="/add-product" element={<AddProductPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;