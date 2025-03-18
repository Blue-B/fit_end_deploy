const fetchHelper = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
  
      if (!response.ok) {
        // 실패한 경우 상태 코드에 맞는 리디렉션
        if (response.status === 404) {
          return "404"; // 404 오류 반환
        } else if (response.status === 500) {
          return "500"; // 500 오류 반환
        } else if (response.status === 503) {
          return "503"; // 503 오류 반환
        } else {
          return response; // 다른 상태코드에 대해서는 응답 그대로 반환
        }
      }
  
      return response; // 정상 응답 반환
    } catch (error) {
      console.error("네트워크 오류 발생!", error);
      return "network-error"; // 네트워크 오류 발생 시
    }
  };
  
  export default fetchHelper;
  