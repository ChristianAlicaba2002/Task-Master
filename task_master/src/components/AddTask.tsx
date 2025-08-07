import { useState } from "react";
import type { TAddTask } from "../types/types.js";
// @ts-expect-error this is for authentication
import { auth } from "../firebase/firebase.config.js"
import { FaPlus } from "react-icons/fa6";
import "../../public/css/addtask.css";

export default function AddTask() {

    const [showTitleError, setShowTitleError] = useState<string>("")
    const [submitTask, setSubmitTask] = useState<boolean>(false)
    const [isAddTaskOpen, setIsTaskOpen] = useState<boolean>(true);
    const [showDescriptionError, setShowDescriptionError] = useState<string>("")
    const [showPriorityLevelError, setShowPriorityLevelError] = useState<string>("")
    const [showStatusError, setShowStatusError] = useState<string>("")
    const [addTaskForm, setAddTaskForm] = useState<TAddTask>({
        title: "",
        description: "",
        priority_level: "",
        status: "",
    })


    // Handle Change Input, Select, TextArea
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setAddTaskForm((prev) => ({ ...prev, [name]: value }))

        if (name === "title") setShowTitleError("")
        if (name === "description") setShowDescriptionError("")
        if (name === "priority_level") setShowPriorityLevelError("")
        if (name === "status") setShowStatusError("")
    }

    const submitNewTask = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitTask(true)

        if (!addTaskForm.title && !addTaskForm.description && !addTaskForm.priority_level && !addTaskForm.status) {
            setShowTitleError("Title is required")
            setShowDescriptionError("Description is required")
            setShowPriorityLevelError("Priority level required")
            setShowStatusError("Status is required")
            setSubmitTask(false)
            return;
        }
        if (!addTaskForm.description) {
            setShowDescriptionError("Description is required")
            setSubmitTask(false)
            return;
        }
        if (!addTaskForm.priority_level) {
            setShowPriorityLevelError("Priority level required")
            setSubmitTask(false)
            return;
        }

        if (!addTaskForm.status) {
            setShowStatusError("Status is required")
            setSubmitTask(false)
            return;
        }

        try {
            const user = auth.currentUser;
            if (user) {
                const submitTask = {
                    ...addTaskForm,
                    user_id: user.uid
                };

                const ACCESS_TOKEN = await user.getIdToken();

                const response = await fetch("http://localhost:3000/tasks", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${ACCESS_TOKEN}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(submitTask)
                });

                const data = await response.json();
                if (data) console.log(data);

                window.location.reload();
            }

        } catch (error) {
            console.log(error as string)
        } finally {
            setSubmitTask(false)
        }

    }


    return (
        <>
            {isAddTaskOpen && <div className="task-overlay">
                <div className="task-container">
                    <div className="header-container">
                        <div className="add-task-container">
                            <FaPlus className="plus-icon" />
                            <h1>Add Task</h1>
                        </div>
                        <FaPlus className="close-icon" onClick={() => setIsTaskOpen((prev) => !prev)} />
                    </div>
                    <form onSubmit={submitNewTask} className="task-form">
                        <div className="form-group">
                            <label htmlFor="title">Title</label>
                            <input
                                type="text"
                                style={{ borderColor: showTitleError ? "red" : "" }}
                                id="title"
                                name="title"
                                placeholder="Enter task title"
                                onChange={handleChange}
                            />
                            {showTitleError && (
                                <p className="error-message" style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.3rem', marginBottom: '0.2rem' }}>
                                    {showTitleError}
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                style={{ borderColor: showDescriptionError ? "red" : "" }}
                                name="description"
                                placeholder="Enter task description"
                                onChange={handleChange}

                            ></textarea>
                            {showDescriptionError && (
                                <p className="error-message" style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.2rem', marginBottom: '0.2rem' }}>
                                    {showDescriptionError}
                                </p>
                            )}
                        </div>

                        <div className="selection-group">
                            <div className="form-group half">
                                <label htmlFor="priority">Priority Level</label>
                                <select
                                    id="priority"
                                    name="priority_level"
                                    style={{ borderColor: showPriorityLevelError ? "red" : "" }}
                                    onChange={handleChange}
                                >
                                    <option value="">Select priority level</option>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                                {showPriorityLevelError && (
                                    <p className="error-message" style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.2rem', marginBottom: '0.2rem' }}>
                                        {showPriorityLevelError}
                                    </p>
                                )}
                            </div>

                            <div className="form-group half">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    style={{ borderColor: showStatusError ? "red" : "" }}
                                    onChange={handleChange}>
                                    <option value="">Select status</option>
                                    <option value="To-Do">To-Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                                {showStatusError && (
                                    <p className="error-message" style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.2rem', marginBottom: '0.2rem' }}>
                                        {showStatusError}
                                    </p>
                                )}
                            </div>
                        </div>
                        {submitTask ? (
                            <button type="submit" disabled={submitTask}>
                                <div className="loader-container">
                                    <div className="loader"></div>
                                </div>
                            </button>
                        ) : <button type="submit">Add Task</button>}
                    </form>
                </div>
            </div>
            }

        </>

    );
}
