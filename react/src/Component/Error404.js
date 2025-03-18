import React from "react";
import { X, Plus, Circle } from "lucide-react";
import '../Style/Error404.css'; // CSS 파일

const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="phone-frame">
        <div className="phone-notch"></div>
        <div className="content-container">
          <X className="icon-left-top" />
          <X className="icon-right-middle" />
          <Plus className="icon-left-middle" />
          <Plus className="icon-right-bottom" />
          <Circle className="icon-right-center" />
          <Circle className="icon-left-center" />
          <Circle className="icon-left-bottom" />

          <h1 className="main-text">404</h1>
          <h2 className="sub-text">Sorry..</h2>
          <p className="page-not-found">Page Not Found</p>
          <p className="error-message">Something went wrong. Please try again.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
