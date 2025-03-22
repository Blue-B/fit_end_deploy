import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import styles from "../Style/myPage.module.css";

const MyPage = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    userid: "",
    email: "",
    sex: "",
    region1: "",
    region2: "",
    birth: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jwtString, setJwtString] = useState(""); // JWT 문자열 상태 추가
  const useridRef = useRef(sessionStorage.getItem("userid")); // 세션 스토리지에서 userid 참조

  // 네비게이션 함수들
  const navigateMain = () => navigate("/main");
  const navigateToRecordBody = () => navigate("/recordbody");
  const navigateCalender = () => navigate("/Calender");
  const navigateGraph = () => navigate("/Graph");
  const navigateMyPage = () => navigate("/MyPage");

  const generationJwt = async () => {
    try {
      // 백엔드에 POST 요청을 전송하여 JWT 생성 요청
      const response = await fetch(
        `http://${config.SERVER_URL}/userinfo/generation`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userid: useridRef.current }),
        }
      );

      // 응답 실패시 예외 처리
      if (!response.ok) {
        if (response.status === 404) {
          navigate("/error/404");
        } else if (response.status === 500) {
          navigate("/error/500");
        } else if (response.status === 503) {
          navigate("/error/503");
        } else {
          setError("JWT 생성 실패! 다시 시도해주세요.");
        }
        return;
      }

      // JWT 토큰을 텍스트로 추출후 상태에 저장
      const token = await response.text();
      setJwtString(token);
      console.log("Received JWT:", token); // 콘솔로 확인
    } catch (error) {
      console.error("JWT 생성 중 에러 발생:", error);
      navigate("/error/500");
    }
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 실행
    generationJwt();
  }, [navigate]);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      const userid = sessionStorage.getItem("userid");
      if (!userid) {
        navigate("/login");
        return;
      }

      try {
        // 사용자 정보 가져오기
        const userResponse = await fetch(
          `http://${config.SERVER_URL}/userinfo/mypage/${userid}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!userResponse.ok) {
          throw new Error("사용자 정보를 가져오는데 실패했습니다.");
        }

        const userData = await userResponse.json();
        setUserInfo(userData);
        setLoading(false);
      } catch (error) {
        console.error("데이터 가져오기 오류:", error);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // 로그아웃 함수
  const handleLogout = () => {
    sessionStorage.removeItem("userid");
    sessionStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  if (loading) {
    return <div className={styles.Main_Container}>로딩 중...</div>;
  }

  return (
    <div className={styles.Main_Container}>
      <div className={styles.sectionTitle}>
        <h1>사용자 정보</h1>
      </div>

      <div className={styles["Central-Menu"]}>
        {error && <p className={styles.errorMessage}>{error}</p>}

        <div className={styles.profileSection}>
          <div className={styles.infoDisplay}>
            <p>
              <strong>아이디:</strong> {userInfo.userid}
            </p>
            <p>
              <strong>이메일:</strong> {userInfo.email}
            </p>
            <p>
              <strong>성별:</strong> {userInfo.sex === "1" ? "남성" : "여성"}
            </p>
            <p>
              <strong>지역:</strong> {userInfo.region1} {userInfo.region2}
            </p>
            <p>
              <strong>생년월일:</strong>{" "}
              {userInfo.birth
                ? new Date(userInfo.birth).toLocaleDateString()
                : "정보 없음"}
            </p>
          </div>
        </div>

        {/* API 키 섹션 */}
        <div className={styles.apiKeySection}>
          <div className={styles.sectionTitle}>
            <h3>API 키</h3>
          </div>
          <div className={styles.apiKeyDisplay}>
            <p className={styles.apiKeyText}>
              {jwtString ? jwtString : "API 키 로딩 중..."}
            </p>
            <button
              onClick={() => generationJwt()}
              className={styles.apiButton}
            >
              API 재발급
            </button>
          </div>
        </div>

        <div className={styles.accountActions}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            로그아웃
          </button>
        </div>
      </div>

      {/* 하단 네비게이션 바 */}
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
            alt="Graph"
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
            onClick={navigateCalender}
          />
          <span className={styles.Span}>Food</span>
        </div>
        <div className={styles["Button-Item"]}>
          <img
            src="/image/PEOPLE.png"
            alt="MyPage"
            className={styles.ButtonImage}
            onClick={navigateMyPage}
          />
          <span className={styles.Span}>MyPage</span>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
