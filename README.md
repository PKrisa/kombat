# KOMBAT

KOMBAT is a turn-based strategy web game where players summon minions, manage resources, and battle on a hexagonal board.

## Live Demo

Frontend: https://kombat-henna.vercel.app
Backend: https://kombat-backend-b5zn.onrender.com

## Features

* Single Player Mode
* Duel Mode (Real-time multiplayer with WebSocket)
* Custom strategy setup
* Configurable game settings
* Hexagonal battle board
* Turn-based combat system

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Java 17
* Spring Boot

### Realtime Communication

* WebSocket

### Deployment

* Vercel (Frontend)
* Render (Backend)

## How to Run Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd kombat
mvn spring-boot:run
```

## Environment Variables

Frontend:

```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
```

## Project Structure

```text
frontend/   -> React frontend
kombat/     -> Spring Boot backend
```

## Authors

์Natchanun Phattarapraditkul
