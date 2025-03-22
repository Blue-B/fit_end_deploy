import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "react-calendar/dist/Calendar.css";
import styles from "../Style/MealTimingselect.module.css";
import config from "../config";

export default function MealTimingselect() {
  const location = useLocation();
  const navigate = useNavigate();
  const mealTypes = ["moning", "lunch", "dinner", "dessert"]; // 아침, 점심, 저녁

  // 🟢 selectedDate를 올바르게 초기화
  const { selectedDate: selectedDateRaw } = location.state || {};
  const [selectedDate, setSelectedDate] = useState(
    selectedDateRaw ? new Date(selectedDateRaw) : new Date()
  );

  const [userid, setUserid] = useState("");
  const [mealData, setMealData] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);

  // 📅 날짜 포맷 변환 함수
  const formatDate = (date) => {
    const validDate = date instanceof Date ? date : new Date(date);
    return new Date(validDate.getTime() - validDate.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  };

  // 🟢 선택한 날짜를 포맷팅하여 사용
  const selectedDateFormatted = formatDate(selectedDate);

  // 🍽️ 식사 유형 선택 후 FoodSearchR로 이동
  const handleMealSelection = (mealType) => {
    navigate("/FoodSearchR", {
      state: { selectedDate: formatDate(selectedDate), mealType },
    });
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
            throw new Error("Failed to fetch diet records");
          }
        }
        return response.json();
      })
      .then((data) => {
        setMealData(data);
        const dates = [
          ...new Set(
            data.map((record) => formatDate(new Date(record.timestamp)))
          ),
        ].sort((a, b) => new Date(b) - new Date(a));
        setAvailableDates(dates);

        if (!selectedDateRaw && dates.length > 0) {
          setSelectedDate(new Date(dates[0]));
        }
      })
      .catch(() => {
        navigate("/login");
      });
  }, [navigate, selectedDateRaw]);

  // 🍽️ 선택한 날짜의 식사 데이터 필터링
  const filteredData = mealData.filter(
    (record) => formatDate(new Date(record.timestamp)) === selectedDateFormatted
  );

  // ✅ 🟢 누락된 `navigate` 함수들 추가
  const navigateFoodSearchR = () => navigate("/FoodSearchR");
  const navigateCalender = () => navigate("/Calender");
  const navigateMain = () => navigate("/main");
  const navigateToRecordBody = () => navigate("/recordbody");
  const navigateGraph = () => navigate("/Graph");
  const navigateFood = () => navigate("/Calender");
  const navigateMyPage = () => navigate("/MyPage");

  // ✅ 🟢 로그아웃 함수 추가
  const handleLogout = async () => {
    await fetch(`http://${config.SERVER_URL}/login/logout`, {
      method: "POST",
      credentials: "include",
    });
    sessionStorage.removeItem("userid");
    navigate("/login");
  };

  return (
    <div className={styles.MealTimingselect_Container}>
      <img
        src="/image/black.png"
        alt="Background"
        className={styles.MainImage}
      />
      <a className={styles.MealTimeingslelect_title}>FitEnd</a>
      <div className={styles.content}>
        <img
          src="/image/foodlist/moning_food.png"
          alt="moning-food"
          className={styles.moning}
        ></img>
        <img
          src="/image/foodlist/Lunch_food.png"
          alt="lunch-food"
          className={styles.lunch}
        />
        <img
          src="/image/foodlist/Dinner_food.png"
          alt="dinner-food"
          className={styles.dinner}
        />
        <img
          src="/image/foodlist/Dessert_food.png"
          alt="dessert-food"
          className={styles.desser}
        ></img>

        <a className={styles.MoningText}>Moning</a>
        <a className={styles.LunchText}>LUNCH</a>
        <a className={styles.DinnerText}>DINNER</a>
        <a className={styles.DessertText}>DESSERT</a>

        <button
          className={styles.plus_button_left}
          onClick={() => handleMealSelection("moning")}
        >
          <img src="/image/foodlist/⟫.png" alt="plus" />
        </button>
        <button
          className={styles.plus_button_right}
          onClick={() => handleMealSelection("lunch")}
        >
          <img src="/image/foodlist/⟫.png" alt="plus" />
        </button>
        <button
          className={styles.plus_button_bottomleft}
          onClick={() => handleMealSelection("dinner")}
        >
          <img src="/image/foodlist/⟫.png" alt="plus" />
        </button>
        <button
          className={styles.plus_button_bottomright}
          onClick={() => handleMealSelection("dessert")}
        >
          <img src="/image/foodlist/⟫.png" alt="plus" />
        </button>

        <div className={styles["meal-data"]}>
          {/* 🍞 아침 (moning) */}
          <div className={styles["meal-section_moning"]}>
            <h3 className={styles["meal-title"]}></h3>
            {mealData.filter(
              (record) =>
                record.dietMemo === "moning" &&
                formatDate(new Date(record.timestamp)) === selectedDateFormatted
            ).length > 0 ? (
              <span className={styles["meal-calories"]}>
                {mealData
                  .filter(
                    (record) =>
                      record.dietMemo === "moning" &&
                      formatDate(new Date(record.timestamp)) ===
                        selectedDateFormatted
                  )
                  .reduce((sum, record) => sum + record.enerc, 0)}{" "}
                kcal
              </span>
            ) : (
              <span className={styles["meal-no-data"]}>No records</span>
            )}
          </div>

          {/* 🍜 점심 (lunch) */}
          <div className={styles["meal-section_lunch"]}>
            <h3 className={styles["meal-title"]}></h3>
            {mealData.filter(
              (record) =>
                record.dietMemo === "lunch" &&
                formatDate(new Date(record.timestamp)) === selectedDateFormatted
            ).length > 0 ? (
              <span className={styles["meal-calories"]}>
                {mealData
                  .filter(
                    (record) =>
                      record.dietMemo === "lunch" &&
                      formatDate(new Date(record.timestamp)) ===
                        selectedDateFormatted
                  )
                  .reduce((sum, record) => sum + record.enerc, 0)}{" "}
                kcal
              </span>
            ) : (
              <span className={styles["meal-no-data"]}>No records</span>
            )}
          </div>

          {/* 🍗 저녁 (dinner) */}
          <div className={styles["meal-section_dinner"]}>
            <h3 className={styles["meal-title"]}></h3>
            {mealData.filter(
              (record) =>
                record.dietMemo === "dinner" &&
                formatDate(new Date(record.timestamp)) === selectedDateFormatted
            ).length > 0 ? (
              <span className={styles["meal-calories"]}>
                {mealData
                  .filter(
                    (record) =>
                      record.dietMemo === "dinner" &&
                      formatDate(new Date(record.timestamp)) ===
                        selectedDateFormatted
                  )
                  .reduce((sum, record) => sum + record.enerc, 0)}{" "}
                kcal
              </span>
            ) : (
              <span className={styles["meal-no-data"]}>No records</span>
            )}
          </div>

          {/* 🍰 디저트 (dessert) */}
          <div className={styles["meal-section_dessert"]}>
            <h3 className={styles["meal-title"]}></h3>
            {mealData.filter(
              (record) =>
                record.dietMemo === "dessert" &&
                formatDate(new Date(record.timestamp)) === selectedDateFormatted
            ).length > 0 ? (
              <span className={styles["meal-calories"]}>
                🔥 총 칼로리:{" "}
                {mealData
                  .filter(
                    (record) =>
                      record.dietMemo === "dessert" &&
                      formatDate(new Date(record.timestamp)) ===
                        selectedDateFormatted
                  )
                  .reduce((sum, record) => sum + record.enerc, 0)}{" "}
                kcal
              </span>
            ) : (
              <span className={styles["meal-no-data"]}>No records</span>
            )}
          </div>
        </div>
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
            onClick={navigateMyPage}
          />
          <span className={styles.Span}>Mypage</span>
        </div>
      </div>
    </div>
  );
}
