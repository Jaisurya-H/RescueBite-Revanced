import { useState, useEffect } from "react";
import API from "../lib/api";

const FoodListing = () => {
    const [foods, setFoods] = useState([]);
    const [formData, setFormData] = useState({
        foodType: "",
        quantity: "",
        preparationTime: "",
        pickupLocation: "",
        description: ""
    });

    useEffect(() => {
        fetchFoods();
    }, []);

    const fetchFoods = async () => {
        try {
            const res = await API.get("/food");
            setFoods(res.data);
        } catch (error) {
            console.error("Error fetching foods:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const postFood = async (e) => {
        e.preventDefault();
        try {
            await API.post("/food", formData);
            alert("Food posted successfully");
            fetchFoods();
        } catch (error) {
            alert(error.response?.data?.message || "Error posting food");
        }
    };

    return (
        <div>
            <h2>Food Listings</h2>

            <h3>Post Food</h3>
            <form onSubmit={postFood}>
                <input name="foodType" placeholder="Food Type" onChange={handleChange} required />
                <input name="quantity" type="number" placeholder="Quantity" onChange={handleChange} required />
                <input name="preparationTime" type="datetime-local" onChange={handleChange} required />
                <input name="pickupLocation" placeholder="Pickup Location" onChange={handleChange} required />
                <textarea name="description" placeholder="Description" onChange={handleChange}></textarea>
                <button type="submit">Post Food</button>
            </form>

            <h3>Available Foods</h3>
            <ul>
                {foods.map(food => (
                    <li key={food._id}>
                        {food.foodType} - {food.quantity} servings at {food.pickupLocation} ({food.status})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FoodListing;
