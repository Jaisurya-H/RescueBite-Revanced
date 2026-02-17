import { Link } from "react-router-dom";

const Navbar = () => {
    const token = localStorage.getItem("token");

    return (
        <nav className="bg-gray-800 p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-400">
                <Link to="/">RescueBite</Link>
            </h1>

            <div className="flex gap-4">
                {!token ? (
                    <>
                        <Link to="/" className="text-gray-300 hover:text-white transition-colors">Login</Link>
                        <Link to="/register" className="text-gray-300 hover:text-white transition-colors">Register</Link>
                    </>
                ) : (
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.href = "/";
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                    >
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
