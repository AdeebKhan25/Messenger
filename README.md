# Messenger App

Welcome to the **Messenger App**! This application allows users to chat in real-time, send messages, and share files. Built with modern web technologies, it provides a seamless and interactive messaging experience.

## Features

- **Real-time Messaging**: Exchange messages instantly using WebSockets.
- **File Sharing**: Upload and view images directly within the chat interface.
- **User Authentication**: Secure login and logout functionality.
- **Offline Support**: Displays offline users and handles messages appropriately.

## Technologies

- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB (using Mongoose)
- **WebSockets**: ws

<h2>Getting Started</h2>

To get started with this project locally, follow these steps:

1. Clone the Repository:
```bash
git clone https://github.com/YourUsername/Messenger.git
cd Messenger
```
2. Navigate to the Client Directory:
```bash
cd client
```
3. Install dependencies:
```bash
yarn install
```
4. Navigate to the API Directory:
```bash
cd ../API
```
5. Install dependencies:
```bash
yarn install
```
6. Create a .env File in the API directory and add your MongoDB URL and other environment variables like JWT Secret and Client URL.
7. Start the backend server:
```bash
nodemon index.js
```
8. Start the frontend client:
```bash
yarn run dev
```


