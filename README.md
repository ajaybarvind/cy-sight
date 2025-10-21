# Cy-SIGHT: Personal Threat Intelligence Dashboard

Cy-SIGHT is a full-stack web application designed to provide quick threat intelligence on IP addresses. Users can enter an IP to get its abuse score, country of origin, and geolocation data. The dashboard also maintains a history of recent checks for easy reference.



## ✨ Features

* **Real-time IP Analysis:** Instantly checks an IP address against the AbuseIPDB API.
* **Geolocation Details:** Fetches and displays the IP's geographical location and ISP information.
* **Abuse Score:** Color-coded scoring to quickly identify potentially malicious IPs.
* **Search History:** The dashboard displays a list of the most recently checked IPs for quick review.
* **Full-Stack Architecture:** Built with a React frontend and a Node.js/Express backend connected to a PostgreSQL database.

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Axios
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **APIs:** AbuseIPDB, IP-API.com
* **Deployment:** Frontend hosted on Vercel/Netlify, Backend & DB on Render.

---

## 🚀 Getting Started

To run this project locally, you will need to set up both the frontend and backend services.

### Prerequisites

* Node.js (v18 or later)
* npm / yarn
* A PostgreSQL database
* An API key from [AbuseIPDB](https://www.abuseipdb.com/)

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/cy-sight-backend.git](https://github.com/your-username/cy-sight-backend.git)
    cd cy-sight-backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file** in the root and add your environment variables:
    ```env
    DATABASE_URL="your_postgresql_connection_string"
    ABUSEIPDB_API_KEY="your_abuseipdb_api_key"
    PORT=3001
    ```
4.  **Start the server:**
    ```bash
    npm start
    ```

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../cy-sight-frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env.local` file** in the root and point it to your local backend server:
    ```env
    VITE_API_BASE_URL="http://localhost:3001"
    ```
4.  **Start the frontend client:**
    ```bash
    npm run dev
    ```

The application should now be running on `http://localhost:5173` (or another port specified by Vite).
