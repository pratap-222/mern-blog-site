import axios from "axios";

export const FilterPaginationData = async ({
  create_new_arr = false,
  state,
  data,
  page,
  countRoute,
  data_to_send = {},
}) => {
  let obj = {};

  if (state !== null && create_new_arr === false) {
    obj = { ...state, results: [...state.results, ...data], page };
  } else {
    try {
      const countData = await axios.post(
        `${process.env.REACT_APP_BASE_URL}${countRoute}`,
        data_to_send
      );

      const {
        data: { totalDocs },
      } = countData;

      obj = { results: data, page: 1, totalDocs };
    } catch (error) {
      console.log(error);
    }
  }

  return obj;
};
