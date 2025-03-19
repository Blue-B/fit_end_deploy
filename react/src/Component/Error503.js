import React from "react";
import { X, Plus, Circle } from "lucide-react";
import '../Style/Error404.css'; // CSS 파일

const NotFound = () => {
  return (
    <div className="notfound-container">
        <div className="phone-notch"></div>
        <div className="content-container">


          <img 
            src="/image/opps.png" 
            alt="503_error" 
            style={{ width: "700px", height: "auto", marginTop: "-20vh", marginBottom: "10px" }} // 사진 여백 조정
          />
          <h2 className="sub-text" style={{ marginTop: "-120px" }}>Ooops!</h2> {/* 텍스트 상단 여백 줄이기 */}
          <p className="page-not-found">Under Maintenance</p>
          <p className="error-message">We are preparing to serve you better.<br />We'll back shortly.</p>
        </div>
    </div>
  );
};

export default NotFound;
