import axios from "axios";

export const uploadImage = async (img) => {
  let imageUrl = null;

  await axios
    .get(`${process.env.REACT_APP_BASE_URL}/get-upload-url`)
    .then(async ({ data: { uploadUrl } }) => {
      await axios({
        method: "PUT",
        url: uploadUrl,
        header: { "Content-Type": "multipart/form-data" },
        data: img,
      }).then(() => {
        imageUrl = uploadUrl.split("?")[0];
      });
    });

  return imageUrl;
};
