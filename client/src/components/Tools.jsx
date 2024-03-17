import Embed from "@editorjs/embed"; // to add youtube or social media video
import List from "@editorjs/list"; // to add ordered or unordered list
import Image from "@editorjs/image"; // to add image
import Header from "@editorjs/header"; // to add h1 or h2 in editor
import Quote from "@editorjs/quote"; // to add quotes
import Marker from "@editorjs/marker"; // to highlight any text
import InlineCode from "@editorjs/inline-code"; // pop up to change font size,bold, itallic
import { uploadImage } from "../common/Aws";

const uploadImageByUrl = (e) => {
  let link = new Promise((resolve, reject) => {
    try {
      resolve(e);
    } catch (error) {
      reject(error);
    }
  });

  return link.then((url) => {
    return {
      success: 1,
      file: { url },
    };
  });
};

const uploadImageByFile = (e) => {
  return uploadImage(e)
    .then((url) => {
      if (url) {
        return {
          success: 1,
          file: { url },
        };
      }
    })
    .catch((error) => console.log(error));
};

export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: uploadImageByUrl,
        uploadByFile: uploadImageByFile,
      },
    },
  },
  header: {
    class: Header,
    config: {
      placeholder: "Type heading...",
      levels: [2, 3],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  marker: Marker,
  inlineCode: InlineCode,
};
