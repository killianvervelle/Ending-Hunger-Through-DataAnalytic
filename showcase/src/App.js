import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import PageOne from './pages/Page1';


import Navbar from './components/Navbar';
import Country from './pages/Country';

function App() {
  return (
    <div className="app-container">
      <main className="page-content">
      <Router>
      <Navbar />
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/country/:id" exact element={<Country />} />
          <Route path="/firstpage" exact element={<PageOne />} />
        </Routes>
      </Router>
      </main>
    </div>
  );
}
export default App;