import React, { useState, useEffect } from "react";
import config from "../config";
import { useNavigate } from "react-router-dom";
import styles from "../Style/rankpage.module.css";

export default function RankPage() {
  const [maleRank, setMaleRank] = useState([]);
  const [femaleRank, setFemaleRank] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGender, setSelectedGender] = useState("male"); // 기본값: 남성 랭킹
  const [randomImages, setRandomImages] = useState([]); // 랜덤 이미지 저장
  const userid = sessionStorage.getItem("userid");

  // 🐶 강아지 & 🐱 고양이 이미지 리스트
  const dogImages = [
    "/image/rankimage/bog/KakaoTalk_20250316_002701861_06.jpg",
    "/image/rankimage/bog/KakaoTalk_20250316_002701861_09.jpg",
    "/image/rankimage/bog/KakaoTalk_20250316_002701861_10.jpg",
    "/image/rankimage/bog/KakaoTalk_20250316_003826799_01.jpg",
    "/image/rankimage/bog/KakaoTalk_20250316_003826799_02.jpg",
    "/image/rankimage/bog/KakaoTalk_20250316_003826799_03.jpg",
    "/image/rankimage/bog/KakaoTalk_20250316_003826799_04.jpg",
    "/image/rankimage/bog/KakaoTalk_20250316_003826799_05.jpg",
    "/image/rankimage/bog/KakaoTalk_20250316_003826799_06.jpg",
    "/image/rankimage/bog/KakaoTalk_20250316_003826799_07.jpg",
    "/image/rankimage/bog/KakaoTalk_20250316_003826799_08.jpg",
    "/image/rankimage/bog/KakaoTalk_20250316_003826799_09.jpg",
    "/image/rankimage/bog/KakaoTalk_20250316_003826799_10.jpg",
    "/image/rankimage/bog/KakaoTalk_20250316_003826799.jpg",
  ];

  const catImages = [
    "/image/rankimage/KakaoTalk_20250316_002701861_03.jpg",
    "/image/rankimage/KakaoTalk_20250316_002701861_05.jpg",
    "/image/rankimage/KakaoTalk_20250316_002901935_01.jpg",
    "/image/rankimage/KakaoTalk_20250316_002901935_02.jpg",
    "/image/rankimage/KakaoTalk_20250316_002901935_03.jpg",
    "/image/rankimage/KakaoTalk_20250316_002901935_04.jpg",
    "/image/rankimage/KakaoTalk_20250316_002901935_05.jpg",
    "/image/rankimage/KakaoTalk_20250316_002901935.jpg",
    "/image/rankimage/KakaoTalk_20250316_004049803.jpg",
    "/image/rankimage/KakaoTalk_20250316_004146870_02.jpg",
    "/image/rankimage/KakaoTalk_20250316_004146870_03.jpg",
    "/image/rankimage/KakaoTalk_20250316_004146870.jpg",
  ];

  const navigate = useNavigate();
  const navigateMain = () => navigate("/main");
  const navigateToRecordBody = () => navigate("/recordbody");
  const navigateCalender = () => navigate("/Calender");
  const navigateGraph = () => navigate("/Graph");
  const navigateMyPage = () => navigate("/MyPage");

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
        sessionStorage.removeItem("userid");
        navigate("/login");
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
      navigate("/error/500");
    }
  };

  // 성별 선택 핸들러 (랜덤 이미지 3개 선택)
  const handleGenderSelection = (gender) => {
    setSelectedGender(gender);

    // 선택된 성별에 따라 강아지 or 고양이 이미지에서 3개 랜덤 선택
    const images = gender === "male" ? dogImages : catImages;
    const shuffled = [...images].sort(() => 0.5 - Math.random());
    setRandomImages(shuffled.slice(0, 3));
  };

  // 초기 렌더링 시 성별에 맞는 랜덤 이미지 설정
  useEffect(() => {
    handleGenderSelection(selectedGender);
  }, [selectedGender]);

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        // 남성 랭킹 데이터 가져오기
        const maleResponse = await fetch(
          `http://${config.SERVER_URL}/userinfobody/scorerankmale/${userid}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!maleResponse.ok) {
          if (maleResponse.status === 404) {
            navigate("/error/404");
          } else if (maleResponse.status === 500) {
            navigate("/error/500");
          } else if (maleResponse.status === 503) {
            navigate("/error/503");
          } else {
            throw new Error("남성 랭킹 데이터 가져오기 실패");
          }
        }

        const maleData = await maleResponse.json();
        setMaleRank(maleData);

        // 여성 랭킹 데이터 가져오기
        const femaleResponse = await fetch(
          `http://${config.SERVER_URL}/userinfobody/scorerankfemale/${userid}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!femaleResponse.ok) {
          if (femaleResponse.status === 404) {
            navigate("/error/404");
          } else if (femaleResponse.status === 500) {
            navigate("/error/500");
          } else if (femaleResponse.status === 503) {
            navigate("/error/503");
          } else {
            throw new Error("여성 랭킹 데이터 가져오기 실패");
          }
        }

        const femaleData = await femaleResponse.json();
        setFemaleRank(femaleData);
        setLoading(false);
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
        setError(error.message);
        setLoading(false);
        navigate("/error/500");
      }
    };

    fetchRankingData();
  }, [navigate]);

  if (loading) return <p>📡 데이터를 불러오는 중입니다...</p>;
  if (error) return <p>⚠️ 오류 발생: {error}</p>;

  const rankings = selectedGender === "male" ? maleRank : femaleRank;

  return (
    <div className={styles["Main_Container"]}>
      <a className={styles["RecordBodyTitle"]}>FitEnd</a>
      <img
        src="/image/backgroundImage/Rectangle23.png"
        alt="Background"
        className={styles["MainImage"]}
      />
      <img
        src="/image/backgroundImage/별배경.png"
        alt="Background"
        className={styles["MainImage_Top"]}
      />
      <a className={styles["RecordBodyMainTitle"]}>Ranking</a>

      {/* 🚀 1~3등 프로필 */}
      <div className={styles["top-rank-container"]}>
        {[1, 0, 2].map((rank, index) => {
          const bgColor =
            rank === 1 ? "#5AE7F8" : rank === 0 ? "#FCF600" : "#F4A2F6";

          return (
            <div
              key={rank}
              className={`${styles["rank-profile"]} ${
                styles[`rank-${rank + 1}`]
              }`}
            >
              <div
                className={`${styles["big-circle"]}`}
                style={{ backgroundColor: bgColor }}
              ></div>
              <img
                src={
                  rankings[rank] && rankings[rank].profileImage
                    ? rankings[rank].profileImage
                    : randomImages[index] || "/image/default_img.jpg"
                }
                className={styles["profile-image"]}
                alt={`Rank ${rank + 1}`}
              />
              <div
                className={`${styles["small-circle"]}`}
                style={{ backgroundColor: bgColor }}
              ></div>
              <p className={styles["rank-name"]}>
                {rankings[rank] ? rankings[rank].userid : "Unknown"}
              </p>
            </div>
          );
        })}
      </div>

      {/* 🚀 남자/여자 랭킹 선택 버튼 */}
      <div className={styles["gender-buttons"]}>
        <button
          className={`${styles["gender-btn"]} ${
            selectedGender === "male" ? styles["active"] : ""
          }`}
          onClick={() => handleGenderSelection("male")}
        >
          <a className={styles["genderbtn_title"]}>MAN</a>
        </button>
        <button
          className={`${styles["gender-btn"]} ${
            selectedGender === "female" ? styles["active"] : ""
          }`}
          onClick={() => handleGenderSelection("female")}
        >
          <a className={styles["genderbtn_title"]}>WOMAN</a>
        </button>
      </div>

      {/* 🚀 랭킹 리스트 */}
      <div
        className={styles["ranking_list"]}
        style={{ maxHeight: "400px", overflowY: "auto" }}
      >
        {rankings.slice(0, 50).map((user, index) => (
          <div key={index} className={styles["ranking-item"]}>
            <span className={styles["rank-position"]}>{index + 1}.</span>   
            <span className={styles["user-id"]}>{user.userid}</span>
            <span className={styles["user-score"]}>
              POINT: {user.inbodyScore}
            </span>
          </div>
        ))}
      </div>

      {/* 🚀 하단 네비게이션 버튼 */}
      <div className={styles["Button-Container"]}>
        <div className={styles["Button-Item"]}>
          <img
            src="/image/HOME.png"
            alt="Main"
            className={styles["ButtonImage"]}
            onClick={navigateMain}
          />
          <span className={styles["Span"]}>Main</span>
        </div>

        <div className={styles["Button-Item"]}>
          <img
            src="/image/PAPAR.png"
            alt="Paper"
            className={styles["ButtonImage"]}
            onClick={navigateToRecordBody}
          />
          <span className={styles["Span"]}>Paper</span>
        </div>

        <div className={styles["Button-Item"]}>
          <img
            src="/image/Vector7.png"
            alt="Graph"
            className={styles["ButtonImage"]}
            onClick={navigateGraph}
          />
          <span className={styles["Span"]}>Graph</span>
        </div>

        <div className={styles["Button-Item"]}>
          <img
            src="/image/Vector8.png"
            alt="Food"
            className={styles["ButtonImage"]}
            onClick={navigateCalender}
          />
          <span className={styles["Span"]}>Food</span>
        </div>

        <div className={styles["Button-Item"]}>
          <img
            src="/image/PEOPLE.png"
            alt="Logout"
            className={styles["ButtonImage"]}
            onClick={navigateMyPage}
          />
          <span className={styles["Span"]}>Mypage</span>
        </div>
      </div>
    </div>
  );
}
