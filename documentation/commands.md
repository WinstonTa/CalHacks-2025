# Terminal Commands
## Verify Node.js, npm, and vite installations
Node.js relies on its package manager, npm

node -v
npm -v
vite --version

## Create React application
npm create vite@latest spark-cs -- --template react

## Run React Application
npm run dev

Localhost: http://localhost:5173/

## Install Dependencies
npm install

npm run dev (again)

# Deploy Entire Project
## Back End
cd spark-cs
cd server
node index.js

## Front End
cd spark-cs
npm run dev
