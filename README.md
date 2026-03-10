# Project Assignment

# Web Development - Advanced Concepts TFWN19/TFWN14

## Test Admin account

**[Admin Account]**

- **User Name:** admin@jkpgcity.se
- **Password:** password

## Completed requirements (Grade 3, 4, and 5)

- User Registration & Login (Session management using `cookie-parser`)
- Add, Update, and Delete Venues (Requires Admin/Logged-in status)
- Database integration with PostgreSQL
- Docker containerization for Frontend and Backend

# Docker Commands for frontend and backend:

Docker file has been added and folder has been arranged accordingly

docker build -t my-backend-image . ---- create the docker image
docker run -p 3000:3000 --name backend-container my-backend-image --- create container and run it on specified port number in this case 3000
docker ps -- to check if container is running

## Docker commands for database :

docker build -t my-postgres-image .
docker start my-postgres-container -- use this if container already exist
docker run -d -p 5432:5432 --name my-postgres-container my-postgres-image

## need to be fixed

log out button needs to be fixed
duplicate code in index.html and nav.html
Add a venue heading is visible if the user is not logged in

- User registration & Log In & Admin account
