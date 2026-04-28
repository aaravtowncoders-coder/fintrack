# FinTrack Transfer Guide

This guide explains where your files are currently located and how you can transfer and run your application on another computer.

## Where are my files?
All of your FinTrack files are currently located in the following folder on your laptop:
**`D:\Fintrack`**

Inside this folder, you have:
- `backend/` -> Contains your Java Spring Boot backend code.
- `src/` -> Contains your React frontend code.
- `package.json`, `index.html`, `vite.config.ts`, etc. -> Frontend configuration files.

## How to run this on another laptop

To migrate your FinTrack project to a new laptop and run it successfully, you will need to follow these steps.

### Step 1: Transfer the Code
1. Zip or copy the entire `D:\Fintrack` folder onto a USB drive, or upload it to Google Drive/OneDrive. 
2. Paste and extract the folder onto the new laptop (e.g., placing it in a new `D:\Fintrack` or `C:\Fintrack` folder).
   *(Note: The folder contains `node_modules` which makes it quite large. If you want a smaller transfer size, you can delete the `node_modules` folder inside `D:\Fintrack` before copying. You'll just need to run `npm install` on the new laptop to redownload them).*

### Step 2: Install Prerequisites on the New Laptop
The new laptop MUST have the following software installed:
1. **Node.js** (Version 18 or higher) - *Required for the frontend.*
2. **Java Development Kit (JDK) 25** - *Required for the backend.*
3. **MongoDB** - *The database. You need to install MongoDB Community Server and ensure it is running locally on port 27017.*

### Step 3: Start the Backend (Java Server)
1. Open a terminal or PowerShell inside the **`backend`** folder (e.g., `D:\Fintrack\backend`).
2. Make sure your Java path is correct. If you installed JDK 25 in the default directory, you can set it by running:
   ```powershell
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-25.0.2"
   ```
   *(Update the path above if Java was installed somewhere else on the new laptop).*
3. Start the backend by running the Maven Wrapper:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
   *If you are on a Mac/Linux, the command is `./mvnw spring-boot:run`.*
   The backend should now start up on `localhost:8080`.

### Step 4: Start the Frontend (React Website)
1. Open a **new** terminal or PowerShell inside the main **`Fintrack`** directory (e.g., `D:\Fintrack`).
2. If you deleted the `node_modules` folder before transferring, you must run this command to download the packages:
   ```powershell
   npm install
   ```
3. Start the frontend development server:
   ```powershell
   npx vite --port 5173
   ```
   *(Or you can run `npm run dev`)*
4. Open your web browser and navigate to **`http://localhost:5173`**.

You can now use FinTrack perfectly on the new laptop!
