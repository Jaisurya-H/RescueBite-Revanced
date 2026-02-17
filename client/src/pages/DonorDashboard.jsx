import { useEffect, useState } from "react";
import API from "../lib/api";

const DonorDashboard = () => {
    const [foods, setFoods] = useState([]);
    const [form, setForm] = useState({
        title: "",
        quantity: "",
        location: "",
        description: "",
    });

    const fetchMyFoods = async () => {
        try {
            const res = await API.get("/food");
            const token = localStorage.getItem("token");
            if (token) {
                const payload = JSON.parse(atob(token.split(".")[1]));
                const myFoods = res.data.filter(
                    (food) => food.donor?._id === payload.id || food.donor === payload.id
                );
                setFoods(myFoods);
            }
        } catch (error) {
            console.error("Error fetching foods", error);
        }
    };

    useEffect(() => {
        fetchMyFoods();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post("/food", form);
            setForm({ title: "", quantity: "", location: "", description: "" });
            fetchMyFoods();
        } catch (error) {
            alert("Error posting food");
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-white">Donor Dashboard</h2>

            <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow space-y-4">
                <input
                    name="title"
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Food Title"
                    value={form.title}
                    onChange={handleChange}
                    required
                />
                <input
                    name="quantity"
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                />
                <input
                    name="location"
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Location"
                    value={form.location}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="description"
                    className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors">
                    Post Food
                </button>
            </form>

            <div>
                <h3 className="text-xl font-semibold mb-4 text-white">My Foods</h3>
                <div className="space-y-3">
                    {foods.map((food) => (
                        <div key={food._id} className="bg-gray-800 p-4 rounded-lg shadow border border-gray-700">
                            <h4 className="font-bold text-lg text-blue-400">{food.title}</h4>
                            <p className="text-gray-300">Quantity: {food.quantity}</p>
                            <p className="text-gray-300">
                                Status: <span className={`font-semibold ${food.status === 'Available' ? 'text-green-400' : 'text-yellow-400'}`}>{food.status}</span>
                            </p>
                        </div>
                    ))}
                    {foods.length === 0 && <p className="text-gray-500">No foods posted yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default DonorDashboard;
