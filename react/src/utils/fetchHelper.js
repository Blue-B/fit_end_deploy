const fetchHelper = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);

    // /api/data 요청인 경우, 상태 코드와 상관없이 응답을 그대로 반환하도록 함
    if (url.includes("/api/data")) {
      return response;
    }

    if (!response.ok) {
      // 실패한 경우 상태 코드에 맞는 리디렉션 문자열 반환
      if (response.status === 404) {
        return "404";
      } else if (response.status === 500) {
        return "500";
      } else if (response.status === 503) {
        return "503";
      } else {
        return response;
      }
    }
    return response;
  } catch (error) {
    console.error("네트워크 오류 발생!", error);
    return "network-error";
  }
};

export default fetchHelper;
