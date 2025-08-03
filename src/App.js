import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TodayWeather from './pages/weather/TodayWeather';
import Login from './pages/auth/Login';
import LookToday from './pages/looktoday/LookToday';
import Main from './pages/main/Main';
import SignUp from './pages/auth/SignUp';
import SignUpComplete from './pages/auth/SignUpComplete';
import LookRecommend from './pages/weather/LookRecommend';
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/looktoday" element={<LookToday />} />
          <Route path="/todayWeather" element={<TodayWeather />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-up-complete" element={<SignUpComplete />} />
          <Route path="/lookrecommend" element={<LookRecommend />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
