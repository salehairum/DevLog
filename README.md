# DevLog Mini Project

### Backend
To be able to run the backend, run the following commands to download libraries
```sh
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```
(Creating a venv is optional.)
then, make sure to create a .env file (like the .env.example) and write your own connection string there.

### Frontend
To allow running the Vite Dev Server, run the following commands
```sh
cd frontend
npm install
npm run dev
```