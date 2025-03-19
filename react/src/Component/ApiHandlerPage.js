import React, { useState, useEffect, useRef } from "react";
import config from "../config";

const ApiHandlerPage = () => {
  const [jwtString, setJwtString] = useState("");
  const useridRef = useRef(sessionStorage.getItem("userid"));

  // 컴포넌트 마운트 시 JWT 생성
  useEffect(() => {
    async function generationJwt() {
      try {
        const response = await fetch(`http://${config.SERVER_URL}/userinfo/generation`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userid: useridRef.current }),
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const token = await response.text();
        setJwtString(token);
        console.log("Received JWT:", token);
      } catch (error) {
        console.error("JWT 생성 중 에러 발생:", error);
      }
    }
    generationJwt();
  }, []);

  return (
    <div>
      <h2>Main Screen</h2>
      <p>Welcome to the main screen!</p>
      <p>Logged in as: {useridRef.current}</p>
      <p>You are key:</p>
      <p>
        http://{config.SERVER_URL}/api/data?jwt={jwtString}&pageNo=1&numOfRows=10&foodNm=
      </p>
    </div>
  );
};

export default ApiHandlerPage;
