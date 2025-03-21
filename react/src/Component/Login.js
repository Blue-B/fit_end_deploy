import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import styles from "../Style/login.module.css";

export default function Login() {
  //로그인 입력값 상태 관리리
  const [userid, setUserId] = useState(""); // 사용자 ID
  const [password, setPassword] = useState(""); // 비밀번호
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메세지 표시용
  const navigate = useNavigate(); // 페이지 이동용 훅

  // 회원가입 페이지 이동
  const navigateToRegister = () => {
    navigate('/register');
  };

  // 로그인 폼 제출 시 실행되는 함수
  const handleSubmit = async (event) => {
    event.preventDefault(); // 기본 폼 제출 동작 방지

    const userInfo = {
      userid,
      password,
    };

    try {
      // 서버에 로그인 요청 보내기
      const response = await fetch(`http://${config.SERVER_URL}/login/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 쿠키 포함 전송
        body: JSON.stringify(userInfo), // 입력값을 JSON 형태로 변환하여 전송
      });

      if (!response.ok) {
        if (response.status === 404) {
          navigate("/error/404");
        } else if (response.status === 500) {
          navigate("/error/500");
        } else if (response.status === 503) {
          navigate("/error/503");
        } else {
          setErrorMessage("로그인 실패! 아이디 또는 비밀번호를 확인하세요.");
        }
      } else {
        const data = await response.json();
        console.log("Login successful");
        alert("로그인 성공!");
        sessionStorage.setItem("userid", data.userid);
        navigate("/main"); // 로그인 성공 후 메인 페이지로 이동
      }
    } catch (error) {
      setErrorMessage("서버 오류 발생! 관리자에게 문의하세요.");
      console.error("Error:", error);
      navigate("/error/500");
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("userid")) {
      navigate("/main");
    }
  }, [navigate]);

  return (
    <div>
      <div className={styles.Main_Container}>
        <h2 className={styles.Main_Title}></h2>
        <img src="/image/MAIN_BACKIMAGE.png" alt="Background" className={styles.MainImage} />
        <img src="/image/Vector9.png" alt="" className={styles.MainImage_Vector} />
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>} {/* 로그인 5회 실패시 에러메세지 p태그로 반환 */}
        <form onSubmit={handleSubmit}>
          <div>
            <label className={styles["USERLOGINID_EMAIL"]}>ID</label>
            <input
              className={styles.INPUTTEXT1}
              type="text"
              value={userid}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={styles["USERLOGINID_PASSWORD"]}>PASSWORD</label>
            <input
              className={styles.INPUTTEXT1}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className={styles["LOGIN_BUTTON"]} type="submit">LOGIN</button>
          <div className={styles["SIGNUP_BUTTON"]}>
            Don't have an account?
            <button className={styles["BUTTON_SIGN_UP"]} onClick={navigateToRegister}>Sign_up</button>
          </div>
        </form>
      </div>
    </div>
  );
}