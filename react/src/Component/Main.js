import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import { useSpring, animated } from "react-spring";
import { useSwipeable } from "react-swipeable";
import styles from "../Style/main.module.css";

export default function Main() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bodyrecord, setbodyrecord] = useState([]);
  const [loading, setLoading] = useState(true);
  const useridRef = useRef(sessionStorage.getItem("userid"));

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNext(),
    onSwipedRight: () => goToPrevious(),
  });

  const navigateMain = () => navigate("/main");
  const navigateToRecordBody = () => navigate("/recordbody");
  const navigateFood = () => navigate("/MealTimingselect");
  const navigateGraph = () => navigate("/Graph");

  const handleLogout = async () => {
    await fetch(`http://${config.SERVER_URL}/login/logout`, {
      method: "POST",
      credentials: "include",
    });
    sessionStorage.removeItem("userid");
    navigate("/login");
  };

  useEffect(() => {
    if (useridRef.current) {
      const interval = setInterval(goToNext, 3000);
      return () => clearInterval(interval);
    }
  }, [currentIndex]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const animation = useSpring({
    opacity: 1,
    transform: `scale(1.05)`,
    config: { tension: 200, friction: 30 },
  });

  const images = [
    "/image/advertisement_fitness.png",
    "/image/advertisement_gym.png",
    "/image/advertisement_main.png",
  ];

  useEffect(() => {
    fetch(`http://${config.SERVER_URL}/login/validate`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unauthorized");
        return response.json();
      })
      .then((data) => {
        console.log("로그인 상태 확인 성공:", data);
        useridRef.current = data.userid;
        sessionStorage.setItem("userid", data.userid);
        return fetch(`http://${config.SERVER_URL}/userinfobody/recentuserbody/${data.userid}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
      })
      .then((response) => response.json())
      .then((bodyData) => {
        console.log("신체 기록 응답 데이터:", bodyData);
        setbodyrecord(bodyData);
        setLoading(false);
      })
      .catch(() => {
        console.warn("인증 실패. 로그인 페이지로 이동");
        sessionStorage.removeItem("userid");
        navigate("/login");
      });
  }, [navigate]);

  return (
    <div className={styles.Main_Container}>
      <a className={styles.maintitle}>FitEnd</a>
      <img src="/image/black.png" alt="Background" className={styles.MainImage} />
      <div className={styles["Central-Menu"]}>
        <div className={styles.anime_container} {...swipeHandlers}>
          <animated.div style={animation} className={styles.slide}>
            <img src={images[currentIndex]} alt="carousel" />
          </animated.div>
          <div className={styles.anime_controls}>
            <button className={styles.prev} onClick={goToPrevious}>⟨</button>
            <button className={styles.next} onClick={goToNext}>⟩</button>
          </div>
        </div>
        <div className={styles.optionImage_container}>
          <img src="/image/IMAGE1.png" alt="Option 1" className={styles.optionImage} />
          <img src="/image/IMAGE2.png" alt="Option 2" className={styles.optionImage} />
          <img src="/image/IMAGE3.png" alt="Option 3" className={styles.optionImage} />
        </div>
      </div>
      <div className={styles["Button-Container"]}>
        <div className={styles["Button-Item"]}>
          <img src="/image/HOME.png" alt="Main" className={styles.ButtonImage} onClick={navigateMain} />
          <span className={styles.Span}>Main</span>
        </div>
        <div className={styles["Button-Item"]}>
          <img src="/image/PAPAR.png" alt="Paper" className={styles.ButtonImage} onClick={navigateToRecordBody} />
          <span className={styles.Span}>Paper</span>
        </div>
        <div className={styles["Button-Item"]}>
          <img src="/image/Vector7.png" alt="Graph" className={styles.ButtonImage} onClick={navigateGraph} />
          <span className={styles.Span}>Graph</span>
        </div>
        <div className={styles["Button-Item"]}>
          <img src="/image/Vector8.png" alt="Food" className={styles.ButtonImage} onClick={navigateFood} />
          <span className={styles.Span}>Food</span>
        </div>
        <div className={styles["Button-Item"]}>
          <img src="/image/PEOPLE.png" alt="Logout" className={styles.ButtonImage} onClick={handleLogout} />
          <span className={styles.Span}>Logout</span>
        </div>
      </div>
    </div>
  );
}