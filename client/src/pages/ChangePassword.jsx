import React, { useContext, useRef, useState } from "react";
import AnimationWrapper from "../components/AnimationWrapper";
import CustomInput from "../components/CustomInput";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../App";

const ChangePassword = () => {
  const changePasswordForm = useRef();
  const {
    userAuth: { token },
  } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
    const form = new FormData(changePasswordForm.current);

    const formData = {};

    for (var [key, value] of form.entries()) {
      formData[key] = value;
    }

    const { currentPassword, newPassword } = formData;

    if (!currentPassword.length || !newPassword.length) {
      return toast.error("Fill all the inputs");
    }

    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return toast.error(
        "Password should be 6 to 20 characters long with 1 numeric, 1 lowercase and 1 uppercase letts"
      );
    }

    const loadingToast = toast.loading("Updating...");
    try {
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/change-password`,
        { currentPassword, newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.dismiss(loadingToast);
      return toast.success("Password changed 👍");
    } catch ({ response }) {
      toast.dismiss(loadingToast);
      return toast.error(response.data.error);
    }
  };

  return (
    <AnimationWrapper>
      <Toaster />
      <form ref={changePasswordForm} method="post" onSubmit={handleSubmit}>
        <h1 className="max-md:hidden">Change Password</h1>

        <div className="py-10 w-full md:max-w-[400px]">
          <CustomInput
            name="currentPassword"
            placeholder="Current Password"
            type="password"
            className="profile-edit-input"
            icon="unlock"
            oncha
          />
          <CustomInput
            name="newPassword"
            placeholder="New Password"
            type="password"
            className="profile-edit-input"
            icon="unlock"
          />

          <button className="btn-dark px-10" type="submit">
            Change Password
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default ChangePassword;
