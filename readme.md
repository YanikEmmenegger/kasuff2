# Kasuff2 - The Ultimate Drinking Party Game 🍻🎉

**Kasuff2** is a multiplayer drinking game designed for parties! Think of it as Kahoot but with a boozy twist. With
hilarious game modes, a fast-paced real-time experience, and customizable rules, Kasuff2 is perfect for spicing up your
gatherings.

---

## 🚀 Features

- **Multiplayer Fun**: Play with your friends in real time using **Socket.IO**.
- **Diverse Game Modes**:
    - **Multiple-Choice**: Answer trivia questions, and the loser drinks!
    - **Who Would Rather**: Vote on funny or daring questions—punishments for the minority!
    - **What Would You Rather**: Choose between two options and see who loses.
    - **Ranking**: Rank others based on a topic, and the most/least voted drinks.
    - **Hide and Seek**: Find your avatar thats hidden among the others.
    - **Memory**: Match cards
    - **Sequence**: See the sequence and repeat it.
    - **Word Scramble**: Unscramble words before the timer runs out.
    - **Code Breaker**: Crack the code and avoid being the last to succeed.
    - **Spy**: Guess who the secret spy is before they sabotage your round!

- **Cross-Platform**: Built with React and Vite for a smooth experience across devices.
- **Real-Time Gameplay**: Powered by Node.js and Socket.IO for low-latency communication.
- **Persistent Data**: MongoDB ensures a seamless game flow even when players reconnect.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js with Socket.IO
- **Database**: MongoDB
- **Deployment**: Docker Compose with Nginx

---

## 📦 Installation

1. Clone the repository:
    ```bash
    git clone REPO_URL
2. Adjust the env vars in `.env.example` and rename it to `.env`.:
    ```bash
    cp .env.example .env
    ```
3. Upadte the BASE_QUESTION.json with your questions (1000+ German questions already existing).
    ```bash
    nano mongo-init/BASE_QUESTION.json
    ```
3. create ssl certificates with certbot for your domain
    ```bash
    certbot certonly --standalone -d yourdomain.com
    ```
4. update the `nginx.conf` file with your domain
    ```bash
    nano nginx/nginx.conf
    ```
5. Run the following command to start the server:
    ```bash
    docker-compose up --build -d
    ```
## 👽independent frontend/backend 
You can also run the Frontedn/Backend seperatly in dev mode by using the following commands:
```bash
cd frontend
npm run dev
```
```bash
cd backend
npm run dev
```
make sure mongo instance is running on your machine and reachable by the backend.
```bash
'mongodb://root:example@localhost:27017/kasuff2?authSource=admin';
```
