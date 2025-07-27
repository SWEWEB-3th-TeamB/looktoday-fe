import React, { useState, useRef, useEffect } from 'react';
import '../styles/Calendar.css';
import calendarIcon from '../assets/images/calendar.png';
import arrowUp from '../assets/images/arrow-up.png';
import calArrowUp from '../assets/images/calendar-arrow-up.png';
import calArrowDown from '../assets/images/calendar-arrow-down.png';
import calArrowUpGray from '../assets/images/calendar-arrow-up-gray.png';
import calArrowDownGray from '../assets/images/calendar-arrow-down-gray.png';

const getTodayObj = () => {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
};

const Calendar = () => {
  const minYear = getTodayObj().year - 4;
  const maxYear = getTodayObj().year;
  const todayObj = getTodayObj();
  // 날짜 상태
  const [value, setValue] = useState(`${todayObj.year}-${String(todayObj.month).padStart(2, '0')}-${String(todayObj.day).padStart(2, '0')}`);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('yearMonth'); // 'yearMonth' 또는 'day'
  const [selectedYear, setSelectedYear] = useState(todayObj.year);
  const [selectedMonth, setSelectedMonth] = useState(todayObj.month);
  const [selectedDay, setSelectedDay] = useState(todayObj.day);
  const calRef = useRef(null);

  // 창 밖 클릭 시 닫힘 로직
  useEffect(() => {
    function handleClickOutside(e) {
      if (calRef.current && !calRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // 날짜 선택 로직
  const handleYearClick = (year) => {
    setSelectedYear(year);
    setSelectedMonth(todayObj.year === year ? todayObj.month : 1);
    setStep('yearMonth');
  };

  const handleMonthClick = (month) => {
    setSelectedMonth(month);
    setStep('day');
  };

  const handleDayClick = (day, isDisabled = false) => {
    if (isDisabled) return;
    setSelectedDay(day);
    const newValue = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setValue(newValue);
    setOpen(false);
    setStep('yearMonth');
  };

  // 화살표 월 전후 이동
  const monthMove = (dir) => {
    let y = selectedYear;
    let m = selectedMonth;
    if (dir === -1) {
      m--;
      if (m < 1) {
        if (y > minYear) {
          y--;
          m = 12;
        }
      }
    } else {
      m++;
      if (m > 12) {
        if (y < maxYear) {
          y++;
          m = 1;
        }
      }
    }
    setSelectedYear(y);
    setSelectedMonth(m);
  };

  // 오늘, 삭제 버튼
  const handleToday = () => {
    setValue(`${todayObj.year}-${String(todayObj.month).padStart(2, '0')}-${String(todayObj.day).padStart(2, '0')}`);
    setSelectedYear(todayObj.year);
    setSelectedMonth(todayObj.month);
    setSelectedDay(todayObj.day);
    setOpen(false);
    setStep('yearMonth');
  };
  const handleDelete = () => {
    setValue('');
    setSelectedYear(todayObj.year);
    setSelectedMonth(todayObj.month);
    setStep('yearMonth');
  };

  // 달력 날짜 그리기 함수
  const getCalGrid = () => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const prevLastDay = new Date(selectedYear, selectedMonth - 1, 0);
    const startDOW = firstDay.getDay();
    let days = [];
    // 이전 달
    for (let i = startDOW - 1; i >= 0; i--) {
      days.push({ day: prevLastDay.getDate() - i, isOther: true });
    }
    // 이번 달
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ day: i, isOther: false });
    }
    // 다음 달
    for (let i = 1; days.length % 7 !== 0 || days.length < 42; i++) {
      days.push({ day: i, isOther: true });
    }
    return days;
  };

  // 렌더링
  return (
    <div>
      {/* 달력 버튼 */}
      <div
        className="calendar-btn"
        onClick={() => setOpen(!open)}
      >
        <span className="calendar-btn-date">{value || '날짜 선택'}</span>
        <img src={calendarIcon} alt="calendar" />
      </div>
      {open && (
        <div className="calendar-modal" ref={calRef}>
          {step === 'yearMonth' && (
            <>
              <div className="calendar-ym-selected-box">
                <span className="calendar-ym-selected-txt">{selectedYear}년 {selectedMonth}월</span>
                <img src={arrowUp} alt="" style={{ marginLeft: 5 }} />
              </div>
              <div className="calendar-yearlist">
                {[...Array(5)].map((_, idx) => {
                    const y = maxYear - idx;
                    const isActive = y === selectedYear;
                    return (
                        <div
                            className={`calendar-year-item${isActive ? ' active' : ''}`}
                            key={y}
                            onClick={() => handleYearClick(y)}
                        >
                            <div className="calendar-year-label">{y}</div>
                            {isActive && (
                                <div className="calendar-month-boxes">
                                    {[...Array(12)].map((_, mon) => {
                                        const isActiveMonth = mon + 1 === selectedMonth;
                                        return (
                                            <div
                                                key={mon + 1}
                                                className={`calendar-month-item${isActiveMonth ? ' active' : ''}`}
                                                onClick={e => { e.stopPropagation(); handleMonthClick(mon + 1); }}
                                            >
                                                {mon + 1}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
                
              </div>
            </>
          )}
          {step === 'day' && (
            <>
              <div className="calendar-day-header" style={{ position: 'relative' }}>
                <div
                  className="calendar-day-yearmonth-box"
                  onClick={() => setStep('yearMonth')}
                >
                  <span>{selectedYear}년 {selectedMonth}월</span>
                  <img src={arrowUp} alt="" style={{ marginLeft: 5, width: 11.405, height: 11.405 }} />
                </div>

                {/* 화살표를 감싸는 래퍼 추가 */}
                <div className="calendar-arrow-wrapper">
                    <img
                    src={selectedYear === minYear && selectedMonth === 1 ? calArrowUpGray : calArrowUp}
                    alt="prev"
                    className="calendar-arrow"
                    onClick={() => selectedYear !== minYear || selectedMonth !== 1 ? monthMove(-1) : undefined}
                    style={{
                        pointerEvents: selectedYear === minYear && selectedMonth === 1 ? 'none' : 'auto'
                    }}
                    />
                    <img
                    src={selectedYear === maxYear && selectedMonth === 12 ? calArrowDownGray : calArrowDown}
                    alt="next"
                    className="calendar-arrow"
                    onClick={() => selectedYear !== maxYear || selectedMonth !== 12 ? monthMove(1) : undefined}
                    style={{
                        pointerEvents: selectedYear === maxYear && selectedMonth === 12 ? 'none' : 'auto'
                    }}
                    />
                  </div>
              </div>
              {/* 요일 */}
              <div className="calendar-day-weekdays">
                {['일', '월', '화', '수', '목', '금', '토'].map((w, i) => (
                  <div className="calendar-day-weekday" key={i}>{w}</div>
                ))}
              </div>
              {/* 일박스 */}
              <div className="calendar-day-grid">
                {getCalGrid().map((d, idx) => (
                  <div
                    key={idx}
                    className={`calendar-day-cell${d.isOther ? ' other' : ''}${!d.isOther && d.day === selectedDay ? ' active' : ''}`}
                    onClick={() => !d.isOther && handleDayClick(d.day)}
                  >
                    {d.day}
                  </div>
                ))}
              </div>
              {/* 삭제/오늘 */}
              <div className="calendar-footer">
                <span className="calendar-footer-del" onClick={handleDelete}>삭제</span>
                <span className="calendar-footer-today" onClick={handleToday}>오늘</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;
