ROOT PROJECT README (MedLoopAI/README.md)
# MedLoopAI

MedLoopAI is a full-stack AI-based medical assistance platform.  
It combines MERN stack with an AI service using YOLO for medical image analysis.

## Tech Stack
- Frontend: React (Vite)
- Backend: Node.js, Express
- AI Service: Python, YOLO
- Database: MongoDB

## Folder Structure


MedLoopAI/
│── ai_service/
│── backend/
│── frontend/
│── README.md
│── .gitignore


## Setup Instructions

### 1. Clone Repository
bash
git clone <your-github-repo-link>
cd MedLoopAI

2. Setup AI Service

See ai_service/README.md for instructions

3. Run Backend
cd backend
npm install
npm start

4. Run Frontend
cd frontend
npm install
npm run dev

Notes

Large files like yolov8n.pt are not included due to size

Environment variables are stored in .env (not in repo)

AI service runs independently and communicates with backend


---

# 2️⃣ AI SERVICE README (`ai_service/README.md`)

md
# AI Service – MedLoopAI

This service handles the AI functionality using YOLO for medical image analysis.

## Tech Stack
- Python 3.8+
- YOLO (Ultralytics)
- Flask / FastAPI (as used in app.py)

## Setup Instructions

### 1. Create Virtual Environment (Optional)
bash
python -m venv venv
venv\Scripts\activate   # Windows

2. Install Dependencies
pip install -r requirements.txt

3. YOLO Model Setup

Download yolov8n.pt from the official Ultralytics repository and place it inside the ai_service/ folder

4. Run AI Service
python app.py

Notes

Ensure the model file is present before starting

This service communicates with the backend via API


---

# 3️⃣ BACKEND README (`backend/README.md`)

md
# Backend – MedLoopAI

This is the backend of MedLoopAI, built with Node.js and Express.

## Setup Instructions

### 1. Install Dependencies
bash
npm install

2. Configure Environment Variables

Create a .env file with the following:

PORT=5000
MONGO_URI=<your-mongo-db-uri>
AI_SERVICE_URL=http://localhost:5001  # or your AI service port

3. Start Backend
npm start


The backend runs on http://localhost:5000 and communicates with the frontend and AI service.


---

# 4️⃣ AI SERVICE REQUIREMENTS (`ai_service/requirements.txt`)



flask
torch
torchvision
ultralytics
numpy
opencv-python
pandas
requests


---

✅ **Steps After Ye Files Bana Lo**:

1. **GitHub Desktop open**  
2. Left panel: ai_service, backend, frontend, README, requirements.txt **check karo**  
3. `venv`, `.env`, `.pt` **UNcheck**  
4. Summary:  
