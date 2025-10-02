import axios from "axios";

export const API_BASE_URL = 'http://localhost:8080';
// export const API_BASE_URL = 'https://1990-49-14-166-78.ngrok-free.app';


const jwtToken=localStorage.getItem("jwt")

export const api = axios.create({baseURL: API_BASE_URL,
    
        headers:{
            "Authorization" :`Bearer ${jwtToken}`,
            "Content-Type" : "application/json"
        }
    
})