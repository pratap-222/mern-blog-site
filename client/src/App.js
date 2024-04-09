import "./App.css";
import Navbar from "./components/Navbar";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import UserAuthForm from "./pages/UserAuthForm";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/Session";
import Editor from "./pages/Editor";
import HomePage from "./pages/HomePage";
import { v4 as uuidv4 } from "uuid";
import SearchPage from "./pages/SearchPage";
import PageNotFound from "./pages/PageNotFound";
import ProfilePage from "./pages/ProfilePage";
import BlogPage from "./pages/BlogPage";
import SideNav from "./components/SideNav";
import ChangePassword from "./pages/ChangePassword";

const router = createBrowserRouter([
  {
    path: "/",
    // element: [<Navbar key={uuidv4()} />, <HomePage key={uuidv4()} />],
    element: <Navbar />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/settings",
        element: <SideNav />,
        children: [
          {
            path: "edit-profile",
            element: <h1>Edit profile page</h1>,
          },
          {
            path: "change-password",
            element: <ChangePassword />,
          },
        ],
      },
      {
        path: "/signin",
        element: <UserAuthForm type="signin" />,
      },
      {
        path: "/signup",
        element: <UserAuthForm type="signup" />,
      },
      {
        path: "/search/:query",
        element: <SearchPage />,
      },
      {
        path: "user/:id",
        element: <ProfilePage />,
      },
      {
        path: "blog/:blogId",
        element: <BlogPage />,
      },
      {
        path: "*",
        element: <PageNotFound />,
      },
    ],
  },
  {
    path: "/editor",
    element: <Editor />,
  },
  {
    path: "/editor/:blogId",
    element: <Editor />,
  },
]);

export const UserContext = createContext({});

function App() {
  const [userAuth, setUserAuth] = useState({});

  useEffect(() => {
    let userInSession = lookInSession("user");
    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ token: null });
  }, []);

  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <RouterProvider router={router} />
    </UserContext.Provider>
  );
}

export default App;
