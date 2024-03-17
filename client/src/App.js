import "./App.css";
import Navbar from "./components/Navbar";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import UserAuthForm from "./pages/UserAuthForm";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/Session";
import Editor from "./pages/Editor";
import HomePage from "./pages/HomePage";
import { v4 as uuidv4 } from "uuid";

const router = createBrowserRouter([
  {
    path: "/",
    element: [<Navbar key={uuidv4()} />, <HomePage key={uuidv4()} />],
    children: [
      {
        path: "/signin",
        element: <UserAuthForm type="signin" />,
      },
      {
        path: "/signup",
        element: <UserAuthForm type="signup" />,
      },
    ],
  },
  {
    path: "/editor",
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
