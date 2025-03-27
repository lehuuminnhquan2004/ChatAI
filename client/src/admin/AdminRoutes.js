import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Teachers from "./Teachers";
import Home from "./Home";
import Students from "./Students";
import Subjects from "./Subjects";
import Schedules from "./Schedules";
import Events from "./Events";
import Chats from "./Chats";
import Settings from "./Settings";
import Profile from "./Profile";

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/students" element={<Students />} />
        <Route path="/teachers" element={<Teachers />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/schedules" element={<Schedules />} />
        <Route path="/events" element={<Events />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminRoutes;
