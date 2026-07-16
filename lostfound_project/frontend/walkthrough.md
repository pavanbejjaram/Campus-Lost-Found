# Walkthrough - Campus Lost & Found 

We have built a premium, full-stack **Campus Lost & Found** featuring student authentication, listing moderating, image uploading, found item claim verification, and real-time chat.

## Changes Made

### 1. Database & Backend (Spring Boot)
- **Entities (`com.college.lostfound.model`)**:
  - [Student.java]: Stores student details and admin status.
  - [Item.java]: Item title, description, category, type (`LOST`/`FOUND`), location, date, status (`PENDING_APPROVAL`, `APPROVED`, `RESOLVED`, `REJECTED`), and image path.
  - [Claim.java]: Found item claim submissions.
  - [ChatMessage.java]: Chat messages between students.

- **Repositories (`com.college.lostfound.repository`)**:
  - [StudentRepository.java]
  - [ItemRepository.java]
  - [ClaimRepository.java]
  - [ChatMessageRepository.java]: Custom JPQL query to retrieve distinct chat partners and chronological conversation logs.

- **Controllers (`com.college.lostfound.controller`)**:
  - [AuthController.java]: Login, registration, and user profiles.
  - [ItemController.java]: Browse approved items, post listings (handles saving multipart uploaded images to the local server `uploads` directory).
  - [ClaimController.java]: Claim submissions, verifying ownership descriptions, and approving claims (which resolves the item and rejects conflicting claims).
  - [ChatController.java]: Historical logs.
  - [AdminController.java]: Approval queue, statistical summaries.

- **Configurations (`com.college.lostfound.config`)**:
  - [WebSocketConfig.java] & [ChatWebSocketHandler.java]: Standard native Java WebSocket text handlers. Saves messages to the database and dispatches them in real-time.
  - [WebMvcConfig.java]: Exposes the `/uploads/**` static resource handler so uploaded item images are served by Spring Boot. Sets CORS configs.
  - [DatabaseSeeder.java]: Auto-seeds database on startup with an admin, three students, two lost items, and two found items.

- **Properties**:
  - [application.properties]: Connects to local MySQL and configures Hibernate schema updates.

### 2. Frontend (React + Vite)
- **Index CSS**:
  - [index.css]: Beautiful dark-violet glassmorphic UI layout. Glow effects, custom scrollbars, animations, input fields, and chat bubble styles.

- **App Layout & Routes**:
  - [App.jsx]: Authenticates routing and sets navigation layers.

- **Components (`frontend/src/components`)**:
  - [Navbar.jsx]: Navigation menu, role validation (admins see the admin link, students do not).
  - [ItemCard.jsx]: Item layout card with location/date details, contact numbers, and type badges.
  - [Modal.jsx]: Smooth dialog overlay used to submit ownership claims.

- **Pages (`frontend/src/pages`)**:
  - [Login.jsx]: Double-tab authentication panel.
  - [Dashboard.jsx]: Item browse feed with type/category selectors.
  - [ReportItem.jsx]: Report submission form with image drag-and-drop selector.
  - [MyListings.jsx]: View listings, check claim logs, accept/reject ownership claims.
  - [Chat.jsx]: Dual-column inbox layout supporting list of contacts and real-time native WebSocket messaging.
  - [AdminDashboard.jsx]: Admin stats, student roster table, and moderation queue.

---

## Validation & Run Instructions

To run the application, follow these steps:

### Step 1: Configure MySQL Password
Open [application.properties]and update the password field with your MySQL root password:
```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Step 2: Run the Backend
Open a terminal in the backend directory and run:
```cmd
.\mvnw.cmd spring-boot:run
```
*(On startup, Hibernate will auto-create the database `lost_found_db_v2` and tables, and the DatabaseSeeder will insert sample data).*

### Step 3: Run the Frontend
Open a separate terminal in the frontend directory and run:
```cmd
npm run dev
```

### Step 4: Login and Browse
Open your browser and navigate to the local URL (usually `http://localhost:5173`).
- **Student Accounts (seeded)**:
  - Alice: `alice@college.edu` (password: `password123`)
  - Bob: `bob@college.edu` (password: `password123`)
  - Charlie: `charlie@college.edu` (password: `password123`)
- **Admin Account (seeded)**:
  - Admin: `admin@college.edu` (password: `admin123`)
