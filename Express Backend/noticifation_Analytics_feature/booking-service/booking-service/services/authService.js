const axios = require("axios");

const AUTH_URL = "http://localhost:8081/api";

const getUserById = async (id, token) => {
    return await axios.get(`${AUTH_URL}/users/${id}`, {
        headers: {
            Authorization: token
        }
    });
};

const getProviderById = async (id, token) => {
    return await axios.get(`${AUTH_URL}/providers/${id}`, {
        headers: {
            Authorization: token
        }
    });
};

const getProviderByUserId = async (userId, token) => {
    return await axios.get(`${AUTH_URL}/providers/user/${userId}`, {
        headers: {
            Authorization: token
        }
    });
};

module.exports = {
    getUserById,
    getProviderById,
    getProviderByUserId
};