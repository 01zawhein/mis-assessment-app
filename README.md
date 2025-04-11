# mis-assessment-app
Two folders, 'flaskBackend' and 'studentDashboard', are in mis-assessment-app repository.
In order to run the app, we need to start the server before starting the frontend.

# Instruction for setting up and starting the backend
    # Check python version if it's 3.7.9 if not please read the following
    Download and Install Python 3.7.9 as Python latest version is not supported for my app. Following is the download link
        https://www.filehorse.com/download-python-64/53890/download/

    # After that, to start the backend server, go under flaskBackend in command prompt, and activate the virtual environment using the following command
        venv\Scripts\activate
    
    # Once the virtual environment is activated, use the follwoing command to run the server in command prompt
        python app.py

    # Now, server is running.


# Instructions for starting the frontend 
    If you haven't install Node.js, please install it. Follwing is the link to donwload Node.js
        https://nodejs.org/en/download

    After that, install dependencies for frontend in order to run the app successfully, navigate to 'studentDashboard' and type in the following command and it will automatically install all the reqired dependencies
        npm install

    Finally, you can run the app now using the following command, but ensure you are on the right file path that is under 'studentDashboard'
        npm run dev


# Troubleshooting if having errors in starting the backend server
    Setup virtual environment (venv) (Optional if you can't start the server in virtual environment delete 'venv' folder and install it again with the following command under 'flaskBackend' folder)
        For Windows
            First please check how many python version do you have using the following command
                py -0
            If you only have one python version, you can just use the following command
                py -m venv venv
            Otherwise
                py -3.7 -m venv venv

        Right now venv is installed, open command prompt and go under 'flaskBackend' and start the virtual environment using
            venv\Scripts\activate

        If you setup the virtual environment, after starting the virtual environment, please run the following command to install essential libraries and modules from requirement.txt under flaskBackend
            pip install -r requirements.txt

        Right now, virtual environment setup is finished.