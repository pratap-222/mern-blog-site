import React, { useContext, useEffect } from "react";
import { BlogContext } from "../pages/BlogPage";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

function BlogInteraction() {
  let {
    blog,
    blog: {
      _id,
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlog,
    isLikedByUser,
    setLikedByUser,
  } = useContext(BlogContext);

  const {
    userAuth: { username, token },
  } = useContext(UserContext);

  const handleLike = async () => {
    if (token) {
      isLikedByUser ? total_likes-- : total_likes++;
      setBlog({ ...blog, activity: { ...activity, total_likes } });
      setLikedByUser((preVal) => !preVal);

      try {
        const data = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/like-blog`,
          { _id, isLikedByUser },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(data.data);
      } catch (error) {
        console.log(error.message);
      }
    } else {
      return toast.error("Please log in to like this blog");
    }
  };

  useEffect(() => {
    if (token) {
      axios
        .post(
          `${process.env.REACT_APP_BASE_URL}/isliked-by-user`,
          { _id },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then(({ data: { result } }) => {
          setLikedByUser(Boolean(result));
        })
        .catch((error) => console.log(error.message));
    }
  }, []);

  return (
    <>
      <Toaster />
      <hr className="border-grey my-2" />
      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          <button
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isLikedByUser ? "bg-red/20 text-red" : "bg-grey/80"
            }`}
            onClick={handleLike}
          >
            <i
              className={`fir ${isLikedByUser ? "fi-sr-heart" : "fi-rr-heart"}`}
            />
          </button>
          <p className="text-xl text-dark-grey">{total_likes}</p>

          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80">
            <i className="fi fi-rr-comment-dots" />
          </button>
          <p className="text-xl text-dark-grey">{total_comments}</p>
        </div>

        <div className="flex gap-6 items-center">
          {username === author_username ? (
            <Link
              to={`/editor/${blog_id}`}
              className="underline hover:text-purple"
            >
              Edit
            </Link>
          ) : undefined}

          <Link
            to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${window.location.href}`}
          >
            <i className="fi fi-brands-twitter text-xl hover:text-twitter" />
          </Link>
        </div>
      </div>
      <hr className="border-grey my-2" />
    </>
  );
}

export default BlogInteraction;
