Here’s a **README.md** draft tailored for your project submission. It’s clean, structured, and explains your **AI Interview Proctoring System** clearly:

---

# AI Interview Proctoring System 🎥🤖

This is my submission for the **TuteDude AI Interview Project Assignment**.
The project simulates a real-time **AI-powered interview platform** with two main roles:

* **Candidate** 🧑‍💻 → Takes the interview. Their video feed is monitored for focus, face detection, and prohibited items.
* **Admin** 🧑‍🏫 → Monitors ongoing and completed interviews, reviews logs, and sees live detections in real-time.

The project is built with the **MERN Stack + WebSockets** for real-time updates.

---

## 🔑 Features

### **Candidate Side**

1. **Focus Detection**

   * Detects if the candidate is not looking at the screen for more than **5 seconds**.
   * Detects if **no face** is present for more than **10 seconds**.
   * Detects **multiple faces** in the frame (if possible).
   * All these events are logged with timestamps.

2. **Item/Note Detection**
   Using object detection (**YOLO / TensorFlow\.js / coco-ssd**), the system can detect:

   * 📱 Mobile phones
   * 📚 Books / paper notes
   * 💻 Extra electronic devices
     All such detections are flagged and logged in **real time**.

---

### **Admin Side**

* View all **candidates who have completed interviews** along with their final scores and violation logs.
* Monitor **ongoing interviews in real time** with live logs of detections (focus issues, missing face, multiple faces, prohibited items).
* Access detailed reports for each candidate.

---

## 🛠️ Tech Stack

### **Frontend**

* React + Vite
* TailwindCSS (UI Styling)
* Socket.IO (real-time updates)
* TensorFlow\.js + coco-ssd (Object Detection)
* MediaPipe Face Mesh (Face + Focus Detection)

### **Backend**

* Node.js + Express
* MongoDB (Candidate Data + Logs)
* Socket.IO (real-time communication)
* Cloudinary (for video storage)

---

## 📦 Installation & Setup

### 🔹 Clone the Repository

```bash
git clone <repo-url>
cd ai-interview-project
```

---

### 🔹 Backend Setup (`/backend`)

1. Navigate to backend folder:

   ```bash
   cd backend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Create a `.env` file and configure it as follows:

   ```env
   PORT=3001
   ACCESS_TOKEN_EXPIRY="2d"
   ACCESS_TOKEN_SECRET="suraj123"
   MONGODB_URI=<your-mongodb-uri>
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
   SALT_ROUNDS=10
   FRONTEND_URL="http://localhost:5173"
   ```
4. Start backend server:

   ```bash
   npm run dev
   ```
5. Build (for production):

   ```bash
   npm run build
   npm start
   ```

---

### 🔹 Frontend Setup (`/frontend`)

1. Navigate to frontend folder:

   ```bash
   cd frontend
   ```
2. Install dependencies:

   ```bash
   npm install
   ```
3. Create `.env` file:

   ```env
   VITE_API_BASE_URL=http://localhost:3001
   ```
4. Start development server:

   ```bash
   npm run dev
   ```
5. Build (for production):

   ```bash
   npm run build
   npm run preview
   ```

---

## ⚡ How it Works

* **Candidate video feed** is processed in the browser using **MediaPipe + TensorFlow\.js**.
* Detected events (focus issues, missing faces, prohibited items) are logged locally and sent to the **backend via Socket.IO**.
* **Admins** receive real-time updates on all ongoing interviews.
* Completed interview logs are stored in MongoDB for later review.

---

## 📚 Libraries Used

```js
import * as faceMesh from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
```

---

## 🚀 Future Improvements

* Improve **multi-face detection** accuracy.
* Add **voice activity monitoring** (detect background conversations).
* Generate **automated reports** (PDF/Excel export).
* Integrate **AI scoring system** for candidate performance.

---

## 👨‍💻 Author

Assignment submission for **TuteDude**.
Built with ❤️ using **MERN + AI/ML libraries**.

---
