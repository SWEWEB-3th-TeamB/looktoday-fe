import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import '../styles/Calendar.css';

import calendarEmpty from '../assets/images/calendar-empty.png';
import calendarSelected from '../assets/images/calendar-selected.png';
import arrowUp from '../assets/images/arrow-up.png';
import calArrowUp from '../assets/images/calendar-arrow-up.png';
import calArrowDown from '../assets/images/calendar-arrow-down.png';
import calArrowUpGray from '../assets/images/calendar-arrow-up-gray.png';
import calArrowDownGray from '../assets/images/calendar-arrow-down-gray.png';

const WEEKS = ['일', '월', '화', '수', '목', '금', '토'];

// 날짜 포맷 헬퍼 (YYYY-MM-DD)
const formatDate = (y, m, d) => {
	return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const getTodayObj = () => {
	const today = new Date();
	return { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
};

function CalendarModal({ children }) {
	return createPortal(children, document.body);
}

const Calendar = ({ value, onChange }) => {
	const todayObj = getTodayObj();
	const minYear = getTodayObj().year - 4;
	const maxYear = getTodayObj().year;

	const calRef = useRef(null);
	const btnRef = useRef(null);

	const [open, setOpen] = useState(false);
	const [step, setStep] = useState('yearMonth'); // yearMonth | day
	const [modalPos, setModalPos] = useState({ top: 0, left: 0 });

	// 날짜 상태
	const [selectedYear, setSelectedYear] = useState(todayObj.year);
	const [selectedMonth, setSelectedMonth] = useState(todayObj.month);
	const [selectedDay, setSelectedDay] = useState(todayObj.day);

	// value prop 동기화
	useEffect(() => {
		if (value) {
			const [yy, mm, dd] = value.split('-').map(Number);
			setSelectedYear(yy);
			setSelectedMonth(mm);
			setSelectedDay(dd);
		}
	}, [value]);

	// 모달 외부 클릭 감지
	useEffect(() => {
		if (!open) return;

		const handleClickOutside = (e) => {
			if (calRef.current && !calRef.current.contains(e.target)) {
				setOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [open]);

	// 핸들러: 연도 선택
	const handleYearClick = (year) => {
		setSelectedYear(year);
		// 현재 연도면 오늘 월/일, 아니면 1월 1일로 초기화
		const isCurrent = todayObj.year === year;
		setSelectedMonth(isCurrent ? todayObj.month : 1);
		setSelectedDay(isCurrent ? todayObj.day : 1);
		setStep('yearMonth');
	};

	// 핸들러: 월 선택
	const handleMonthClick = (month) => {
		setSelectedMonth(month);
		setStep('day');
	};

	// 핸들러: 일 선택
	const handleDayClick = (day) => {
		const newValue = formatDate(selectedYear, selectedMonth, day);
		setSelectedDay(day);
		onChange?.(newValue);
		setOpen(false);
		setStep('yearMonth');
	};

	// 핸들러: 월 이동
	const monthMove = (dir) => {
		let nextY = selectedYear;
		let nextM = selectedMonth + dir;

		if (nextM < 1) {
			nextY--;
			nextM = 12;
		} else if (nextM > 12) {
			nextY++;
			nextM = 1;
		}

		// 범위 체크
		if (nextY < minYear || nextY > maxYear) return;

		setSelectedYear(nextY);
		setSelectedMonth(nextM);
	};

	// 핸들러: 유틸리티 (오늘/삭제/토글)
	const handleToday = () => {
		onChange?.(formatDate(todayObj.year, todayObj.month, todayObj.day));
		setOpen(false);
		setStep('yearMonth');
	};

	const handleDelete = () => {
		onChange?.('');
		setOpen(false);
		setStep('yearMonth');
	};

	const handleToggle = () => {
		if (!open && btnRef.current) {
			const rect = btnRef.current.getBoundingClientRect();
			setModalPos({
				top: rect.bottom + window.scrollY + 10,
				left: rect.left + window.scrollX + rect.width / 2,
			});
		}
		setOpen(!open);
	};

	// 캘린더 그리드 데이터 생성
	const getCalGrid = () => {
		const prevLast = new Date(selectedYear, selectedMonth - 1, 0);
		const thisLast = new Date(selectedYear, selectedMonth, 0);

		const days = [];
		const startDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();

		// 이전 달
		for (let i = startDay - 1; i >= 0; i--) {
			days.push({ day: prevLast.getDate() - i, isOther: true });
		}
		// 이번 달
		for (let i = 1; i <= thisLast.getDate(); i++) {
			days.push({ day: i, isOther: false });
		}
		let nextDay = 1;
		// 다음 달 (42칸 채우기)
		while (days.length % 7 !== 0 || days.length < 42) {
			days.push({ day: nextDay++, isOther: true });
		}
		return days;
	};

	return (
		<div style={{ display: 'inline-block' }}>
			<div
				ref={btnRef}
				className={`calendar-btn ${!value ? 'empty' : 'selected'}`}
				onClick={handleToggle}
			>
				<span className="calendar-btn-date">{value || '날짜 선택'}</span>
				<img src={!value ? calendarEmpty : calendarSelected} alt="calendar" />
			</div>

			{open && (
				<CalendarModal>
					<div
						className="calendar-modal"
						ref={calRef}
						style={{ top: modalPos.top, left: modalPos.left, position: 'absolute', zIndex: 9999 }}
					>
						{step === 'yearMonth' ? (
							<>
								<div className="calendar-ym-selected-box">
									<span>{selectedYear}년 {selectedMonth}월</span>
									<img src={arrowUp} alt="" style={{ marginLeft: 5 }} />
								</div>
								<div className="calendar-yearlist">
									{Array.from({ length: 5 }).map((_, i) => {
										const year = maxYear - i;
										const isActive = year === selectedYear;
										return (
											<div
												key={year}
												className={`calendar-year-item${isActive ? ' active' : ''}`}
												onClick={() => handleYearClick(year)}
											>
												<div className="calendar-year-label">{year}</div>
												{isActive && (
													<div className="calendar-month-boxes">
														{Array.from({ length: 12 }).map((_, m) => {
															const month = m + 1;
															return (
																<div
																	key={month}
																	className={`calendar-month-item${month === selectedMonth ? ' active' : ''}`}
																	onClick={(e) => { e.stopPropagation(); handleMonthClick(month); }}
																>
																	{month}
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
						) : (
							<>
								<div className="calendar-day-header">
									<div className="calendar-day-yearmonth-box" onClick={() => setStep('yearMonth')}>
										<span>{selectedYear}년 {selectedMonth}월</span>
										<img src={arrowUp} alt="" style={{ marginLeft: 5 }} />
									</div>
									<div className="calendar-arrow-wrapper">
										<img
											src={selectedYear === minYear && selectedMonth === 1 ? calArrowUpGray : calArrowUp}
											className="calendar-arrow"
											onClick={() => (selectedYear !== minYear || selectedMonth !== 1) && monthMove(-1)}
											alt="prev"
										/>
										<img
											src={selectedYear === maxYear && selectedMonth === 12 ? calArrowDownGray : calArrowDown}
											className="calendar-arrow"
											onClick={() => (selectedYear !== maxYear || selectedMonth !== 12) && monthMove(1)}
											alt="next"
										/>
									</div>
								</div>

								<div className="calendar-day-weekdays">
									{WEEKS.map((w) => <div key={w} className="calendar-day-weekday">{w}</div>)}
								</div>

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

								<div className="calendar-footer">
									<span className="calendar-footer-del" onClick={handleDelete}>삭제</span>
									<span className="calendar-footer-today" onClick={handleToday}>오늘</span>
								</div>
							</>
						)}
					</div>
				</CalendarModal>
			)}
		</div>
	);
};

export default Calendar;