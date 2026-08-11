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

// Approved providers for a category. The Auth Service already filters to
// approved (findByCategoryIdAndIsApprovedTrue), so callers only need to apply
// availability rules on top of what comes back.
const listProvidersByCategory = async (categoryId, token) => {
    return await axios.get(`${AUTH_URL}/providers`, {
        params: {
            categoryId
        },
        headers: {
            Authorization: token
        }
    });
};

// Server-to-server: PUT /api/providers/{id}/rating is permitAll in the Auth
// Service's SecurityConfig, so no token is required. The short timeout matters -
// this runs off the back of a review submission, and an unreachable Auth Service
// must never hold that request open.
const updateProviderRating = async (providerId, rating) => {
    return await axios.put(
        `${AUTH_URL}/providers/${providerId}/rating`,
        { rating },
        { timeout: 3000 }
    );
};

module.exports = {
    getUserById,
    getProviderById,
    getProviderByUserId,
    listProvidersByCategory,
    updateProviderRating
};