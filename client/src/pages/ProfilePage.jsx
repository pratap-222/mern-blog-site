import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../components/AnimationWrapper";
import Loader from "../components/Loader";
import { UserContext } from "../App";
import AboutUser from "../components/AboutUser";
import { FilterPaginationData } from "../common/FilterPaginationData";
import InPageNavigation from "../components/InPageNavigation";
import BlogPostCard from "../components/BlogPostCard";
import NoDataMessage from "../components/NoDataMessage";
import LoadMoreDataBtn from "../components/LoadMoreDataBtn";
import PageNotFound from "./PageNotFound";

export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    bio: "",
    profile_img: "",
  },
  social_links: {},
  account_info: {
    total_reads: 0,
    total_posts: 0,
  },
  joinedAt: "",
};

function ProfilePage() {
  const { id: profileId } = useParams();
  const [profile, setProfile] = useState(profileDataStructure);
  const [blogs, setBlogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState("");
  const {
    userAuth: { username },
  } = useContext(UserContext);

  const {
    personal_info: { fullname, username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  const fetchProfile = () => {
    axios
      .post(`${process.env.REACT_APP_BASE_URL}/get-profile`, {
        username: profileId,
      })
      .then(({ data: { user } }) => {
        if (user !== null) {
          setProfile(user);
        }
        getBlogs({ user_id: user._id });
        setProfileLoaded(profileId);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const getBlogs = ({ page = 1, user_id }) => {
    user_id = user_id === undefined ? blogs.user_id : user_id;

    axios
      .post(`${process.env.REACT_APP_BASE_URL}/search-blogs`, {
        author: user_id,
        page,
      })
      .then(async ({ data }) => {
        const formattedData = await FilterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { author: user_id },
        });

        formattedData.user_id = user_id;
        setBlogs(formattedData);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const resetStates = () => {
    setProfile(profileDataStructure);
    setLoading(true);
    setProfileLoaded("");
  };

  useEffect(() => {
    if (profileLoaded !== profileId) {
      setBlogs(null);
    }

    if (blogs === null) {
      resetStates();
      fetchProfile();
    }
  }, [profileId, blogs]);

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : profile_username.length ? (
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
            <img
              src={profile_img}
              alt="user_profile_pic"
              className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
            />
            <h1 className="text-2xl font-medium">@{profile_username}</h1>

            <p className="text-xl h-6 capitalize">{fullname}</p>

            <p>
              {total_posts.toLocaleString()} Blogs -{" "}
              {total_reads.toLocaleString()} Reads
            </p>

            <div className="flex gap-4 mt-2">
              {profileId === username ? (
                <Link
                  to="/settings/edit-profile"
                  className="btn-light rounded-md"
                >
                  Edit Profile
                </Link>
              ) : undefined}
            </div>

            <AboutUser
              className="max-md:hidden"
              bio={bio}
              social_links={social_links}
              joinedAt={joinedAt}
            />
          </div>

          <div className="max-md:mt-12 w-full">
            <InPageNavigation
              routes={["Blogs Published", "About"]}
              defaultHidden={["About"]}
            >
              <>
                {blogs === null ? (
                  <Loader />
                ) : blogs.results.length > 0 ? (
                  blogs.results.map((blog, index) => {
                    return (
                      <AnimationWrapper
                        key={index}
                        transition={{ duration: 1, delay: (index % 5) * 0.1 }}
                      >
                        <BlogPostCard
                          content={blog}
                          author={blog.author.personal_info}
                        />
                      </AnimationWrapper>
                    );
                  })
                ) : (
                  <NoDataMessage message="No blogs published" />
                )}

                <LoadMoreDataBtn state={blogs} fetchDataFunc={getBlogs} />
              </>

              <AboutUser
                bio={bio}
                social_links={social_links}
                joinedAt={joinedAt}
              />
            </InPageNavigation>
          </div>
        </section>
      ) : (
        <PageNotFound />
      )}
    </AnimationWrapper>
  );
}

export default ProfilePage;
