import React, { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/BlogEditor";
import PublishForm from "../components/PublishForm";
import Loader from "../components/Loader";
import axios from "axios";

const blogStructure = {
  title: "",
  bannerImage: "",
  desc: "",
  content: [],
  tags: [],
  author: { personal_info: {} },
};

export const EditorContext = createContext({});

function Editor() {
  const {
    userAuth: { token },
  } = useContext(UserContext);

  const [editorState, setEditorState] = useState("editor");
  const [blog, setBlog] = useState(blogStructure);
  const [textEditor, setTextEditor] = useState({ isReady: false });
  const [loading, setLoading] = useState(true);
  const { blogId } = useParams();

  useEffect(() => {
    if (!blogId) {
      return setLoading(false);
    }

    axios
      .post(`${process.env.REACT_APP_BASE_URL}/get-blog`, {
        blogId,
        draft: true,
        mode: "edit",
      })
      .then(({ data: { blog } }) => {
        setBlog(blog);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        setBlog(blogStructure);
      });
  }, []);

  return (
    <EditorContext.Provider
      value={{
        blog,
        setBlog,
        editorState,
        setEditorState,
        textEditor,
        setTextEditor,
      }}
    >
      {token === null ? (
        <Navigate to="/signin" />
      ) : loading ? (
        <Loader />
      ) : editorState === "editor" ? (
        <BlogEditor />
      ) : (
        <PublishForm />
      )}
    </EditorContext.Provider>
  );
}

export default Editor;
