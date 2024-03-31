import React, { useContext, useState } from "react";
import toast, { ToastBar, Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";
import { BlogContext } from "../pages/BlogPage";

const CommentField = ({ action, index, replyingTo, setIsReplying }) => {
  const [comment, setComment] = useState("");
  const {
    userAuth,
    userAuth: { token, username, fullname, profile_img },
  } = useContext(UserContext);

  const {
    blog,
    blog: {
      _id,
      author: { _id: blog_author },
      comments,
      comments: { results: commentArr },
      activity,
      activity: { total_comments, total_parent_comments },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  const handleComment = async () => {
    if (!token) {
      return toast.error("Log in first to leave a comment...");
    }

    if (!comment.length) {
      return toast.error("Write something to leave a comment...");
    }

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/add-comment`,
        { _id, blog_author, comment, replying_to: replyingTo },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComment("");

      data.commented_by = {
        personal_info: { username, profile_img, fullname },
      };

      let newCommentArr;
      if (replyingTo) {
        commentArr[index].children.push(data._id);
        data.childrenLevel = commentArr[index].childrenLevel + 1;
        data.parentIndex = index;

        commentArr[index].isReplyLoaded = true;
        commentArr.splice(index + 1, 0, data);

        newCommentArr = commentArr;
      } else {
        data.childrenLevel = 0;
        newCommentArr = [data, ...commentArr];
      }

      let parentCommentIncrementVal = replyingTo ? 0 : 1;

      setBlog({
        ...blog,
        comments: { ...comments, results: newCommentArr },
        activity: {
          ...activity,
          total_comments: total_comments + 1,
          total_parent_comments:
            total_parent_comments + parentCommentIncrementVal,
        },
      });

      setTotalParentCommentsLoaded(
        (preVal) => preVal + parentCommentIncrementVal
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        placeholder="Leave a comment..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
        onChange={(e) => setComment(e.target.value)}
      />

      <button className="btn-dark mt-5 px-10" onClick={handleComment}>
        {action}
      </button>
    </>
  );
};

export default CommentField;
