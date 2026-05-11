# 📋 Smart Task Management System

A full-stack, real-time Task Management System built with Python, Flask, and PostgreSQL. It features user authentication, a RESTful API for task operations, live updates via WebSockets, and data analytics.

## ✨ Features

- **User Authentication**: Secure user registration and login using `Flask-Login`.
- **Task Management**: Create, read, update, and delete tasks seamlessly.
- **Real-time Analytics**: Built-in analytics dashboard powered by `Pandas` and `NumPy` to track task progress and completion rates.
- **Live Updates**: Instant UI updates across sessions using WebSockets (`Flask-SocketIO`).
- **RESTful API**: Clean API endpoints for interacting with tasks programmatically.
- **Modern UI/UX**: Clean and responsive frontend built with HTML, CSS, and vanilla JavaScript.

## 🛠️ Technology Stack

- **Backend Framework**: Python, Flask
- **Database**: PostgreSQL (via `Flask-SQLAlchemy` ORM)
- **Real-Time Communication**: `Flask-SocketIO` (WebSockets)
- **Data Analytics**: `Pandas`, `NumPy`
- **Containerization (DB)**: Docker (`docker-compose`)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Clone the repository
```bash
git clone https://github.com/TheArvindKatariya/task_manager.git
cd task_manager
```

### 2. Set up the Python environment
Create a virtual environment and install the required dependencies:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Set up the Database (PostgreSQL)
The project includes a `docker-compose.yml` to quickly spin up a PostgreSQL instance.
```bash
docker-compose up -d
```

### 4. Configure Environment Variables
Create a `.env` file in the root of the directory and add the following:
```env
SECRET_KEY=your_super_secret_key
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/task_manager_db
```

### 5. Run the Application
Start the Flask application using:
```bash
python run.py
```
*The server will start on `http://127.0.0.1:5000`.*

## 📂 Project Structure

```text
task_manager/
│
├── app/                  # Application Package
│   ├── static/           # CSS and JS files
│   ├── templates/        # HTML templates
│   ├── __init__.py       # App initialization
│   ├── api.py            # REST API endpoints
│   ├── analytics.py      # Pandas/Numpy data processing
│   ├── auth.py           # Authentication routes
│   ├── models.py         # SQLAlchemy Database models
│   └── routes.py         # Main web routes
│
├── docker-compose.yml    # Database container configuration
├── requirements.txt      # Python dependencies
├── run.py                # Application entry point
└── .env                  # Environment variables
```
