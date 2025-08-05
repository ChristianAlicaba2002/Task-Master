import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import Dashboard from "./pages/Dashboard.tsx"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { ProtectedRoute, PublicRoute } from "./utils/AuthRoutes"

const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <PublicRoute>
        <App />
      </PublicRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
      <Dashboard />
      </ProtectedRoute>
    )
  },
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={routes} />
  </StrictMode>
)
