export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('swapskills_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function handleResponse(response) {
  if (response.status === 204) {
    return null;
  }
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    if (data && typeof data === 'object') {
      if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map((err) => `${err.loc.join('.')}: ${err.msg}`).join(', ');
      } else if (data.detail) {
        errorMessage = data.detail;
      }
    } else if (typeof data === 'string') {
      errorMessage = data;
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  // Auth
  async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  async getMe() {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Skills Catalog
  async getSkills() {
    const response = await fetch(`${API_BASE_URL}/skills/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },

  async createSkill(skillData) {
    const response = await fetch(`${API_BASE_URL}/skills/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(skillData),
    });
    return handleResponse(response);
  },

  // User Skills
  async getUserSkills(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/user-skills/user/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (response.status === 404) {
        return [];
      }
      return await handleResponse(response);
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },

  async addUserSkill({ skill_id, type }) {
    const response = await fetch(`${API_BASE_URL}/user-skills/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ skill_id, type }),
    });
    return handleResponse(response);
  },

  async removeUserSkill(userSkillId) {
    const response = await fetch(`${API_BASE_URL}/user-skills/${userSkillId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Discovery / Swap Matching
  async discoverUsers(skillId, type) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/user-skills/discover?skill_id=${encodeURIComponent(skillId)}&type=${encodeURIComponent(type)}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
        }
      );
      if (response.status === 404) {
        return [];
      }
      return await handleResponse(response);
    } catch (err) {
      if (err.status === 404) return [];
      throw err;
    }
  },
};
