import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/api";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/auth/login", formData);
            localStorage.setItem("token", res.data.token);
            alert("Login successful");

            // Redirect based on role
            const payload = JSON.parse(atob(res.data.token.split(".")[1]));
            if (payload.role === "Donor") {
                navigate("/donor-dashboard");
            } else if (payload.role === "NGO") {
                navigate("/ngo-dashboard");
            } else if (payload.role === "Admin") {
                navigate("/admin-dashboard");
            }
        } catch (error) {
            alert(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input name="email" placeholder="Email" onChange={handleChange} required />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
