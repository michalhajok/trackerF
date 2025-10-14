import api from "@/lib/api";

export const get = (url, options) =>
  api.get(url, options).then((res) => res.data);

export const post = (url, data, options) =>
  api.post(url, data, options).then((res) => res.data);

export const patch = (url, data, options) =>
  api.patch(url, data, options).then((res) => res.data);

export const del = (url, options) =>
  api.delete(url, options).then((res) => res.data);
