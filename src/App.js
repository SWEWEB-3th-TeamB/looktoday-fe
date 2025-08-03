import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TodayWeather from './pages/weather/TodayWeather';
import Login from './pages/auth/Login';
import LookToday from './pages/looktoday/LookToday';
import Main from './pages/main/Main';
import SignUp from './pages/auth/SignUp';
import SignUpComplete from './pages/auth/SignUpComplete';
<<<<<<< HEAD
import MyHeart from './pages/mypage/MyHeart';
=======
import LookBook from './pages/lookbook/LookBook';
>>>>>>> f4206cdd2159603488af5bcd09c7e4a5eaa0ca8e

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/looktoday" element={<LookToday />} />
          <Route path="/TodayWeather" element={<TodayWeather />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-up-complete" element={<SignUpComplete />} />
<<<<<<< HEAD
          <Route path="/myheart" element={<MyHeart />} />
=======
          <Route path="/lookbook" element={<LookBook />} />
>>>>>>> f4206cdd2159603488af5bcd09c7e4a5eaa0ca8e
        </Routes>
      </div>
    </Router>
  );
}

export default App;
