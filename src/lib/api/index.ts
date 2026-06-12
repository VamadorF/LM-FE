export { API_BASE_URL } from "./config";
export { ApiError, checkApiHealth, getActiveApiRole, hasApiSession, setActiveApiRole } from "./client";
export { bootstrapAuth } from "./auth";
export * as contactsApi from "./contacts";
export * as contactBooksApi from "./contact-books";
export * as proposalsApi from "./proposals";
