export const getCredentials = async (roomName, role) => {
  // Default
  try {
    const url = `/api/room/${roomName}?role=${role}`;
    const config = {};
    const response = await fetch(`${url}`, config);
    const data = await response.json();
    console.log(data);
    if (data.apiKey && data.sessionId && data.token) {
      return Promise.resolve(data);
    }
    return Promise.reject(new Error('Credentials Not Valid'));
  } catch (error) {
    console.log(error.message);
    return Promise.reject(error);
  }
};
