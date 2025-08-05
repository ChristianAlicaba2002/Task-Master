import { CiEdit } from "react-icons/ci";
// @ts-expect-error this is for authentication
import { auth } from "../firebase/firebase.config.js";
import { FaPlus } from "react-icons/fa6";
import { useEffect, useState } from "react";
import type { TEditTask, TTask } from "../types/types";
import "../../public/css/editTask.css";

type TID = {
    item_id: string;
};

export default function EditTask({ item_id }: TID) {
    const [isEditOpen, setIsEditOpen] = useState<boolean>(true);
    const [editTaskForm, setEditTaskForm] = useState<TEditTask>({
        title: "",
        description: "",
        priority_level: "",
        status: "",
    });

    // Handle Change Input, Select, TextArea
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditTaskForm((prev) => ({ ...prev, [name]: value }));
    };

    // Fetch the Specific data of the TASK
    useEffect(() => {
        const getTaskData = async () => {
            try {
                const response = await fetch(`http://localhost:3000/task/${item_id}`);
                const data = await response.json();
                console.log("Fetched Task:", data);


                if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                    const task: TTask = data.data[0];
                    setEditTaskForm({
                        title: task.title,
                        description: task.description,
                        priority_level: task.priority_level,
                        status: task.status,
                    });
                } else {
                    console.warn("No task found for this ID.");
                }
            } catch (err) {
                console.error("Error fetching task:", err);
            }
        };

        getTaskData();
    }, [item_id]);


    // Update the Task edited
    const updateTaskForm = async (e: React.FormEvent) => {
        e.preventDefault();

        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to update a task.");
            return;
        }

        const updatedTask = {
            id: item_id,
            user_id: user.uid,
            ...editTaskForm,
        };

        try {
            const response = await fetch(`http://localhost:3000/tasks/${item_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedTask),
            });

            if (!response.ok) throw new Error("Failed to update task");
            alert("Task updated successfully!");
            setIsEditOpen(false);
            window.location.reload()
        } catch (error) {
            console.error(error);
            alert("Failed to update task.");
        }
    };

    return (
        <>
            {isEditOpen && (
                <div className="task-overlay">
                    <div className="task-container">
                        <div className="header-container">
                            <div className="edit-task-container">
                                <CiEdit className="plus-icon" />
                                <h1>Edit Task</h1>
                            </div>
                            <FaPlus className="close-icon" onClick={() => setIsEditOpen(false)} />
                        </div>

                        <form onSubmit={updateTaskForm} method="post" className="task-form">
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={editTaskForm.title}
                                    placeholder="Enter task title"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={editTaskForm.description}
                                    placeholder="Enter task description"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="selection-group">
                                <div className="form-group half">
                                    <label htmlFor="priority">Priority Level</label>
                                    <select
                                        id="priority"
                                        name="priority_level"
                                        value={editTaskForm.priority_level}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select priority level</option>
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>

                                <div className="form-group half">
                                    <label htmlFor="status">Status</label>
                                    <select
                                        id="status"
                                        name="status"
                                        value={editTaskForm.status}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select status</option>
                                        <option value="To-Do">To-Do</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit">Update Task</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
