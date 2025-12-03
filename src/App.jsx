import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import './assets/styles/index.css'
import { AuthProvider } from "./context/AuthContext";
import { Login, Add, List, NotFound, TopScores, PublicRankList, ViewData } from "./pages";
import AdminLayout from "./layout/AdminLayout";
import PublicLayout from "./layout/PublicLayout";


const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { path: "/", element: <Navigate to="/admin/list" /> },
      { path: "/admin/add", element: <Add /> },
      { path: "/admin/topscores", element: <TopScores /> },
      { path: "/admin/list", element: <List /> },
    ],
  },
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { path: "/ranklist", element: <PublicRankList /> },
      { path: "/viewdata", element: <ViewData /> },
    ],
  },

  { path: "/login", element: <Login /> },
  { path: "*", element: <NotFound /> },
]);



export default function App() {
  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  );
}

