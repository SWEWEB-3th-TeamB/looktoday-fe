import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TodayWeather from './pages/weather/TodayWeather';
import Login from './pages/auth/Login';
import LookToday from './pages/looktoday/LookToday';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/looktoday" element={<LookToday />} />
          <Route path="/TodayWeather" element={<TodayWeather />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
