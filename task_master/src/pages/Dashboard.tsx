import Sidebar from "../components/Sidebar";
import { FaPlus } from "react-icons/fa6";
import { CiEdit } from "react-icons/ci";
import { FaTrash } from "react-icons/fa";
import { IoIosMore } from "react-icons/io";
import '../../public/css/dashboard.css';
import AddTask from "../components/AddTask";
import EditTask from "../components/EditTask";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { ACCESS_TOKEN } from "../token/token";
import type { TTask } from "../types/types";

const statuses = ["To-Do", "In Progress", "Done"];

export default function Dashboard() {
  const auth = getAuth();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [isAddTaskOpen, setIsTaskOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TTask[]>([]);

  // Set user name from Firebase Auth
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setName(user.displayName);
    }
  }, [auth]);

  function showCustomAlert() {
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 3000);
  }
  // Load tasks from localStorage
  const raw = localStorage.getItem("item");
  useEffect(() => {
    try {
      const items = JSON.parse(raw || "[]");

      if (Array.isArray(items)) {
        setTasks(items);
      } else {
        console.warn("Invalid localStorage data for tasks:", items);
        setTasks([]);
      }
    } catch (e) {
      console.error("Failed to parse localStorage item:", e);
      setTasks([]);
    }
  }, [raw]);

  // Fetch tasks from API REQUEST
  const displayTaskUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/tasks", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error fetching tasks:", data.message || data.error);
        return;
      }

      const taskObject = data?.data;

      if (Array.isArray(taskObject)) {
        setTasks(() => [...taskObject]);
        localStorage.setItem("item", JSON.stringify(taskObject));
      } else {
        console.error("Fetched task(s) are not valid:", taskObject);
        setTasks([]);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setTasks([]);
    }
  };

  useEffect(() => {
    displayTaskUser();
  }, []);


  // Update the Task in the list of localstorage
  const updateTaskInList = (updatedTask: TTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );

    const newList = tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
    localStorage.setItem("item", JSON.stringify(newList));
  };

  // Delete Specific Tasks
  const deleteSpecificTask = async (id: string) => {
    try {
      showCustomAlert()

      const response = await fetch(`http://localhost:3000/task/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error deleting task:", errorData.message || errorData.error);
        return;
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
      const updatedTasks = tasks.filter((task) => task.id !== id);
      localStorage.setItem("item", JSON.stringify(updatedTasks));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="dashboard">
        {showAlert && (
          <div className={`alert-delete ${showAlert ? "show" : ""}`}>
            <p>Task deleted successfully!</p>
          </div>
        )}
        <h1 className="header-title">{name} Dashboard</h1>
        <p className="header-paragraph">
          The Task Master List Dashboard is a task management interface that helps users organize and track their work efficiently. Tasks are categorized into three main statuses: To-Do, In Progress, and Done, providing a clear overview of current progress.
        </p>

        {isAddTaskOpen && <AddTask />}
        <div className="add-container">
          <FaPlus className="add-icon" onClick={() => setIsTaskOpen((prev) => !prev)} />
        </div>

        <div className="columns">
          {statuses.map((status) => (
            <div key={status} className="column">
              <h2
                className="column-title"
                style={{
                  color:
                    status === "To-Do"
                      ? "orange"
                      : status === "In Progress"
                        ? "lightgreen"
                        : "lightblue",
                }}
              >
                {status}
              </h2>
              <div className="task-list">
                <>
                  {tasks.filter((task) => task.status === status).map((task) => (
                    <div key={task.id ?? task.user_id ?? Math.random()} className="task-card">
                      <div className="more-container">
                        <IoIosMore className="more-icon" onClick={() => setIsMenuOpen((prev) => !prev)} />
                        {isMenuOpen && (
                          <>
                            <div className="action-container">
                              <CiEdit
                                className="edit-icon"
                                onClick={() => {
                                  setEditTaskId(task.id);
                                  setIsEditOpen((prev) => !prev);
                                }}
                              />
                              <div className="delete-icon">
                                <FaTrash onClick={() => deleteSpecificTask(task.id)} />
                              </div>
                            </div>
                          </>
                        )}

                      </div>
                      <label>{task.title}</label>
                      <p>{task.description}</p>
                      <div className="priority-level">
                        <label
                          style={{
                            backgroundColor:
                              task.priority_level === "Low"
                                ? "gray"
                                : task.priority_level === "Medium"
                                  ? "goldenrod"
                                  : "crimson",
                            fontWeight: "bold",
                          }}
                        >
                          {task.priority_level}
                        </label>
                      </div>
                    </div>
                  ))}

                </>

                {tasks.filter((task) => task.status === status).length === 0 && (
                  <p className="no-tasks">No tasks</p>
                )}
              </div>
            </div>
          ))}
          {isEditOpen && editTaskId ? (
            <EditTask item_id={editTaskId} onTaskUpdate={updateTaskInList} />
          ) : ""}
        </div>
      </div>
    </>
  );
}
