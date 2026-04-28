import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { ExpensesPage } from "./pages/ExpensesPage";
import { HabitBuilderPage } from "./pages/HabitBuilderPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/app",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: "expenses",
        Component: ExpensesPage,
      },
      {
        path: "habit-builder",
        Component: HabitBuilderPage,
      },
      {
        path: "analytics",
        Component: AnalyticsPage,
      },
      {
        path: "settings",
        Component: SettingsPage,
      },
    ],
  },
]);
