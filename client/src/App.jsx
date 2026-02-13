import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useEffect } from "react";
import socket from "./lib/socket";
import Register from "./pages/Register";
import Login from "./pages/Login";
import FoodListing from "./pages/FoodListing";

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("newFood", (data) => {
      alert(data.message);
    });

    socket.on("foodAccepted", (data) => {
      alert(data.message);
    });

    socket.on("foodCollected", (data) => {
      alert(data.message);
    });

    return () => {
      socket.off("connect");
      socket.off("newFood");
      socket.off("foodAccepted");
      socket.off("foodCollected");
    };
  }, []);

  return (
    <Router>
      <nav style={{ padding: "10px", background: "#eee", marginBottom: "20px" }}>
        <Link to="/register" style={{ marginRight: "10px" }}>Register</Link>
        <Link to="/login" style={{ marginRight: "10px" }}>Login</Link>
        <Link to="/food">Food Listings</Link>
      </nav>

      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/food" element={<FoodListing />} />
      </Routes>
    </Router>
  );
}

export default App;
