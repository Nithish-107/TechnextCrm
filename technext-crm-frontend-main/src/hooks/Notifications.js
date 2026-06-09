import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const [tasks, meetings, leads, placements] = await Promise.all([
        axios.get(`${BASE_URL}/tasks`).catch(() => ({ data: [] })),
        axios.get(`${BASE_URL}/meetings`).catch(() => ({ data: [] })),
        axios.get(`${BASE_URL}/leads`).catch(() => ({ data: [] })),
        axios.get(`${BASE_URL}/placements`).catch(() => ({ data: [] })),
      ]);

      const today = new Date().toISOString().split("T")[0];
      const notifs = [];

      // Overdue tasks
      tasks.data
        .filter((t) => t.status === "Pending" && t.dueDate && t.dueDate < today)
        .forEach((t) => {
          notifs.push({
            id: `task-${t.id}`,
            type: "warning",
            icon: "⚠️",
            title: "Overdue Task",
            message: `"${t.title}" was due on ${t.dueDate}`,
            time: "Overdue",
            read: false,
            page: "tasks",
          });
        });

      // Tasks due today
      tasks.data
        .filter((t) => t.status === "Pending" && t.dueDate === today)
        .forEach((t) => {
          notifs.push({
            id: `tasktoday-${t.id}`,
            type: "info",
            icon: "✅",
            title: "Task Due Today",
            message: `"${t.title}" is due today`,
            time: "Today",
            read: false,
            page: "tasks",
          });
        });

      // Upcoming meetings today
      meetings.data
        .filter((m) => m.status === "Upcoming" && m.meetingDate === today)
        .forEach((m) => {
          notifs.push({
            id: `meet-${m.id}`,
            type: "success",
            icon: "📅",
            title: "Meeting Today",
            message: `"${m.title}" at ${m.meetingTime || "scheduled time"}`,
            time: "Today",
            read: false,
            page: "meetings",
          });
        });

      // Hot leads
      leads.data
        .filter((l) => l.status === "Hot")
        .slice(0, 2)
        .forEach((l) => {
          notifs.push({
            id: `lead-${l.id}`,
            type: "hot",
            icon: "🔥",
            title: "Hot Lead",
            message: `${l.name} from ${l.company || "—"} is a hot lead`,
            time: "Active",
            read: false,
            page: "leads",
          });
        });

      // Active placements
      placements.data
        .filter((p) => p.status === "Active")
        .slice(0, 2)
        .forEach((p) => {
          notifs.push({
            id: `place-${p.id}`,
            type: "success",
            icon: "🏆",
            title: "Active Placement",
            message: `${p.candidateName} at ${p.clientCompany || "—"}`,
            time: "Active",
            read: false,
            page: "placements",
          });
        });

      // Welcome notification
      notifs.push({
        id: "welcome",
        type: "info",
        icon: "👋",
        title: "Welcome to TechNext CRM",
        message: "Your CRM is up to date",
        time: "Now",
        read: true,
        page: "home",
      });

      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return {
    notifications,
    unreadCount,
    markAllRead,
    markRead,
    refresh: fetchNotifications,
  };
}
