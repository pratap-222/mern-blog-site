import React, { useContext } from "react";
import { EditorContext } from "../pages/Editor";
import toast from "react-hot-toast";

function Tag({ tag, tagIndex }) {
  let {
    blog,
    blog: { tags },
    setBlog,
  } = useContext(EditorContext);

  const handleTagDelete = () => {
    tags = tags.filter((t) => t !== tag);
    setBlog({ ...blog, tags });
  };

  const addTagEditable = (e) => {
    e.target.setAttribute("contentEditable", true);
    e.target.focus();
  };

  const handleTagEdit = (e) => {
    if (e.keyCode === 13 || e.keyCode === 188) {
      e.preventDefault();

      let updatedTag = e.target.innerText;

      if (tags.includes(updatedTag) === false) {
        tags[tagIndex] = updatedTag;
        setBlog({ ...blog, tags });
      } else {
        setBlog({ ...blog, tags });
        return toast.error(`Tag "${updatedTag}" already present`);
      }

      e.target.setAttribute("contentEditable", false);
    }
  };

  return (
    <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover: bg-opacity-50 pr-10">
      <p
        className="outline-none"
        onKeyDown={handleTagEdit}
        onClick={addTagEditable}
      >
        {tag}
      </p>

      <button
        className="mt-[2px] rounded-full absolute right-3 top-1/2 -translate-y-1/2"
        onClick={handleTagDelete}
      >
        <i className="fi fi-br-cross text-sm pointer-events-none" />
      </button>
    </div>
  );
}

export default Tag;
