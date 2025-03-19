import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import styles from "../Style/MealCalender.module.css"
import config from "../config";
// import { FaCalendarAlt } from "react-icons/fa";

const MealCalendar = ({ mealData = [] }) => { // ✅ mealData 기본값을 빈 배열로 설정
  const navigate = useNavigate();
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3);
  const [selectedDate, setSelectedDate] = useState(null);
  const [mealRecords, setMealRecords] = useState({}); // ✅ 정리된 데이터 저장

  // 📌 월의 시작 요일을 월요일(0)부터 시작하도록 조정
  const rawStartDay = new Date(year, month - 1, 1).getDay();
  const startDay = (rawStartDay === 0 ? 6 : rawStartDay - 1); // 0(일요일) → 6, 그 외는 -1 적용

  
  const navigateMain = () => {navigate("/main");};

  const navigateToRecordBody = () => {navigate("/recordbody");};

  const navigateFood = () => {
    if (selectedDate) {
      // 선택한 날짜의 full date 생성
      const fullDate = new Date(year, month - 1, selectedDate);
      navigate("/MealTimingselect", { state: { selectedDate: fullDate } });
    } else {
      alert("날짜를 선택하세요!");
    }
  };
  

  const navigateGraph = () => {navigate("/Graph")};

  const thisPage = () => {navigate("/Calender")};

  const handleLogout = async () => {
    await fetch(`http://${config.SERVER_URL}/request/logout`, {
        method: "POST",
        credentials: "include",
    });
    sessionStorage.removeItem("useridRef");
    navigate("/login");
  };

  // 📅 날짜 포맷 변환 함수
  const formatDate = (date) => {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  };

  useEffect(() => {
    if (!Array.isArray(mealData)) {
      console.warn("mealData가 배열이 아닙니다!", mealData);
      return;
    }
  
    const formattedData = mealData.reduce((acc, record) => {
      const dateKey = formatDate(new Date(record.timestamp));
  
      if (!acc[dateKey]) {
        acc[dateKey] = { calories: 0, meal: [] };
      }
  
      acc[dateKey].calories += record.calories;
      acc[dateKey].meal.push(record.dietMemo);
      return acc;
    }, {});
  
    // ✅ 기존 데이터와 다를 경우에만 업데이트
    if (JSON.stringify(mealRecords) !== JSON.stringify(formattedData)) {
      setMealRecords(formattedData);
    }
  }, [mealData]);

  // const isSelected = selectedDate === day;

  const handleDateClick = (day) => {
    setSelectedDate(day); // ✅ 날짜 객체가 아니라 숫자로 저장
  };  
  // ✅ 현재 월의 총 일 수 가져오기
  const daysInMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const changeMonth = (offset) => {
    let newMonth = month + offset;
    let newYear = year;
  
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
  
    // ✅ 변경되지 않은 경우 `setState` 실행 방지
    if (newMonth !== month || newYear !== year) {
      setYear(newYear);
      setMonth(newMonth);
      setSelectedDate(null);
    }
  };
  

  return (
    <div className={styles.MealCalender_Container}>
      <img
        src="/image/black.png"
        alt="Background"
        className={styles.MealCalender_image}
      />
      <a className={styles.MealCalender_title}>FitEnd</a>
      <div className={styles["meal-calendar"]}>
        <div className={styles["calendar-header"]}>
          <button onClick={() => changeMonth(-1)}>⟪</button>
          <h2>
            {monthNames[month - 1]} {year}
          </h2>
          <button onClick={() => changeMonth(1)}>⟫</button>
        </div>

        <div className={styles.weekdays}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className={styles["calendar-days"]}>
          {Array.from({ length: daysInMonth + startDay }).map((_, index) => {
            const day = index - startDay + 1;
            const dateKey = `${year}-${month.toString().padStart(2, "0")}-${day
              .toString()
              .padStart(2, "0")}`;
            const isSelected = selectedDate === day;
            const hasData = mealRecords[dateKey];

            return index < startDay ? (
              <div key={`empty-${index}`} className={styles["empty-day"]}></div>
            ) : (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`${styles["calendar-day"]} ${
                  isSelected ? styles.selected : ""
                } ${hasData ? styles["has-data"] : ""}`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <div className={styles["selected-date-container"]}>
            <p className={styles["selected-date-text"]}>
              {year}년 {month}월 {selectedDate}일 선택됨
            </p>

            {mealRecords[
              `${year}-${month.toString().padStart(2, "0")}-${selectedDate
                .toString()
                .padStart(2, "0")}`
            ] ? (
              <>
                <p className={styles["meal-data-text"]}>
                  {
                    mealRecords[
                      `${year}-${month.toString().padStart(2, "0")}-${selectedDate
                        .toString()
                        .padStart(2, "0")}`
                    ].meal.join(", ")
                  }
                </p>
                <p className={styles["calorie-data-text"]}>
                  🔥{" "}
                  {
                    mealRecords[
                      `${year}-${month.toString().padStart(2, "0")}-${selectedDate
                        .toString()
                        .padStart(2, "0")}`
                    ].calories
                  }{" "}
                  kcal
                </p>
              </>
            ) : (
              <p className={styles["no-record-text"]}>기록 없음</p>
            )}
            <button className={styles.eat} onClick={navigateFood}>
              <span className={styles.eat_yellow_button}>
                Going to record food Click!
              </span>
            </button>
          </div>
        )}
      </div>

      <div className={styles["Button-Container"]}>
        <div className={styles["Button-Item"]}>
          <img
            src="/image/HOME.png"
            alt="Main"
            className={styles.ButtonImage}
            onClick={navigateMain}
          />
          <span className={styles.Span}>Main</span>
        </div>
        <div className={styles["Button-Item"]}>
          <img
            src="/image/PAPAR.png"
            alt="Paper"
            className={styles.ButtonImage}
            onClick={navigateToRecordBody}
          />
          <span className={styles.Span}>Paper</span>
        </div>
        <div className={styles["Button-Item"]}>
          <img
            src="/image/Vector7.png"
            alt="rank"
            className={styles.ButtonImage}
            onClick={navigateGraph}
          />
          <span className={styles.Span}>Graph</span>
        </div>
        <div className={styles["Button-Item"]}>
          <img
            src="/image/Vector8.png"
            alt="Food"
            className={styles.ButtonImage}
            onClick={thisPage}
          />
          <span className={styles.Span}>Food</span>
        </div>
        <div className={styles["Button-Item"]}>
          <img
            src="/image/PEOPLE.png"
            alt="Logout"
            className={styles.ButtonImage}
            onClick={handleLogout}
          />
          <span className={styles.Span}>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default MealCalendar;