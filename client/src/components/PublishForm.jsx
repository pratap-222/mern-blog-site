import React, { useContext } from "react";
import AnimationWrapper from "./AnimationWrapper";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/Editor";
import { CHARACTERLIMIT, TAGLIMIT } from "../common/Constant";
import { v4 as uuidv4 } from "uuid";
import Tag from "./Tag";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate, useParams } from "react-router-dom";

function PublishForm() {
  const { blog, setBlog, setEditorState } = useContext(EditorContext);
  const { bannerImage, title, desc, tags, content } = blog;
  const {
    userAuth: { token },
  } = useContext(UserContext);
  const navigate = useNavigate();
  const { blogId } = useParams();

  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();

      let tag = e.target.value;

      if (tags.length <= TAGLIMIT) {
        if (tag.length && tags.includes(tag) === false) {
          setBlog({ ...blog, tags: [...tags, tag] });
          e.target.value = "";
        }
      } else {
        return toast.error(`You can add max ${TAGLIMIT} tags`);
      }
    }
  };

  const handlePublishBlog = async (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }

    if (!title.length) {
      return toast.error("Write blog title before publishing");
    }

    if (!desc.length || desc.length > CHARACTERLIMIT) {
      return toast.error(
        `Write a description about your blog within ${CHARACTERLIMIT} characters to publish`
      );
    }

    if (!tags.length) {
      return toast.error("Enter at least 1 tag to help us rank your blog");
    }

    let loadingToast = toast.loading("Publishing...");
    e.target.classList.add("disable");

    const blogObject = {
      title,
      bannerImage,
      desc,
      content,
      tags,
    };

    try {
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/create-blog`,
        { ...blogObject, id: blogId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      e.target.classList.remove("disable");
      toast.dismiss(loadingToast);
      toast.success("Published 👍");
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch ({ response }) {
      e.target.classList.remove("disable");
      toast.dismiss(loadingToast);

      return toast.error(response.data.error);
    }
  };

  return (
    <AnimationWrapper>
      <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
        <Toaster />

        <button
          className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
          onClick={handleCloseEvent}
        >
          <i className="fi fi-br-cross" />
        </button>

        <div className="max-w-[550px] center">
          <p className="text-dark-grey mb-1">Preview</p>

          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img src={bannerImage} alt="blog-banner" />
          </div>

          <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
            {title}
          </h1>

          <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
            {desc}
          </p>
        </div>

        <div className="border-grey lg:border-1 lg:pl-8">
          <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
          <input
            type="text"
            placeholder="Blog Title"
            defaultValue={title}
            className="input-box pl-4"
            onChange={(e) => setBlog({ ...blog, title: e.target.value })}
          />
          <p className="text-dark-grey mb-2 mt-9">
            Short description about your blog
          </p>

          <textarea
            maxLength={CHARACTERLIMIT}
            defaultValue={desc}
            className="h-40 resize-none leading-7 input-box pl-4"
            onChange={(e) => setBlog({ ...blog, desc: e.target.value })}
            onKeyDown={handleTitleKeyDown}
          />

          <p className="mt-1 text-dark-grey text-sm text-right">
            {CHARACTERLIMIT - desc.length} characters left
          </p>

          <p className="text-dark-grey mb-2 mt-9">
            Topics - (Helps in searching and ranking your blog)
          </p>

          <div className="relative input-box pl-2 py-2 pb-4">
            <input
              type="text"
              placeholder="Topic"
              className="sticky focus:border-white input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white "
              onKeyDown={handleKeyDown}
            />

            {tags.map((tag, index) => {
              return <Tag tag={tag} key={uuidv4()} tagIndex={index} />;
            })}
          </div>

          <p className="mt-1 mb-4 text-dark-grey text-right">
            {TAGLIMIT - tags.length} Tags left
          </p>

          <button className="btn-dark px-8" onClick={handlePublishBlog}>
            Publish
          </button>
        </div>
      </section>
    </AnimationWrapper>
  );
}

export default PublishForm;
