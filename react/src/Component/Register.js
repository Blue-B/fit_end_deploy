import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 훅
import config from "../config";
import styles from "../Style/register.module.css";

export default function Register() {
  const navigate = useNavigate(); // 페이지이동 userNavigate()

  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  const [isPostcodeLoaded, setIsPostcodeLoaded] = useState(false);

  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const [userInfo, setUserInfo] = useState({
    userid: "",
    password: "",
    email: "",
    sex: "",
    region1: "",
    region2: "",
    birth: "",
  });

  // 현재 날짜 기준으로 최소 1년 전 날짜 계산 (오늘 날짜나 미래 날짜 선택시 데이터베이스에 부적절한 값이 적용됨)
  const minBirthDate = new Date();
  minBirthDate.setFullYear(minBirthDate.getFullYear() - 100); // 최대 100년 전까지 입력 가능
  const maxBirthDate = new Date();
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 1); // 최소 1살부터 가입 가능

  useEffect(() => {
    const kakaoApiKey = process.env.REACT_APP_KAKAO_API_KEY;
    if (!kakaoApiKey) {
      console.error(
        "🚨 Kakao API 키가 설정되지 않았습니다! .env 파일을 확인하세요."
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&libraries=services`;
    script.async = true;
    script.onload = () => setIsKakaoLoaded(true);
    script.onerror = () => console.error("🚨 Kakao Map API 로드 실패!");

    document.head.appendChild(script);

    const loadPostcodeScript = () => {
      if (window.daum && window.daum.Postcode) {
        setIsPostcodeLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.async = true;
      script.onload = () => setIsPostcodeLoaded(true);
      script.onerror = () => console.error("🚨 우편번호 API 로드 실패!");

      document.body.appendChild(script);
    };

    loadPostcodeScript();
  }, []);
  useEffect(() => {
    // 모든 필수 필드가 채워져 있고 중복 체크가 완료되었는지 확인
    const isAllFieldsFilled =
      userInfo.userid &&
      userInfo.password &&
      userInfo.email &&
      userInfo.sex &&
      userInfo.region1 &&
      userInfo.region2 &&
      userInfo.birth;

    setIsFormValid(isAllFieldsFilled && isDuplicateChecked);
  }, [userInfo, isDuplicateChecked]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "userid" || name === "email") {
      setIsDuplicateChecked(false);
    }
    setUserInfo({
      ...userInfo,
      [name]: value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `http://${config.SERVER_URL}/userinfo/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userInfo),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          navigate("/error/404");
        } else if (response.status === 500) {
          navigate("/error/500");
        } else if (response.status === 503) {
          navigate("/error/503");
        } else {
          throw new Error("회원가입 실패");
        }
      } else {
        alert("회원가입이 성공적으로 완료되었습니다.");
        console.log("User registered successfully");
        navigate("/login");
      }
    } catch (error) {
      alert("서버 오류 발생! 관리자에게 문의하세요.");
      console.error("Error:", error);
      navigate("/error/500");
    }
  };

  const handleAddressSearch = () => {
    if (!isKakaoLoaded || !isPostcodeLoaded) {
      alert(
        "🚨 카카오맵 API 또는 우편번호 API가 아직 완전히 로드되지 않았습니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }

    if (!window.daum || !window.daum.Postcode) {
      alert(
        "🚨 우편번호 검색 API가 아직 로드되지 않았습니다. 새로고침 후 다시 시도해주세요."
      );
      return;
    }

    new window.daum.Postcode({
      oncomplete: function (data) {
        setUserInfo({ ...userInfo, region1: data.sido, region2: data.sigungu });
      },
    }).open();
  };

  const checkUseridEmail = async (e) => {
    e.preventDefault(); // 버튼 클릭 시 폼 제출 방지

    // 아이디나 이메일이 비어있는지 확인
    if (!userInfo.userid || !userInfo.email) {
      alert("아이디와 이메일을 모두 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(
        `http://${config.SERVER_URL}/userinfo/checkUseridEmail`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userid: userInfo.userid,
            email: userInfo.email,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("중복 체크 중 오류가 발생했습니다.");
      }

      const result = await response.json();

      // 중복 체크 결과 처리
      if (result.isUseridExists && result.isEmailExists) {
        alert("아이디와 이메일이 모두 이미 사용 중입니다.");
        setIsDuplicateChecked(false);
      } else if (result.isUseridExists) {
        alert("이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.");
        setIsDuplicateChecked(false);
      } else if (result.isEmailExists) {
        alert("이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.");
        setIsDuplicateChecked(false);
      } else {
        alert("사용 가능한 아이디와 이메일입니다.");
        setIsDuplicateChecked(true);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("중복 체크 중 오류가 발생했습니다: " + error.message);
      setIsDuplicateChecked(false);
    }
  };

  return (
    <div className={styles["Register_Container"]}>
      <div className={styles["Main_container"]}>
        <div className={styles["Main_image"]}>
          <img
            src="/image/RegisterImage.jpg"
            alt="Background"
            className={styles["RegisterImage"]}
          />
          <img
            src="/image/Vector9.png"
            alt="Overlay"
            className={styles["RegisterImage_Vector"]}
          />
        </div>
      </div>
      <h2 className={styles["Register_Title"]}>SIGN UP</h2>
      <form className={styles["form"]} onSubmit={handleSubmit}>
        <div>
          <label className={styles["USERID"]}>UserId:</label>
          <input
            className={styles["input_text"]}
            type="text"
            name="userid"
            value={userInfo.userid}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className={styles["PASSWORD"]}>Password:</label>
          <input
            className={styles["input_text"]}
            type="password"
            name="password"
            value={userInfo.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className={styles["EMAIL"]}>Email:</label>
          <input
            className={styles["input_text"]}
            type="email"
            name="email"
            value={userInfo.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className={styles["SEXUAL_SELECTION"]}>SEXUAL SELECTION</label>
          <div className={styles["gender-selection"]}>
            <label>
              <input
                type="radio"
                name="sex"
                value="1"
                checked={userInfo.sex === "1"}
                onChange={handleChange}
                required
              />
              남자
            </label>
            <label>
              <input
                type="radio"
                name="sex"
                value="2"
                checked={userInfo.sex === "2"}
                onChange={handleChange}
                required
              />
              여자
            </label>
          </div>
        </div>

        <div className={styles["중복체크"]}>
          <button
            type="button"
            className={styles["추후수정 요망"]}
            onClick={checkUseridEmail}
          >
            아이디/이메일 중복 체크
          </button>
        </div>
        <div>
          <label className={styles["PROVINCE"]}>Province:</label>
          <input
            className={styles["input_text"]}
            type="text"
            name="region1"
            value={userInfo.region1}
            readOnly
          />
        </div>
        <div>
          <label className={styles["CITY"]}>
            City:
            <button
              className={styles["CITY_Button"]}
              type="button"
              onClick={handleAddressSearch}
            >
              주소 검색
            </button>
          </label>
          <input
            className={styles["input_text"]}
            type="text"
            name="region2"
            value={userInfo.region2}
            readOnly
          />
        </div>
        <div>
          <label className={styles["BIRTH"]}>Birth:</label>
          <input
            className={styles["input_text"]}
            type="date"
            name="birth"
            value={userInfo.birth}
            onChange={handleChange}
            min={minBirthDate.toISOString().split("T")[0]} // 최대 100년 전까지 입력 가능
            max={maxBirthDate.toISOString().split("T")[0]} // 최소 1살부터 가입 가능
            required
          />
        </div>
        <button
          className={styles["Register_Button"]}
          type="submit"
          disabled={!isFormValid}
          style={{
            backgroundColor: isFormValid ? "#4CAF50" : "#cccccc",
            cursor: isFormValid ? "pointer" : "not-allowed",
          }}
        >
          회원가입
        </button>
      </form>
      {!isDuplicateChecked && (
        <p className={styles["추후수정"]}>
          아이디와 이메일 중복 체크를 완료해야 회원가입이 가능합니다.
        </p>
      )}
    </div>
  );
}
