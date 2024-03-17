import React, { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import defaultBanner from "../images/blog banner.png";
import AnimationWrapper from "./AnimationWrapper";
import { uploadImage } from "../common/Aws";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/Editor";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./Tools";
import { UserContext } from "../App";
import axios from "axios";

function BlogEditor() {
  const { blog, setBlog, textEditor, setTextEditor, setEditorState } =
    useContext(EditorContext);
  const { title, bannerImage, content, desc, tags } = blog;
  const {
    userAuth: { token },
  } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: "textEditor",
          tools: tools,
          data: content,
          placeholder: "Let's write an awesome story.",
        })
      );
    }
  }, []);

  const handleBannerUpload = (e) => {
    let image = e.target.files[0];

    if (image) {
      let loadingToast = toast.loading("Uploading...");
      uploadImage(image)
        .then((url) => {
          if (url) {
            toast.dismiss(loadingToast);
            toast.success("Uploaded 👍");
            setBlog({ ...blog, bannerImage: url });
          }
        })
        .catch((error) => {
          toast.dismiss(loadingToast);
          return toast.error(error.message);
        });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    let input = e.target;

    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";

    setBlog({ ...blog, title: input.value });
  };

  const handlePublishEvent = () => {
    if (bannerImage.length === 0) {
      return toast.error("Add baner image image for blog to publish it");
    }

    if (title.length === 0) {
      return toast.error("Add blog title for blog to publish it");
    }

    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Write some content in blog to publish it");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }

    if (!title.length) {
      return toast.error("Write blog title before saving it as draft");
    }

    let loadingToast = toast.loading("Saving Draft...");
    e.target.classList.add("disable");

    if (textEditor.isReady) {
      textEditor.save().then(async (content) => {
        try {
          await axios.post(
            `${process.env.REACT_APP_BASE_URL}/create-blog`,
            blogObject,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          e.target.classList.remove("disable");
          toast.dismiss(loadingToast);
          toast.success("Saved 👍");
          setTimeout(() => {
            navigate("/");
          }, 500);
        } catch ({ response }) {
          e.target.classList.remove("disable");
          toast.dismiss(loadingToast);

          return toast.error(response.data.error);
        }
      });
    }

    const blogObject = {
      title,
      bannerImage,
      desc,
      content,
      tags,
      draft: true,
    };
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} alt="logo" />
        </Link>

        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
        </p>

        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Publish
          </button>
          <button className="btn-light py-2" onClick={handleSaveDraft}>
            Save Draft
          </button>
        </div>
      </nav>

      <Toaster />
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img
                  src={bannerImage}
                  className="z-20"
                  onError={(e) => (e.target.src = defaultBanner)}
                  alt="blog-banner"
                />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  onChange={handleBannerUpload}
                  hidden
                />
              </label>
            </div>
            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />

            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
}

export default BlogEditor;
