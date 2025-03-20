import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../Style/MealCalender.module.css";
import config from "../config";

const MealCalendar = () => {
  const navigate = useNavigate();
  const [year, setYear] = useState(2025);
  const [month, setMonth] = useState(3);
  const [selectedDate, setSelectedDate] = useState(null);
  const [mealRecords, setMealRecords] = useState({});
  const [userid, setUserid] = useState("");

  const rawStartDay = new Date(year, month - 1, 1).getDay();
  const startDay = rawStartDay === 0 ? 6 : rawStartDay - 1;

  const navigateMain = () => navigate("/main");
  const navigateToRecordBody = () => navigate("/recordbody");
  const navigateGraph = () => navigate("/Graph");
  const thisPage = () => navigate("/Calender");

  const navigateFood = () => {
    if (selectedDate) {
      const fullDate = new Date(year, month - 1, selectedDate);
      navigate("/MealTimingselect", { state: { selectedDate: fullDate } });
    } else {
      alert("날짜를 선택하세요!");
    }
  };

  const handleLogout = async () => {
    await fetch(`http://${config.SERVER_URL}/request/logout`, {
      method: "POST",
      credentials: "include",
    });
    sessionStorage.removeItem("useridRef");
    navigate("/login");
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toISOString().split("T")[0]; // YYYY-MM-DD 형식 변환
  };

  useEffect(() => {
    fetch(`http://${config.SERVER_URL}/login/validate`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            navigate("/error/404");
          } else if (response.status === 500) {
            navigate("/error/500");
          } else if (response.status === 503) {
            navigate("/error/503");
          } else {
            throw new Error("Unauthorized");
          }
        }
        return response.json();
      })
      .then((data) => {
        console.log("로그인 성공:", data);
        setUserid(data.userid);

        return fetch(
          `http://${config.SERVER_URL}/food/diet-records/${data.userid}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );
      })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            navigate("/error/404");
          } else if (response.status === 500) {
            navigate("/error/500");
          } else if (response.status === 503) {
            navigate("/error/503");
          } else {
            throw new Error("서버 응답 실패");
          }
        }
        return response.json();
      })
      .then((data) => {
        console.log("서버에서 받은 식사 데이터:", data);

        const formattedData = {};

        data.forEach((record) => {
          const dateKey = formatDate(record.timestamp); // 날짜 변환

          if (!formattedData[dateKey]) {
            formattedData[dateKey] = { calories: 0, meal: [] };
          }

          formattedData[dateKey].calories += record.enerc; // ✅ 'calories' 대신 'enerc' 사용
          formattedData[dateKey].meal.push(record.dietMemo);
        });

        console.log("변환된 mealRecords:", formattedData);
        setMealRecords(formattedData);
      })
      .catch((error) => {
        console.warn("인증 실패 또는 데이터 불러오기 실패:", error);
        navigate("/login");
      });
  }, [navigate]);

  const handleDateClick = (day) => {
    setSelectedDate(day);
  };

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

    setYear(newYear);
    setMonth(newMonth);
    setSelectedDate(null);
  };

  return (
    <div className={styles.MealCalender_Container}>
      <img src="/image/black.png" alt="Background" className={styles.MealCalender_image} />
      <a className={styles.MealCalender_title}>FitEnd</a>
      <div className={styles["meal-calendar"]}>
        <div className={styles["calendar-header"]}>
          <button onClick={() => changeMonth(-1)}>⟪</button>
          <h2>{monthNames[month - 1]} {year}</h2>
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
            const dateKey = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
            const isSelected = selectedDate === day;
            const hasData = mealRecords[dateKey];

            return index < startDay ? (
              <div key={`empty-${index}`} className={styles["empty-day"]}></div>
            ) : (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`${styles["calendar-day"]} ${isSelected ? styles.selected : ""} ${hasData ? styles["has-data"] : ""}`}
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

            {mealRecords[`${year}-${month.toString().padStart(2, "0")}-${selectedDate.toString().padStart(2, "0")}`] ? (
              <>
                {/* <p className={styles["meal-data-text"]}>
                  {mealRecords[`${year}-${month.toString().padStart(2, "0")}-${selectedDate.toString().padStart(2, "0")}`].meal.join(", ")}
                </p> */}
                <p className={styles["calorie-data-text"]}>
                  🔥 {mealRecords[`${year}-${month.toString().padStart(2, "0")}-${selectedDate.toString().padStart(2, "0")}`].calories} kcal
                </p>
              </>
            ) : (
              <p className={styles["no-record-text"]}>기록 없음</p>
            )}
            <button className={styles.eat} onClick={navigateFood}>
              <span className={styles.eat_yellow_button}>Going to record food Click!</span>
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
            onClick={navigateFood}
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