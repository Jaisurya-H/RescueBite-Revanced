import { useState } from "react";
import API from "../lib/api";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        contactNumber: "",
        location: "",
        role: "Donor"
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/auth/register", formData);
            alert(res.data.message);
        } catch (error) {
            alert(error.response?.data?.message || "Error");
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <input name="name" placeholder="Name" onChange={handleChange} required />
                <input name="email" placeholder="Email" onChange={handleChange} required />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                <input name="contactNumber" placeholder="Contact Number" onChange={handleChange} required />
                <input name="location" placeholder="Location" onChange={handleChange} required />
                <select name="role" onChange={handleChange}>
                    <option value="Donor">Donor</option>
                    <option value="NGO">NGO</option>
                </select>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
