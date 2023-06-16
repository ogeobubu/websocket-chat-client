import { lazy } from "react";
import Dashboard from "../views/Dashboard";

// dashboard routing
const Talk = lazy(() => import("../views/Talk"));

// =========================|| MAIN ROUTING ||======================== //

const MainRoutes = {
  path: "/",
  element: <Dashboard />,
  children: [
    {
      path: "/",
      element: <Talk />,
    },
  ],
};

export default MainRoutes;
