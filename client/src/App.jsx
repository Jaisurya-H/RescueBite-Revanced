import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FoodListings from "./pages/FoodListings";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white">

        {/* Navbar */}
        <nav className="bg-gray-800 p-4 flex gap-6 text-blue-400 font-medium">
          <Link to="/register" className="hover:text-blue-300">
            Register
          </Link>
          <Link to="/" className="hover:text-blue-300">
            Login
          </Link>
          <Link to="/food" className="hover:text-blue-300">
            Food Listings
          </Link>
        </nav>

        {/* Page Content */}
        <div className="p-8">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/food" element={<FoodListings />} />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;