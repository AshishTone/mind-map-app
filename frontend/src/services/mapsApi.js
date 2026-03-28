const API_BASE_URL = "http://localhost:5000/api";

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || "Request failed");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const signupUser = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const loginUser = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return handleResponse(response);
};

export const fetchMaps = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/maps?userId=${userId}`);
  return handleResponse(response);
};

export const fetchMap = async ({ mapId, userId }) => {
  const response = await fetch(`${API_BASE_URL}/maps/${mapId}?userId=${userId}`);
  return handleResponse(response);
};

export const createMap = async ({ userId, username, title, description, rootNode }) => {
  const response = await fetch(`${API_BASE_URL}/maps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, username, title, description, rootNode })
  });

  return handleResponse(response);
};

export const saveMap = async (map) => {
  const response = await fetch(`${API_BASE_URL}/maps/${map._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: map.userId,
      title: map.title,
      description: map.description,
      rootNode: map.rootNode
    })
  });

  return handleResponse(response);
};

export const deleteMap = async ({ mapId, userId }) => {
  const response = await fetch(`${API_BASE_URL}/maps/${mapId}?userId=${userId}`, {
    method: "DELETE"
  });

  return handleResponse(response);
};

export const generateMap = async ({ title, description, depth }) => {
  const response = await fetch(`${API_BASE_URL}/maps/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, depth })
  });

  return handleResponse(response);
};
