# script to restart the server -> docker compsoe down, git pull, docker-compose up --build -d

# stop the server
docker compose down

# pull the latest changes
git pull

# start the server
docker compose up --build -d

#check the status
docker compose ps
