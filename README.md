# 🌌 AlgoSphere

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

AlgoSphere is a premium, full-stack online coding judge platform that allows developers to solve algorithm challenges, compile and run code in real-time, trace their submission statistics, climb a global leaderboard, and review video solution editorials.

> [!TIP]
> **Dynamic theme toggling** is supported globally. Use the Sun/Moon icons in the toolbar to switch layouts and synchronize the Monaco Editor theme instantly!

---

## ❓ Why AlgoSphere?

Traditional coding platforms often present a steep learning curve and lack personalized, interactive resources. **AlgoSphere** was built to solve these gaps by creating a premium, self-hosted coding ecosystem:

* **Interactive AI Assistance**: Avoid getting stuck. AlgoSphere features an integrated AI Chat Assistant directly in the workspace to explain algorithm constraints, debug syntax issues, and provide conceptual hints.
* **Apple Watch-Style Progress Rings**: Simple percentages are boring. AlgoSphere translates coding milestones into Apple-style concentric Rings and weekly contribution Heatmaps, giving developers a tactile, rewarding sense of completion.
* **Gamified Leaderboards**: Climbing a visual Gold/Silver/Bronze crown podium keeps users engaged and fosters friendly competition.
* **Direct Video Solution Editorials**: Instead of forcing developers to leave the platform to search YouTube, administrators can host direct explanation videos right next to the code editor.

---

## 📸 Visual Preview

### Practice Lobby (Homepage)
![Practice Playground Lobby](assets/screenshots/homepage.png)

### User Profile Analytics Dashboard (Apple rings & GitHub heatmap)
![User Profile Analytics Dashboard](assets/screenshots/profile.png)

### Global Leaderboard (High Contrast Light/Dark Mode Toggle)
![Global Leaderboard Podium](assets/screenshots/leaderboard.png)

### Admin Management Control Panel
![Admin Management Panel](assets/screenshots/admin_panel.png)

### Authentication Portals
| Login Page | Signup Page |
| :---: | :---: |
| ![Login Gate](assets/screenshots/login.png) | ![Signup Gate](assets/screenshots/signup.png) |

---

## 🚀 Key Features

### 💻 1. Interactive Coding Workspace
* **Monaco Editor Integration**: Write solutions in a VS Code-style editor with syntax highlighting, autocomplete, and auto-formatting.
* **Multi-Language Support**: Supports **C++**, **Java**, and **JavaScript** execution.
* **Stopwatch Coding Timer**: Integrated widget next to language selection counting minutes and seconds (`MM:SS`) with play, pause, reset, and hide controls.
* **Test Case Sandbox**: Compile and execute code against custom visible inputs with detailed stdout and run results.

### 📊 2. User Profile Analytics (Apple & GitHub Style)
* **Concentric Progress Ring Gauges**: Apple Watch-style concentric circular SVG progress rings showing completion rates for **Easy**, **Medium**, and **Hard** problems.
* **GitHub-Style Contribution Heatmap**: A custom interactive 365-day grid tracking daily submission frequencies with detailed hover tooltips.
* **Topic Proficiency Meters**: Solved-to-total progress indicators tracking topic stats (Arrays, Dynamic Programming, LinkedLists, Graphs).
* **Active Streak Tracker**: Calculates and displays current consecutive coding days.
* **Interactive Solved List**: A scrollable index of all solved challenges with direct practice links.

### 🏆 3. Global Leaderboard & Gamification
* **Podium Crown Highlights**: Gold, Silver, and Bronze crown podium banners for the top 3 ranked developers.
* **Points Tallying System**: Ranks are computed dynamically using problem difficulties:
  * Easy = 10 pts
  * Medium = 30 pts
  * Hard = 100 pts
* **Rankings Table**: Sorts all platform users by points, solved breakdown, total submissions, and execution accuracy percentage.

### 🌓 4. Dynamic Theme Toggle (Light & Dark Mode)
* **Global Theme Switcher**: Toggle between a sleek dark glassmorphism SaaS interface and a soft, high-contrast slate-white light theme.
* **Dynamic Monaco Theme Sync**: Switches the Monaco Editor canvas between `vs-dark` and `light` dynamically on theme toggle.

### 📹 5. Video Solution Editorials
* **Embedded Video Player**: View editorial video solutions directly in the workspace under the "Editorial" tab.
* **Admin Upload Interface**: Admin dashboard supporting direct, signed video uploads to Cloudinary.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Redux Toolkit, Tailwind CSS v4, DaisyUI, Lucide React, Monaco Editor.
* **Backend**: Node.js, Express, MongoDB, Mongoose, Redis.
* **Third-Party Services**:
  * **Judge0 / Piston**: Remote execution sandbox for compiling and evaluating code.
  * **Cloudinary**: Cloud video hosting and media asset management.

---

## 📐 System Architecture

This diagram shows how different components and services interact within **AlgoSphere**:

```mermaid
graph TD
    User([Developer / User]) <-->|Interacts| FE[React Frontend]
    FE <-->|API Requests| BE[Express Backend]
    
    subgraph Databases & Cache
        BE <-->|Mongoose Models| DB[(MongoDB Atlas)]
        BE <-->|Caching & Session| RD[(Redis Cache)]
    end
    
    subgraph Third Party Services
        BE -->|Compile & Run Code| JC[Judge0 / Piston Compiler]
        BE -->|Upload Video Editorials| CL[Cloudinary Video CDN]
    end
    
    JC -->|Execute Code| TC{Test Cases}
    TC -->|Return Results| BE
    CL -->|Serve Editorial Player| FE
```

### Architectural Flow Explanation:

1. **Client-Side (React)**: Represents the developer workspace. It renders the Monaco code editor, handles timing states, and makes API calls to compile code, verify login status, or fetch scores.
2. **Server-Side (Express)**: Orchestrates routes, enforces JWT cookies authentication, and handles communication with secondary services.
3. **Database & Cache (MongoDB / Redis)**:
   * **MongoDB Atlas** stores permanent entities (Users, Problems, Submissions).
   * **Redis Cache** caches frequently read dashboards (like Leaderboard positions) to guarantee fast access speeds.
4. **Third-Party Compilers & Storage**:
   * **Piston Compiler** runs code submissions in isolated sandboxes and checks against visible/hidden test cases.
   * **Cloudinary** holds solution editorials videos, streaming them directly to the client's workspace.

---

## 🔌 API Documentation

AlgoSphere exposes the following backend REST API endpoints:

### 🔐 1. Authentication (`/user`)
* `POST /user/register` - Registers a new developer account.
* `POST /user/login` - Authenticates user credentials and sets a secure `httpOnly` JWT cookie.
* `GET /user/profile` - Fetches profile metadata of the currently authenticated session.
* `GET /user/logout` - Clears the JWT session cookie and terminates the connection.

### 📝 2. Practice Lobby & Leaderboard (`/problem`)
* `GET /problem/getAllProblem` - Retrieves all programming challenges with metadata and solved tallies.
* `GET /problem/problemById/:id` - Fetches complete problem schema, including start codes and test cases.
* `GET /problem/profileStats` - Retrieves circular rings stats, streaks tally, and the 365-day submission heatmap.
* `GET /problem/leaderboard` - Returns gold/silver/bronze podium lists and points standings of all developers.
* `PUT /problem/update/:id` - Admins update a challenge details, visible/hidden cases, and templates.

### ⚙️ 3. Execution & Submissions (`/submission`)
* `POST /submission/run` - Evaluates source code sandboxes against visible examples (returns stdout / runtime).
* `POST /submission/submit` - Evaluates code against hidden test cases. If successful, creates a submission log, updates user solved array, and recalculates point metrics.
* `GET /submission/history/:problemId` - Returns the logged-in user's submission history and source code copies.

### 🤖 4. AI Chat Companion (`/ai`)
* `POST /ai/chat` - Connects the workspace chat console with the Gemini API to debug and explain coding constraints.

### 📹 5. Video Editorials (`/video`)
* `POST /video/upload` - Signed upload channel mapping solution videos directly to Cloudinary.
* `GET /video/solutions/:problemId` - Retrieves stream URLs for editorial walkthrough players.

---

## 🗄️ Database Schema & ER Diagram

Below is the Entity Relationship (ER) diagram representing the MongoDB collections and schemas used in **AlgoSphere**:

```mermaid
erDiagram
    USER ||--o{ SUBMISSION : submits
    PROBLEM ||--o{ SUBMISSION : has
    PROBLEM ||--o| SOLUTION_VIDEO : has
    USER ||--o{ PROBLEM : solves

    USER {
        ObjectId id PK
        string firstName
        string emailId
        string password
        ObjectIdArray problemSolved FK
        number points
    }

    PROBLEM {
        ObjectId id PK
        string title
        string dscription
        string difficultylevel
        string tag
        objectArray visibleTestCases
        objectArray hiddenTestCases
        objectArray startcode
        objectArray refrenceSolution
    }

    SUBMISSION {
        ObjectId id PK
        ObjectId userId FK
        ObjectId problemId FK
        string code
        string language
        string status
        number runtime
        number memory
        date createdAt
    }

    SOLUTION_VIDEO {
        ObjectId id PK
        ObjectId problemId FK
        string secureUrl
        string cloudinaryPublicId
    }
```

---

## ⚡ Caching & Performance (Redis)

To handle high traffic and resource-intensive actions, **AlgoSphere** integrates a self-hosted Redis instance for database optimization and queue caching:

* **Leaderboard Caching**: Calculating global developer rankings requires Mongoose aggregates to scan all user records, compute points, and sort rankings. To avoid overloading MongoDB, these aggregated ranks are cached in Redis for 5 minutes, allowing near-instantaneous page reloads.
* **Sandboxed Execution Queue**: Compiling code inside Judge0/Piston sandboxes is a resource-heavy action. Redis handles task queues to safely throttle execution requests, protecting compilation servers from concurrent CPU spikes.
* **Rate Limiting Protection**: Tracks request frequencies by IP address/user sessions to prevent API spamming on "Run Code" compilation endpoints.

---

## 📂 Project Structure

Below is the directory tree mapping showing the file structure of both the `client` and `server` folders in **AlgoSphere**:

```text
AlgoSphere/
├── client/                     # Frontend Application (React)
│   ├── public/                 # Static public assets
│   └── src/
│       ├── assets/             # Images and styles assets
│       ├── components/         # Reusable UI widgets
│       │   ├── AdminUpdate.jsx # Problem update dashboard view
│       │   ├── ChatAi.jsx      # Gemini/ChatGPT-style coding helper
│       │   └── SubmissionHistory.jsx # Submissions list & code preview
│       ├── pages/              # Main route views
│       │   ├── Home.jsx        # Dashboard problem lobby
│       │   ├── Leaderboard.jsx # Podium rankings table
│       │   ├── Login.jsx       # Authentication access
│       │   ├── ProblemPage.jsx # Code editor workspace & compiler
│       │   ├── Profile.jsx     # Concentric progress rings & heatmap
│       │   └── Signup.jsx      # Guest registration portal
│       ├── App.jsx             # Main Router navigation mapping
│       ├── index.css           # Global stylesheets & Light overrides
│       └── main.jsx            # Entry point render
├── server/                     # Backend API Server (Node.js & Express)
│   └── src/
│       ├── config/             # Database connection setups
│       │   ├── db.js           # Mongoose MongoDB connection
│       │   └── redis.js        # Redis cache configuration
│       ├── controllers/        # Route query controllers
│       │   ├── userAuth.js     # User registration/login controllers
│       │   └── userProblem.js  # Solved counters, heatmaps, & ranking
│       ├── Models/             # Mongoose schemas
│       │   ├── problem.js      # Code templates & test cases schema
│       │   ├── submission.js   # User submission records schema
│       │   └── user.js         # Score, solved list, & avatar schema
│       ├── routes/             # API routing channels
│       │   ├── userAuth.js     # Auth route endpoints
│       │   └── problemCreator.js # Practice playground route endpoints
│       └── index.js            # Main backend entry point
├── .gitignore                  # Git untracked files setup
└── README.md                   # Project documentation
```

---

## ⚙️ Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/Har-2505/AlgoSphere.git
cd AlgoSphere
```

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory:

```env
PORT=3000
DB_CONNECT_STRING=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/AlgoSphere
JWT_KEY=your_jwt_secret_key
REDIS_PASS=your_redis_password
PISTON_URL=http://localhost:2000
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Install dependencies and start the application

#### Setup Backend:
```bash
cd server
npm install
node src/index.js
```

#### Setup Frontend:
```bash
cd client
npm install
npm run dev
```

---

## 🔒 Security Best Practices
* **No Hardcoded Secrets**: All database strings, JWT keys, and third-party credentials are managed strictly through `.env` configurations.
* **Environment Files Ignored**: `.env` is listed inside `.gitignore` to prevent secret leaks on public repositories.

> [!CAUTION]
> Never push your local `.env` file or any credentials to public GitHub repositories. Keep database connections secure by using system environment variables.