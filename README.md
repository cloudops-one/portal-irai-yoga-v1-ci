# 🧘‍♂ Irai Yoga 📊💻

Welcome to the *Irai Yoga*, a powerful web-based application built using **Vite**, **React**, and **TypeScript**.
This portal allows administrators to efficiently manage and oversee the activities of the Irai Yoga Platform..

---

## 🚀 Features

- 🔥 Responsive Admin Dashboard
- 🌐 Zustand State Management
- 🔁 API Integration with Axios
- 🔥 Retry Mechanism for API Failures
- 📝 Efficient Logging with Winston
- ✅ Unit Tests with Jest
- 🔒 Type Safety with TypeScript

---

## 🔧 Installation & Setup

Follow the steps below to run the project locally on your machine:

### 1️⃣ Prerequisites

- Node.js v20.19.3
- npm v10.8.2
- nvm v0.40.3

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/irai-yoga/admin.git
cd admin
```

### 3️⃣ Install Dependencies

Inside your project directory, run:

```bash
npm install 
```

### 4️⃣ Create an .env File

Create a `.env` file at the *root of the project (outside the /src folder)* with the following content:

```ini
VITE_API_BASE_URL=https://server.preview.v1.irai.yoga/api/
```

You can also set the environment variable directly when running the development server:

**Ubuntu/Bash:**

```bash
export VITE_API_BASE_URL=https://server.preview.v1.irai.yoga/api/ && npm run dev
```

**PowerShell:**

```powershell
$env:VITE_API_BASE_URL="https://server.preview.v1.irai.yoga/api/"; npm run dev
```

**CMD:**

```cmd
set VITE_API_BASE_URL=https://server.preview.v1.irai.yoga/api/ && npm run dev
```

### 5️⃣ Start the Development Server

```bash
npm run dev
```

---

## 🛠 Available Scripts

### Development Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Linting

```bash
npm run lint --fix
```

### Unit Tests

```bash
npm run test
```
