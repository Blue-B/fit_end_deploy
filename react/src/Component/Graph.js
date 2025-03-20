import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import styles from "../Style/graph.module.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Graph() {
  const useridRef = useRef(sessionStorage.getItem("userid"));
  const navigate = useNavigate();
  const [bodyrecod, setBodyRecod] = useState([]);
  const [loading, setLoading] = useState(true);

  // 누적된 BMI 데이터와 오늘의 BMI 상태 관리
  const [bmiData, setBmiData] = useState([]);

  const navigateMain = () => { navigate("/main"); };
  const navigateToRecordBody = () => { navigate("/recordbody"); };
  const navigateCalender = () => { navigate("/Calender"); };
  const navigateRank = () => { navigate("/rank"); };

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
        sessionStorage.removeItem("userid");
        navigate("/login");
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      navigate("/error/500");
    }
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
        console.log("로그인 상태 확인 성공:", data);
        useridRef.current = data.userid;
        sessionStorage.setItem("userid", data.userid);

        // 사용자 신체 기록 가져오기
        return fetch(`http://${config.SERVER_URL}/userinfobody/recentuserbody/${data.userid}`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
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
            throw new Error("신체 기록 가져오기 실패");
          }
        }
        return response.json();
      })
      .then((bodyData) => {
        console.log("신체 기록 응답 데이터:", bodyData);
        setBodyRecod(bodyData);
        setLoading(false);
      })
      .catch(() => {
        console.warn("인증 실패. 로그인 페이지로 이동");
        sessionStorage.removeItem("userid");
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    if (bodyrecod.length === 0) {
      const timer = setTimeout(() => {
        navigateToRecordBody();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [bodyrecod, navigateToRecordBody]);

  // 누적된 BMI 데이터와 오늘의 BMI 데이터를 업데이트
  useEffect(() => {
    if (bodyrecod.length > 0) {
      const newBmiData = [
        { name: 'Day 1', bmi: bodyrecod[0].bmi }, 
        { name: 'Day 2', bmi: bodyrecod[1]?.bmi || bodyrecod[0].bmi },
        { name: 'Day 3', bmi: bodyrecod[2]?.bmi || bodyrecod[0].bmi },
        { name: 'Today', bmi: bodyrecod[bodyrecod.length - 1]?.bmi || bodyrecod[0].bmi },
      ];
      setBmiData(newBmiData);
    }
  }, [bodyrecod]);

  if (loading) {
    return <p>📡 데이터를 불러오는 중입니다...</p>;
  }

  if (bodyrecod.length === 0 || bodyrecod[0] == null) {
    return (
      <div>
        <p>⚠️ 신체 기록이 없습니다! 곧 등록페이지로 이동됩니다.</p>
      </div>
    );
  }

  return (
    <div>
      {useridRef.current ? (
        <>
          <div className={styles["Graph_Container"]}>
            <img src="/image/black.png" alt="Background" className={styles["MainImage"]} />
            <a className={styles["GraphTitle"]}>FitEnd</a>
            <div className={styles["Central_Menu"]}>
              <div className={styles["Inbodyscore_div"]}>
                <p className={styles["inbodyscore"]}>{bodyrecod[0].inbodyScore}</p>
                <p className={styles["inbodyscore_text"]}> Your InBody Ranking Score:</p>
                <p className={styles["graphtext"]}>Information</p>
              </div>
              <ResponsiveContainer className={styles["recharts-responsive-container"]} width="100%" height={250}>
                <LineChart data={bmiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="bmi" stroke="#C9F439" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <div className={styles["container"]}>
                <div className={styles["item"]}>
                  <img src="/image/height_button.png" alt="Height" className={styles["icon"]} />
                  <p className={styles["text"]}>{bodyrecod[0].height} cm</p>
                </div>
                <div className={styles["item"]}>
                  <img src="/image/weight_Button.png" alt="Weight" className={styles["icon"]} />
                  <p className={styles["text"]}>{bodyrecod[0].weight} kg</p>
                </div>
                <div className={styles["item"]}>
                  <img src="/image/PHbutton.png" alt="Body Fat" className={styles["icon"]} />
                  <p className={styles["text"]}>{bodyrecod[0].fatpercentage} %</p>
                </div>
                <div className={styles["item"]}>
                  <img src="/image/Bmi_button.png" alt="BMI" className={styles["icon"]} />
                  <p className={styles["text"]}>{bodyrecod[0].bmi}</p>
                </div>
              </div>
              <div className={styles["Button-Container"]}>
                <div className={styles["Button-Item"]}>
                  <img src="/image/HOME.png" alt="Main" className={styles["ButtonImage"]} onClick={navigateMain} />
                  <span className={styles["Span"]}>Main</span>
                </div>
                <div className={styles["Button-Item"]}>
                  <img src="/image/PAPAR.png" alt="Paper" className={styles["ButtonImage"]} onClick={navigateToRecordBody} />
                  <span className={styles["Span"]}>Paper</span>
                </div>
                <div className={styles["Button-Item"]}>
                  <img src="/image/Vector7.png" alt="rank" className={styles["ButtonImage"]} onClick={navigateRank} />
                  <span className={styles["Span"]}>Rank</span>
                </div>
                <div className={styles["Button-Item"]}>
                  <img src="/image/Vector8.png" alt="Food" className={styles["ButtonImage"]} onClick={navigateCalender} />
                  <span className={styles["Span"]}>Food</span>
                </div>
                <div className={styles["Button-Item"]}>
                  <img src="/image/PEOPLE.png" alt="Logout" className={styles["ButtonImage"]} onClick={handleLogout} />
                  <span className={styles["Span"]}>Logout</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>잘못된 접근</p>
      )}
    </div>
  );
}