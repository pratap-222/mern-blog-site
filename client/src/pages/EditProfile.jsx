import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStructure } from "./ProfilePage";
import AnimationWrapper from "../components/AnimationWrapper";
import Loader from "../components/Loader";
import { Toaster, toast } from "react-hot-toast";
import CustomInput from "../components/CustomInput";
import { BIOLIMIT } from "../common/Constant";
import { uploadImage } from "../common/Aws";
import { storeInSession } from "../common/Session";

const EditProfile = () => {
  const {
    userAuth,
    userAuth: { token },
    setUserAuth,
  } = useContext(UserContext);
  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const profileImageRef = useRef();
  const editProfileFormRef = useRef();
  const [updatedProfileImage, setUpdatedProfileImage] = useState(null);
  const {
    personal_info: {
      fullname,
      bio,
      email,
      username: profile_username,
      profile_img,
    },
    social_links,
  } = profile;
  const [charactersLeft, setCharactersLeft] = useState(BIOLIMIT);

  useEffect(() => {
    if (token) {
      axios
        .post(`${process.env.REACT_APP_BASE_URL}/get-profile`, {
          username: userAuth.username,
        })
        .then(({ data: { user } }) => {
          setProfile(user);
          setLoading(false);
        })
        .catch((error) => console.log(error));
    }
  }, [token]);

  const handleCharacterChange = (e) => {
    setCharactersLeft(BIOLIMIT - e.target.value.length);
  };

  const handleProfileImageChange = (e) => {
    const profileImage = e.target.files[0];

    profileImageRef.current.src = URL.createObjectURL(profileImage);

    setUpdatedProfileImage(profileImage);
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (updatedProfileImage) {
      const loading = toast.loading("Uploading...");
      e.target.setAttribute("disabled", true);

      try {
        const url = await uploadImage(updatedProfileImage);

        if (url) {
          try {
            const { data } = await axios.post(
              `${process.env.REACT_APP_BASE_URL}/update-profile-img`,
              { url },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            const newUserAuth = { ...userAuth, profile_img: data.profile_img };
            storeInSession("user", JSON.stringify(newUserAuth));
            setUserAuth(newUserAuth);
            setUpdatedProfileImage(null);

            toast.dismiss(loading);
            e.target.removeAttribute("disabled");
            toast.success("Uploaded 👍");
          } catch ({ response }) {
            console.log(response.data.error);
            toast.dismiss(loading);
            e.target.removeAttribute("disabled");
            toast.error("Failed to update profile image");
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleEditProfileForm = async (e) => {
    e.preventDefault();

    const form = new FormData(editProfileFormRef.current);
    const formData = {};

    for (const [key, value] of form.entries()) {
      formData[key] = value;
    }

    const {
      username,
      bio,
      facebook,
      github,
      instagram,
      twitter,
      website,
      youtube,
    } = formData;

    if (username.length < 3) {
      return toast.error("Username should be at least 3 leeters long.");
    }

    if (bio.length > BIOLIMIT) {
      return toast.error(`Bio should not be more than ${BIOLIMIT}`);
    }

    const loading = toast.loading("Uploading...");
    e.target.setAttribute("disabled", true);

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/update-profile`,
        {
          username,
          bio,
          social_links: {
            facebook,
            github,
            instagram,
            twitter,
            website,
            youtube,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (userAuth.username !== data.username) {
        const newUserAuth = { ...userAuth, username: data.username };
        setUserAuth(newUserAuth);
        storeInSession("user", JSON.stringify(newUserAuth));
      }

      toast.dismiss(loading);
      e.target.removeAttribute("disabled");
      toast.success("Profile updated successfully 👍");
    } catch ({ response }) {
      toast.dismiss(loading);
      e.target.removeAttribute("disabled");
      toast.error(response.data.error);
    }
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <form ref={editProfileFormRef}>
          <Toaster />

          <h1 className="max-md:hidden">Edit Profile</h1>

          <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
            <div className="max-lg:center mb-5">
              <label
                htmlFor="uploadImage"
                id="profileImageLabel"
                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden"
              >
                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/50 opacity-0 hover:opacity-100 cursor-pointer">
                  Upload Image
                </div>
                <img ref={profileImageRef} src={profile_img} alt="profile" />
              </label>

              <input
                type="file"
                id="uploadImage"
                accept=".jpg, .jpeg, .png"
                onChange={handleProfileImageChange}
                hidden
              />

              <button
                className="btn-light mt-5 max-lg:center lg:w-full px-10"
                onClick={handleImageUpload}
              >
                Upload
              </button>
            </div>

            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                <div>
                  <CustomInput
                    name="fullname"
                    placeholder="Full Name"
                    icon="fi-rr-user"
                    value={fullname}
                    disable={true}
                    type="text"
                  />
                </div>

                <div>
                  <CustomInput
                    name="email"
                    placeholder="Email"
                    icon="fi-rr-envelope"
                    value={email}
                    disable={true}
                    type="email"
                  />
                </div>
              </div>

              <CustomInput
                type="text"
                name="username"
                value={profile_username}
                placeholder="Email"
                icon="fi-rr-at"
              />

              <p className="text-dark-grey -mt-3">
                Username will use to search user and will be visible to all
                users
              </p>

              <textarea
                name="bio"
                maxLength={BIOLIMIT}
                defaultValue={bio}
                className="input-box resize-none h-64 lg:h-40 leading-7 mt-5 pl-5"
                placeholder="Bio"
                onChange={handleCharacterChange}
              />

              <p className="mt-1 text-dark-grey">
                {charactersLeft} characters left
              </p>

              <p className="my-6 text-dark-grey">
                Add your social handles below
              </p>

              <div>
                {Object.keys(social_links).map((key, index) => {
                  const link = social_links[key];
                  return (
                    <CustomInput
                      key={index}
                      name={key}
                      type="text"
                      value={link}
                      placeholder="https://"
                      icon={
                        key !== "website" ? `fi-brands-${key}` : "fi-rr-globe"
                      }
                    />
                  );
                })}
              </div>

              <button
                className="btn-dark w-auto px-10"
                type="submit"
                onClick={handleEditProfileForm}
              >
                Update
              </button>
            </div>
          </div>
        </form>
      )}
    </AnimationWrapper>
  );
};

export default EditProfile;
