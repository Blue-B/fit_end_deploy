import React, { useState, useEffect, useRef } from "react";
import config from "../config";
import { useNavigate } from "react-router-dom"; // 에러페이지 이동시 사용

const ApiHandlerPage = () => {
  const [jwtString, setJwtString] = useState("");  //JWT 문자열을 저장할 상태 변수
  const [errorMessage, setErrorMessage] = useState(""); // 에러 메시지 상태
  const useridRef = useRef(sessionStorage.getItem("userid")); // 세션 스토리지에서 userid를 가져와 저장
  const navigate = useNavigate();  // 페이지 이동 훅

  // 컴포넌트 마운트 시 JWT 생성
  useEffect(() => {
    // JWT 토큰 생성 함수 정의
    async function generationJwt() {
      try {
        // 백엔드에 POST 요청을 전송하여 JWT 생성 요청
        const response = await fetch(`http://${config.SERVER_URL}/userinfo/generation`, {
          method: "POST", // POST 요청청
          credentials: "include", // 인증 벙보(쿠키)포함
          headers: { "Content-Type": "application/json" }, // JSON 타입 명시
          body: JSON.stringify({ userid: useridRef.current }), // 요청 바디에 userid 포함
        });

        //응답 실패시 예외 처리
        if (!response.ok) {
          if (response.status === 404) {
            navigate("/error/404");
          } else if (response.status === 500) {
            navigate("/error/500");
          } else if (response.status === 503) {
            navigate("/error/503");
          } else {
            setErrorMessage("JWT 생성 실패! 다시 시도해주세요.");
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
    }
    generationJwt(); // 함수 실행
  }, [navigate]);

  return (
    <div>
      <h2>Main Screen</h2>
      <p>Welcome to the main screen!</p>
      <p>Logged in as: {useridRef.current}</p>
      <p>You are key:</p>
      <p>
        http://{config.SERVER_URL}/api/data?jwt={jwtString}&pageNo=1&numOfRows=10&foodNm=
      </p>

      {/* 에러 메시지 표시 (있는 경우에만) */}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
};

export default ApiHandlerPage;
