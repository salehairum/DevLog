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

To run the backend, run the following command once
```sh
set FLASK_APP=app.py
```
The above command is for windows. 
Then run the server as
```sh
flask run
```

### Frontend
To allow running the Vite Dev Server, run the following commands
```sh
cd frontend
npm install
npm run dev
```