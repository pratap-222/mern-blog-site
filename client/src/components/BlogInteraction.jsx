import React, { useContext } from "react";
import { BlogContext } from "../pages/BlogPage";
import { Link } from "react-router-dom";
import { UserContext } from "../App";

function BlogInteraction() {
  const {
    blog: {
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlog,
  } = useContext(BlogContext);

  const {
    userAuth: { username },
  } = useContext(UserContext);
  return (
    <>
      <hr className="border-grey my-2" />
      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80">
            <i className="fi fi-rr-heart" />
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