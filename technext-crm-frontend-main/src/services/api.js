import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

// Add JWT token to every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle 401 - redirect to login
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

// Leads
export const getLeads = () => axios.get(`${BASE_URL}/leads`);
export const getLeadById = (id) => axios.get(`${BASE_URL}/leads/${id}`);
export const createLead = (lead) => axios.post(`${BASE_URL}/leads`, lead);
export const updateLead = (id, lead) =>
  axios.put(`${BASE_URL}/leads/${id}`, lead);
export const deleteLead = (id) => axios.delete(`${BASE_URL}/leads/${id}`);

// Candidates
export const getCandidates = () => axios.get(`${BASE_URL}/candidates`);
export const getCandidateById = (id) =>
  axios.get(`${BASE_URL}/candidates/${id}`);
export const createCandidate = (c) => axios.post(`${BASE_URL}/candidates`, c);
export const updateCandidate = (id, c) =>
  axios.put(`${BASE_URL}/candidates/${id}`, c);
export const deleteCandidate = (id) =>
  axios.delete(`${BASE_URL}/candidates/${id}`);

// Job Orders
export const getJobOrders = () => axios.get(`${BASE_URL}/jobs`);
export const getJobOrderById = (id) => axios.get(`${BASE_URL}/jobs/${id}`);
export const createJobOrder = (job) => axios.post(`${BASE_URL}/jobs`, job);
export const updateJobOrder = (id, job) =>
  axios.put(`${BASE_URL}/jobs/${id}`, job);
export const deleteJobOrder = (id) => axios.delete(`${BASE_URL}/jobs/${id}`);

// Accounts
export const getAccounts = () => axios.get(`${BASE_URL}/accounts`);
export const createAccount = (a) => axios.post(`${BASE_URL}/accounts`, a);
export const updateAccount = (id, a) =>
  axios.put(`${BASE_URL}/accounts/${id}`, a);
export const deleteAccount = (id) => axios.delete(`${BASE_URL}/accounts/${id}`);

// Tasks
export const getTasks = () => axios.get(`${BASE_URL}/tasks`);
export const createTask = (t) => axios.post(`${BASE_URL}/tasks`, t);
export const updateTask = (id, t) => axios.put(`${BASE_URL}/tasks/${id}`, t);
export const deleteTask = (id) => axios.delete(`${BASE_URL}/tasks/${id}`);

// Meetings
export const getMeetings = () => axios.get(`${BASE_URL}/meetings`);
export const createMeeting = (m) => axios.post(`${BASE_URL}/meetings`, m);
export const updateMeeting = (id, m) =>
  axios.put(`${BASE_URL}/meetings/${id}`, m);
export const deleteMeeting = (id) => axios.delete(`${BASE_URL}/meetings/${id}`);

// Calls
export const getCalls = () => axios.get(`${BASE_URL}/calls`);
export const createCall = (c) => axios.post(`${BASE_URL}/calls`, c);
export const updateCall = (id, c) => axios.put(`${BASE_URL}/calls/${id}`, c);
export const deleteCall = (id) => axios.delete(`${BASE_URL}/calls/${id}`);

// Contacts
export const getContacts = () => axios.get(`${BASE_URL}/contacts`);
export const createContact = (data) => axios.post(`${BASE_URL}/contacts`, data);
export const updateContact = (id, data) =>
  axios.put(`${BASE_URL}/contacts/${id}`, data);
export const deleteContact = (id) => axios.delete(`${BASE_URL}/contacts/${id}`);

// Deals
export const getDeals = () => axios.get(`${BASE_URL}/deals`);
export const createDeal = (d) => axios.post(`${BASE_URL}/deals`, d);
export const updateDeal = (id, d) => axios.put(`${BASE_URL}/deals/${id}`, d);
export const deleteDeal = (id) => axios.delete(`${BASE_URL}/deals/${id}`);

// Placements
export const getPlacements = () => axios.get(`${BASE_URL}/placements`);
export const createPlacement = (p) => axios.post(`${BASE_URL}/placements`, p);
export const updatePlacement = (id, p) =>
  axios.put(`${BASE_URL}/placements/${id}`, p);
export const deletePlacement = (id) =>
  axios.delete(`${BASE_URL}/placements/${id}`);

// Users / Login
export const login = (credentials) =>
  axios.post(`${BASE_URL}/users/login`, credentials);
export const getUsers = () => axios.get(`${BASE_URL}/users`);
