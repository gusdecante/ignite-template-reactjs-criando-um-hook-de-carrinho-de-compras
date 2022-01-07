import { api } from "../../services/api";

interface HttpGetByIdProps {
  path: string;
  id: number;
}

export const HttpGetById = async ({ path, id }: HttpGetByIdProps) => {
  const { data } = await api.get(`${path}/${id}`);
  return data;
};
