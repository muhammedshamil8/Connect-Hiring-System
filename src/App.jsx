import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./assets/styles/index.css";
import { AuthProvider } from "./context/AuthContext";
import {
  Login,
  Add,
  List,
  NotFound,
  TopScores,
  PublicRankList,
  ViewData,
} from "./pages";
import AdminLayout from "./layout/AdminLayout";
import PublicLayout from "./layout/PublicLayout";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/ranklist" /> },

  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { path: "ranklist", element: <PublicRankList /> },
      { path: "viewdata", element: <ViewData /> },
    ],
  },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "", element: <Navigate to="list" /> },
      { path: "add", element: <Add /> },
      { path: "topscores", element: <TopScores /> },
      { path: "list", element: <List /> },
    ],
  },

  { path: "/login", element: <Login /> },

  { path: "*", element: <NotFound /> },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
