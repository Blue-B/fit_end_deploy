import config from "../config";

// 데이터베이스에서 csv에있는 음식 데이터를 추가하는 ClickThis 컴포넌트
const ClickThis = () => {
  // 버튼 클릭 시 호출되는 함수
  const handleClick = async () => {
    try {
      // 백엔드의 /food/up 엔드포인트에 GET 요청을 보냄
      const response = await fetch(`http://${config.SERVER_URL}/food/up`, {
        credentials: "include",
      });

      //응답 실패시 에러발생
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      //요청이 정상적으로 전송된 경우 콘손에 메세지 표시
      console.log("Request sent successfully");
    } catch (error) {
      //네트워크 오류나 서버 오류 발생시 콘솔에 메세지 표시 
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Send Request</button>
    </div>
  );
};

export default ClickThis;
