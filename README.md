# hux_backend

# Installation
    Import the hux.sql into the database. Set DB config in config.js to match your environment. 

    Run npm install
    Run npm start

    To use nodemon
    Run npm install -g nodemon
    Run nodemon start

# Unit Testing
    Run npm test  


# Swagger Documentation
    http://[api_url]:[port]/api-docs/

# Task
Create a simple web application that allows users to save contact information. Your application
should be divided into a backend RESTful API and a frontend that makes API calls to the
backend.
Backend Specifications
- Create the RESTful API using any server-side framework based on either
Python(Django) or Node.js. Do not write code outside of these languages.
- The API should have endpoints for:
- Creating a new user
- Login/Logout
- Creating a new contact
- Retrieving a list of all contacts
- Retrieving a single contact
- Updating a contact
- Deleting a contact
- Each contact should contain the following required fields:
- First name
- Last name
- Phone number
- Implement validation to ensure data is correctly formatted before saving it -
Use either MySQL, PostgreSQL, MongoDB as the database
- Secure your API by implementing appropriate authentication mechanisms (e.g. JWT,OAuth)
- Write unit tests for the Create and Update API endpoints.
- Use Git for version control
