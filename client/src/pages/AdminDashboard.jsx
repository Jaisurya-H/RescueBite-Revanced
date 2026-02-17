import { useEffect, useState } from "react";
import API from "../lib/api";

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, foods: 0, collected: 0 });

    const fetchStats = async () => {
        try {
            const res = await API.get("/admin/dashboard");
            setStats(res.data);
        } catch (error) {
            console.error("Error fetching stats", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-white">Admin Dashboard</h2>

            <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-gray-300 text-lg">Total Users</span>
                    <span className="text-2xl font-bold text-blue-400">{stats.users}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-gray-300 text-lg">Total Foods</span>
                    <span className="text-2xl font-bold text-green-400">{stats.foods}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-lg">Collected Foods</span>
                    <span className="text-2xl font-bold text-purple-400">{stats.collected}</span>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
