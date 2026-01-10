// src/lib/socket.ts
import { io } from "socket.io-client";
import API_BASE_URL from "./api"; // Ensure this points to your backend (e.g., http://localhost:5000)

// Connect to the backend URL
export const socket = io(API_BASE_URL, {
  autoConnect: false, // We will connect manually when the user logs in
});