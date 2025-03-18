import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Register from "./Component/Register";
import Login from "./Component/Login";
import Main from "./Component/Main"; // 메인 화면 컴포넌트
import RecordBody from "./Component/RecordBody";
import Graph from "./Component/Graph";
import RankPage from "./Component/RankPage";
import TodoCalender from "./Component/TodoCalender";
import ClickThis from "./Component/ClickThis";
import FoodSearchR from "./Component/FoodSearchR";
import MealTimingselect from "./Component/MealTimingselect";
 
import Error404 from "./Component/Error404";
import Error500 from "./Component/Error500";
import Error503 from "./Component/Error503.js";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="/" element={<Login />} />
        <Route path="/recordbody" element={<RecordBody />} />
        <Route path="/rank" element={<RankPage />} />
        <Route path="/food" element={<FoodSearchR />} />
        <Route path="/todo" element={<TodoCalender />} />
        <Route path="/ClickThis" element={<ClickThis />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="/FoodSearchR" element={<FoodSearchR />} />
        <Route path="/MealTimingselect" element={<MealTimingselect/>}/>
        <Route path="/error/404" element={<Error404 />} />
        <Route path="/error/500" element={<Error500 />} />
        <Route path="/error/503" element={<Error503 />} />
        <Route path="*" element={<Error404 />} />
      </Routes>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
