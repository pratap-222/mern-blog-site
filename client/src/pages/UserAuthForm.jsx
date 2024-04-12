import React, { useContext } from "react";
import { Link, Navigate } from "react-router-dom";
import CustomInput from "../components/CustomInput";
import googleIcon from "../images/google.png";
import AnimationWrapper from "../components/AnimationWrapper";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/Session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/Firebase";

function UserAuthForm({ type }) {
  const {
    userAuth: { token },
    setUserAuth,
  } = useContext(UserContext);

  const authThroughServer = async (formData, serverRoute) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}${serverRoute}`,
        formData
      );
      storeInSession("user", JSON.stringify(data));
      setUserAuth(data);
    } catch ({ response }) {
      toast.error(response.data.error);
    }
  };

  const handleSubmit = async (event) => {
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    const form = new FormData(event.target);
    const formData = {};

    event.preventDefault();

    for (var [key, value] of form.entries()) {
      formData[key] = value;
    }

    const { fullname, email, password } = formData;

    if (fullname?.length < 3) {
      return toast.error("Invalid full name");
    }

    if (email.length === 0) {
      return toast.error("Enter email address");
    }

    if (emailRegex.test(email) === false) {
      return toast.error("Invalid email address");
    }

    if (passwordRegex.test(password) === false) {
      return toast.error(
        "Password should be 6 to 20 characters long with 1 numeric, 1 lowercase and 1 uppercase letts"
      );
    }

    const serverRoute = type === "signin" ? "/signin" : "/signup";

    await authThroughServer(formData, serverRoute);
  };

  const handleGoogleAuth = async () => {
    try {
      const data = await authWithGoogle();

      const formData = {
        token: data.accessToken,
      };
      const serverRoute = "/google-auth";

      await authThroughServer(formData, serverRoute);
    } catch (error) {
      toast.error("Trouble while log in through google");
      return console.log(error);
    }
  };

  return token ? (
    <Navigate to="/" />
  ) : (
    <AnimationWrapper key={type}>
      <section className="h-cover flex flex-col items-center justify-center">
        <Toaster />

        <form
          className="w-[80%] max-w-[400px]"
          method="post"
          onSubmit={handleSubmit}
        >
          <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
            {type === "signin" ? "Welcome back" : "Join us today"}
          </h1>

          {type === "signup" ? (
            <CustomInput
              type="text"
              name="fullname"
              placeholder="Full name"
              icon="fi-rr-user"
            />
          ) : undefined}

          <CustomInput
            type="email"
            name="email"
            placeholder="Email address"
            icon="fi-rr-envelope"
          />

          <CustomInput
            type="password"
            name="password"
            placeholder="Password"
            icon="fi-rr-key"
          />

          <button className="btn-dark center mt-14" type="submit">
            {type === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <div className="w-[80%] max-w-[400px]">
          <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
            <hr className="w-1/2 border-black" />
            <p>or</p>
            <hr className="w-1/2 border-black" />
          </div>

          <button
            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
            onClick={handleGoogleAuth}
          >
            <img src={googleIcon} alt="google icon" className="w-5" />
            contiune with google
          </button>

          {type === "signin" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't have an account?
              <Link to="/signup" className="underline text-black text-xl ml-1">
                Join us today
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a member?
              <Link to="/signin" className="underline text-black text-xl ml-1">
                Sign in here
              </Link>
            </p>
          )}
        </div>
      </section>
    </AnimationWrapper>
  );
}

export default UserAuthForm;
