import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import PageOne from './pages/Page1';
import PageTwo from './pages/Page2';

import Navbar from './components/Navbar';

function App() {
  return (
    <div className="app-container">
      <main className="page-content">
      <Router>
      <Navbar />
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/firstpage" exact element={<PageOne />} />
          <Route path="/secondpage" exact element={<PageTwo />} />
        </Routes>
      </Router>
      </main>
    </div>
  );
}

export default App;
