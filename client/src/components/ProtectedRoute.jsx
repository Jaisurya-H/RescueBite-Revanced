import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem("token");

    if (!token) return <Navigate to="/" />;

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        if (role && payload.role !== role) {
            return <Navigate to="/" />;
        }
    } catch (e) {
        localStorage.removeItem("token");
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
