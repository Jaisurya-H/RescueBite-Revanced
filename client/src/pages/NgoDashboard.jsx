import { useEffect, useState } from "react";
import API from "../lib/api";

const NgoDashboard = () => {
    const [foods, setFoods] = useState([]);

    const fetchFoods = async () => {
        try {
            const res = await API.get("/food");
            setFoods(res.data);
        } catch (error) {
            console.error("Error fetching foods", error);
        }
    };

    useEffect(() => {
        fetchFoods();
    }, []);

    const acceptFood = async (id) => {
        try {
            await API.put(`/food/${id}/accept`);
            fetchFoods();
        } catch (error) {
            alert("Error accepting food");
        }
    };

    const collectFood = async (id) => {
        try {
            await API.put(`/food/${id}/collect`);
            fetchFoods();
        } catch (error) {
            alert("Error collecting food");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-white">NGO Dashboard</h2>

            <div className="space-y-4">
                {foods.map((food) => (
                    <div key={food._id} className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-xl text-blue-400">{food.title}</h3>
                                <p className="text-gray-300">Location: {food.location}</p>
                                <p className="text-gray-300">Quantity: {food.quantity}</p>
                                <p className="text-gray-300">Status: <span className="font-semibold text-white">{food.status}</span></p>
                                {food.description && <p className="text-gray-400 text-sm mt-1">{food.description}</p>}
                            </div>
                            <div className="flex flex-col gap-2">
                                {(food.status === "Available" || !food.status) && (
                                    <button
                                        onClick={() => acceptFood(food._id)}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1 rounded transition-colors"
                                    >
                                        Accept
                                    </button>
                                )}

                                {food.status === "Accepted" && (
                                    <button
                                        onClick={() => collectFood(food._id)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded transition-colors"
                                    >
                                        Mark Collected
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {foods.length === 0 && <p className="text-gray-500">No food listings available.</p>}
            </div>
        </div>
    );
};

export default NgoDashboard;
