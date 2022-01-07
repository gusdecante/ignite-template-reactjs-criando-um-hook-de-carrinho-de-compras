import { api } from "../../services/api";

interface HttpGetProps {
  path: string;
}

export const HttpGet = async ({ path }: HttpGetProps) => {
  const { data } = await api.get(path);
  return data;
};

export default HttpGet;
