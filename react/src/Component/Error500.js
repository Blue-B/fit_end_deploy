import React from "react";
import { X, Plus, Circle } from "lucide-react";
import '../Style/Error404.css'; // CSS 파일

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="phone-frame">
        <div className="phone-notch"></div>
        <div className="content-container">


          <img 
            src="/image/500.png" 
            alt="500_error" 
            style={{ width: "500px", height: "auto", marginTop: "-15vh", marginBottom: "10px" }} // 사진 여백 조정
          />
          <h2 className="sub-text" style={{ marginTop: "-120px" }}>Ooops!</h2> {/* 텍스트 상단 여백 줄이기 */}
          <p className="page-not-found">No Internet Connection</p>
          <p className="error-message">Check Your Connection<br />Please try again</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
