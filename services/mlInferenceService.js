import axios from "axios";

export const runML = async (text) => {
  const response = await axios.post(
    process.env.ML_URL + "/predict",
    { text }
  );

  return response.data;
};