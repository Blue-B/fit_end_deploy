import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../config";
import styles from "../Style/recordbody.module.css";

export default function RecordBody() {
  const navigate = useNavigate();
  const [userid, setUserid] = useState("");
  const [selectedSex, setSelectedSex] = useState(null);

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [fatpercentage, setFatPercentage] = useState("");


  const navigateMain = () => {navigate("/main");};
  const navigateToRecordBody = () => {navigate("/recordbody");};
  const navigateFood=() => {navigate("/FoodSearchR");};
  const navigateGraph = () => {navigate("/Graph")};

  // 로그아웃 처리
  const handleLogout = async () => {
    await fetch(`http://${config.SERVER_URL}/login/logout`, {
      method: "POST",
      credentials: "include",
    });

    sessionStorage.removeItem("userid");
    navigate("/login");
  };


  useEffect(() => {
    // 현재 로그인된 유저 확인
    fetch(`http://${config.SERVER_URL}/login/validate`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error("Unauthorized");
        return response.json();
      })
      .then((data) => {
        console.log("로그인 확인 성공:", data);
        setUserid(data.userid);
        setSelectedSex(data.sex.toString());  // API 성별 가져오기
      })
      .catch(() => {
        console.warn("인증 실패. 로그인 페이지로 이동");
        navigate("/login");
      });
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userBodyInfo = {
      userid,
      height: parseFloat(height),
      weight: parseFloat(weight),
      fatpercentage: parseFloat(fatpercentage),
    };


    console.log("📌 보내는 데이터:", userBodyInfo);

    try {
      const response = await fetch(`http://${config.SERVER_URL}/userinfobody/recorduserbody`, {
        method: "POST",
        credentials: "include", // 쿠키 포함 요청
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userBodyInfo),
      });

      if (response.ok) {
        alert("신체 정보가 저장되었습니다! 메인 페이지로 이동합니다.");
        navigate("/graph");
      } else {
        alert("신체 정보 저장 실패! 다시 시도해주세요.");
      }
    } catch (error) {
      alert("서버 오류 발생! 관리자에게 문의하세요.");
      console.error("Error:", error);
    }
  };

  return (
    <div className={styles["RecordBody_Container"]}>
      <img
        src={selectedSex === "1" ? "/image/man.png" : "/image/woman.png"}
        alt="backgroundimage"
        className={styles["RecordBodyImage"]}
      />
      <img src="/image/Rectangle22.png" alt="backgroudvector" className={styles["RecordBodyvector"]} />
      <a className={styles["RecordBodyTitle"]}>FitEnd</a>
      <h2 className={styles["RecordBody_Title"]}>
        {selectedSex === "1"
          ? "MAN BMI INPUT"
          : selectedSex === "2"
          ? "WOMAN BMI INPUT"
          : "Please select your gender"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label className={styles["Height"]}>Height (cm)</label>
          <input className={styles["input_text"]} type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} required />
          <label className={styles["Weight"]}>Weight (kg)</label>
          <input className={styles["input_text"]} type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required />
          <label className={styles["Fat"]}>Fat Percentage (%)</label>
          <input className={styles["input_text"]} type="number" step="0.1" value={fatpercentage} onChange={(e) => setFatPercentage(e.target.value)} required />
        </div>
        <button className={styles["RecordBody_Submit_Button"]} type="submit" onClick={navigateGraph}>Submit</button>
      </form>
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
          <img src="/image/Vector7.png" alt="rank" className={styles["ButtonImage"]} onClick={navigateGraph} />
          <span className={styles["Span"]}>Graph</span>
        </div>

        <div className={styles["Button-Item"]}>
          <img src="/image/Vector8.png" alt="Food" className={styles["ButtonImage"]} onClick={navigateFood} />
          <span className={styles["Span"]}>Food</span>
        </div>

        <div className={styles["Button-Item"]}>
          <img src="/image/PEOPLE.png" alt="Logout" className={styles["ButtonImage"]} onClick={handleLogout} />
          <span className={styles["Span"]}>Logout</span>
        </div>
      </div>
    </div>
);
}