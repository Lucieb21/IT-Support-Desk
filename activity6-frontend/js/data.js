
import { API_BASE_URL } from "./config.js";

// Send requests to the backend API
async function request(path, method = "GET", body) {
    const options = { method };

    if (body !== undefined) {
        options.headers = {
            "Content-Type": "application/json"
        };
        options.body = JSON.stringify(body);
    }

    const response = await fetch(API_BASE_URL + path, options);

    let data;
    try {
        data = await response.json();
    } catch {
        throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
        throw new Error(data.message || "The request failed.");
    }

    return data;
}

// Data service connected to the backend
export const recordService = {
    async list() {
        return request("/api/records");
    },

    async get(id) {
        return request(`/api/records/${id}`);
    },

    async create(record) {
        return request("/api/records", "POST", record);
    },

    async update(id, record) {
        return request(`/api/records/${id}`, "PUT", record);
    },

    async remove(id) {
        return request(`/api/records/${id}`, "DELETE");
    }
};
