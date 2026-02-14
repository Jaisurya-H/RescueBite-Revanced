import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/api";

const FoodListings = () => {
    const navigate = useNavigate();
    const [foods, setFoods] = useState([]);
    const [formData, setFormData] = useState({
        foodType: "",
        quantity: "",
        preparationTime: "",
        pickupLocation: "",
        description: ""
    });

    const fetchFoods = useCallback(async () => {
        try {
            const res = await API.get("/food");
            setFoods(res.data);
        } catch (error) {
            console.error("Error fetching foods:", error);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchFoods();
    }, [navigate, fetchFoods]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const postFood = async (e) => {
        e.preventDefault();
        try {
            await API.post("/food", formData);
            alert("Food posted successfully");
            fetchFoods();
            // Clear form
            setFormData({
                foodType: "",
                quantity: "",
                preparationTime: "",
                pickupLocation: "",
                description: ""
            });
        } catch (error) {
            alert(error.response?.data?.message || "Error posting food");
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <h1 className="text-3xl font-bold text-white">Food Listings</h1>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
                <h2 className="text-xl font-semibold text-white">Post Food</h2>
                <form onSubmit={postFood} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            name="foodType"
                            placeholder="Food Type"
                            value={formData.foodType}
                            onChange={handleChange}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                            name="quantity"
                            type="number"
                            placeholder="Quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                            name="preparationTime"
                            type="datetime-local"
                            value={formData.preparationTime}
                            onChange={handleChange}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                            name="pickupLocation"
                            placeholder="Pickup Location"
                            value={formData.pickupLocation}
                            onChange={handleChange}
                            required
                            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                        rows="3"
                    ></textarea>
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    >
                        Post Food
                    </button>
                </form>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-4 text-white">Available Foods</h2>
                <ul className="space-y-4">
                    {foods.map((food) => (
                        <li key={food._id} className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-blue-400">{food.foodType}</h3>
                                    <p className="text-gray-300">
                                        <span className="font-semibold">Quantity:</span> {food.quantity}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="font-semibold">Location:</span> {food.pickupLocation}
                                    </p>
                                    {food.description && (
                                        <p className="text-gray-400 mt-2 text-sm">{food.description}</p>
                                    )}
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${food.status === "available"
                                            ? "bg-green-600 text-green-100"
                                            : "bg-yellow-600 text-yellow-100"
                                        }`}
                                >
                                    {food.status || 'Available'}
                                </span>
                            </div>
                        </li>
                    ))}
                    {foods.length === 0 && (
                        <p className="text-gray-500">No food listings available.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default FoodListings;
