import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TodayWeather from './pages/weather/TodayWeather';
import Login from './pages/auth/Login';
import LookToday from './pages/looktoday/LookToday';
import Main from './pages/main/Main';
import SignUp from './pages/auth/SignUp';
import SignUpComplete from './pages/auth/SignUpComplete';

import LookRecommend from './pages/weather/LookRecommend';

import MyHeart from './pages/mypage/MyHeart';
import MyFeed from './pages/mypage/MyFeed';
import LookBook from './pages/lookbook/LookBook';


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

          <Route path="/myheart" element={<MyHeart />} />
          <Route path="/myfeed" element={<MyFeed />} />
          <Route path="/lookbook" element={<LookBook />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
