import { useRoutes } from "react-router-dom";
import Talk from "../views/Talk";
import Attendee from "../views/Attendee";
import config from "../config";
import { Routes, Route } from "react-router-dom";
import MainRoutes from "./MainRoutes";

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return useRoutes(
    [{ path: "/attendee", element: <Attendee /> }, "/", MainRoutes],
    config.basename
  );
}
