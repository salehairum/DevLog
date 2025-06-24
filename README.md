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
then, make sure to create a .env file (like the .env.example) and write your own connection string there. (in the backend folder)

To run the backend, run the following command once
```sh
set FLASK_APP=app.py
```
The above command is for windows. 
Then run the server as
```sh
flask run
```
also add a "firebase-service-account.json" to the backend folder.

### Frontend
To install dependencies, run the following commands
```sh
cd frontend
npm install
```
To run,
```sh
npm run dev
```
If your backend is running on a different port, modify it in the .env file in frontend folder.
Modify the firebase variables accordingly as well.
