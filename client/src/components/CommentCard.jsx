import React, { Children, useContext, useState } from "react";
import { getDay } from "../common/date";
import CommentField from "./CommentField";
import toast from "react-hot-toast";
import { UserContext } from "../App";
import { BlogContext } from "../pages/BlogPage";
import axios from "axios";

const CommentCard = ({ index, leftVal, commentData }) => {
  let {
    commented_by: {
      personal_info: { fullname, username: commented_by_username, profile_img },
    },
    commentedAt,
    comment,
    _id,
    children,
  } = commentData;
  const {
    userAuth: { token, username },
  } = useContext(UserContext);
  const [isReplying, setIsReplying] = useState(false);
  let {
    blog,
    blog: {
      comments,
      comments: { results: commentArr },
      activity,
      activity: { total_parent_comments },
      author: {
        personal_info: { username: blog_author },
      },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  const getParentIndex = () => {
    let startingPoint = index - 1;

    try {
      while (
        commentArr[startingPoint].childrenLevel >= commentData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch (error) {
      console.log(error);
      startingPoint = undefined;
    }

    return startingPoint;
  };

  const removeCommentCards = (startingPoint, isDelete = false) => {
    if (commentArr[startingPoint]) {
      while (
        commentArr[startingPoint].childrenLevel > commentData.childrenLevel
      ) {
        commentArr.splice(startingPoint, 1);

        if (!commentArr[startingPoint]) {
          break;
        }
      }
    }

    if (isDelete) {
      let parentIndex = getParentIndex();

      if (parentIndex !== undefined) {
        commentArr[parentIndex].children = commentArr[
          parentIndex
        ].children.filter((child) => child !== _id);

        if (!commentArr[parentIndex].children.length) {
          commentArr[parentIndex].isReplyLoaded = false;
        }
      }

      commentArr.splice(index, 1);
    }

    if (commentData.childrenLevel == 0 && isDelete) {
      setTotalParentCommentsLoaded((preVal) => preVal - 1);
    }
    setBlog({
      ...blog,
      comments: { results: commentArr },
      activity: {
        ...activity,
        total_parent_comments:
          total_parent_comments -
          (commentData.childrenLevel == 0 && isDelete ? 1 : 0),
      },
    });
  };

  const handleReplyClick = () => {
    if (!token) {
      return toast.error("log in to leave a reply...");
    }

    setIsReplying((preVal) => !preVal);
  };

  const handleHideReplies = () => {
    commentData.isReplyLoaded = false;
    removeCommentCards(index + 1);
  };

  const handleLoadReplies = async ({ skip = 0, currentIndex = index }) => {
    if (commentArr[currentIndex].children.length) {
      handleHideReplies();

      try {
        const {
          data: { replies },
        } = await axios.post(`${process.env.REACT_APP_BASE_URL}/get-replies`, {
          _id: commentArr[currentIndex]._id,
          skip,
        });

        commentArr[currentIndex].isReplyLoaded = true;

        for (let i = 0; i < replies.length; i++) {
          replies[i].childrenLevel = commentArr[currentIndex].childrenLevel + 1;

          commentArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
        }

        setBlog({
          ...blog,
          comments: { ...comments, comments: { results: commentArr } },
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleDeleteComment = async (e) => {
    e.target.setAttribute("disabled", true);

    try {
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/delete-comment`,
        { _id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      e.target.removeAttribute("disabled");
      removeCommentCards(index + 1, true);
    } catch (error) {
      console.log(error);
    }
  };

  const LoadMoreReplies = () => {
    const parentIndex = getParentIndex();

    const button = (
      <button
        onClick={() =>
          handleLoadReplies({
            skip: index - parentIndex,
            currentIndex: parentIndex,
          })
        }
        className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
      >
        Load More Replies
      </button>
    );

    if (commentArr[index + 1]) {
      if (
        commentArr[index + 1].childrenLevel < commentArr[index].childrenLevel
      ) {
        if (index - parentIndex < commentArr[parentIndex].children.length) {
          return button;
        }
      }
    } else {
      if (parentIndex) {
        if (index - parentIndex < commentArr[parentIndex].children.length) {
          return button;
        }
      }
    }
  };

  return (
    <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className="my-5 p-6 rounded-md border border-grey">
        <div className="flex gap-3 items-center mb-8">
          <img src={profile_img} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1">
            {fullname} @{commented_by_username}
          </p>
          <p className="min-w-fit">{getDay(commentedAt)}</p>
        </div>

        <p className="font-gelasio text-xl ml-3">{comment}</p>

        <div className="flex gap-5 items-center mt-5">
          {commentData.isReplyLoaded ? (
            <button
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
              onClick={handleHideReplies}
            >
              <i className="fi fi-rs-comment-dots" /> Hide Reply
            </button>
          ) : (
            <button
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
              onClick={handleLoadReplies}
            >
              <i className="fi fi-rs-comment-dots" /> {children.length} Reply
            </button>
          )}

          <button className="underline" onClick={handleReplyClick}>
            Reply
          </button>

          {username === commented_by_username || username === blog_author ? (
            <button
              className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center"
              onClick={handleDeleteComment}
            >
              <i className="fi fi-rr-trash pointer-events-none" />
            </button>
          ) : undefined}
        </div>

        {isReplying ? (
          <div className="mt-8">
            <CommentField
              action="Reply"
              index={index}
              replyingTo={_id}
              setIsReplying={setIsReplying}
            />
          </div>
        ) : undefined}
      </div>

      <LoadMoreReplies />
    </div>
  );
};

export default CommentCard;
