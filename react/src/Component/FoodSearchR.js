import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import config from "../config";
import styles from "../Style/FoodList.module.css";

const formatDate = (date) => {
  const validDate = date instanceof Date ? date : new Date(date);
  return new Date(validDate.getTime() - validDate.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];
};

export default function FoodSearchR() {
  const location = useLocation();
  const { selectedDate, mealType } = location.state || {};
  const formattedSelectedDate = selectedDate || formatDate(new Date());
  const formattedMealType = mealType || "dinner";

  const [data, setData] = useState(null);
  const [foodNm, setFoodNm] = useState("");
  const [userid, setUserid] = useState("");
  const navigate = useNavigate();

  const navigateMain = () => { navigate("/main"); };
  const navigateToRecordBody = () => { navigate("/recordbody"); };
  const navigateFood = () => { navigate("/Calender"); };
  const navigateGraph = () => { navigate("/Graph"); };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      const response = await fetch(`http://${config.SERVER_URL}/login/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          navigate("/error/404");
        } else if (response.status === 500) {
          navigate("/error/500");
        } else if (response.status === 503) {
          navigate("/error/503");
        } else {
          throw new Error("로그아웃 실패");
        }
      } else {
        sessionStorage.removeItem("useridRef");
        navigate("/login");
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      navigate("/error/500");
    }
  };

  useEffect(() => {
    // 서버에서 현재 로그인한 사용자 확인
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
        console.log("로그인 상태 확인 성공:", data);
        setUserid(data.userid);
      })
      .catch(() => {
        console.warn("인증 실패. 로그인 페이지로 이동");
        navigate("/login");
      });
  }, [navigate]);

  // 음식 검색 API 호출
  const fetchData = () => {
    if (foodNm) {
      fetch(`http://${config.SERVER_URL}/food/foodname/${foodNm}`, {
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
              throw new Error("음식 검색 실패");
            }
          }
          return response.json();
        })
        .then((data) => setData(data))
        .catch((error) => {
          console.error("Error fetching data:", error);
          alert("음식 검색 중 오류가 발생했습니다.");
        });
    } else {
      alert("음식 이름을 입력하세요.");
    }
  };

  // 음식 선택 후 저장 API 호출
  const handleButtonClick = (item) => {
    const foodData = {
      ...item,
      userid,
      timestamp: selectedDate || new Date().toISOString(),
      dietMemo: mealType || "기록 없음",
    };

    console.log("전송할 데이터:", foodData); // 전송 전에 확인

    fetch(`http://${config.SERVER_URL}/food/saveFoodRecord`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(foodData),
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
            throw new Error("음식 기록 저장 실패");
          }
        }
        return response.text();
      })
      .then((data) => {
        console.log("서버 응답:", data);
        alert(data); // 성공 메시지 출력
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("음식 기록 저장 중 오류가 발생했습니다.");
      });
  };

  return (
    <div className={styles.Main_Container}>
      <img src="/image/black.png" alt="Background" className={styles.MainImage} />
      <a className={styles.maintitle}>FitEnd</a>
      <div className={styles.food_container}>
        <h2>날짜: {formattedSelectedDate}</h2>
        <h2>식사 유형: {formattedMealType === "moning" ? "아침" : formattedMealType === "lunch" ? "점심" : formattedMealType === "dinner" ? "저녁" : "디저트"}</h2>
        <h2>음식 검색</h2>
        <input
          type="text"
          value={foodNm}
          onChange={(e) => setFoodNm(e.target.value)}
          placeholder="Enter food name"
        />
        <button onClick={fetchData}>Search</button>
        {data ? (
          <div>
            {data.map((item, index) => (
              <button key={index} onClick={() => handleButtonClick(item)}>
                {item.foodNm} {item.mfrNm}
              </button>
            ))}
          </div>
        ) : (
          <p>음식을 검색하세요...</p>
        )}

        <div className={styles.button_container}>
          {[
            { img: "HOME.png", alt: "Main", action: navigateMain, label: "Main" },
            { img: "PAPAR.png", alt: "Paper", action: navigateToRecordBody, label: "Paper" },
            { img: "Vector7.png", alt: "Graph", action: navigateGraph, label: "Graph" },
            { img: "Vector8.png", alt: "Food", action: navigateFood, label: "Food" },
            { img: "PEOPLE.png", alt: "Logout", action: handleLogout, label: "Logout" },
          ].map(({ img, alt, action, label }, idx) => (
            <div key={idx} className={styles.button_item}>
              <img src={`/image/${img}`} alt={alt} className={styles.buttonimage} onClick={action} />
              <span className={styles.span}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}