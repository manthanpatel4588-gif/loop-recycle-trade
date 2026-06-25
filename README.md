# ♻️ Loop Recycle Trade

Loop Recycle Trade is a waste management and recycling marketplace that connects Industries, Collectors, Recyclers, and Retailers.

The platform enables industries to list waste materials, collectors to collect them, recyclers to process them, and retailers to purchase recycled products, creating a complete circular economy ecosystem.

---

## 🚀 Features

- User Authentication
- Role-Based Access
  - Industry
  - Collector
  - Recycler
  - Retailer
  - Admin
- Waste Listing Management
- Pickup Requests
- Order Tracking
- Payment Tracking
- Verification System
- Dashboard Analytics
- Supabase Authentication
- PostgreSQL Database

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- TanStack Start
- Tailwind CSS
- Radix UI

### Backend Services
- Supabase

### Database
- PostgreSQL (Supabase)

---

# 📦 Installation

## 1. Clone Repository

```bash
git clone https://github.com/Moksha-modi/loop-recycle-trade.git
cd loop-recycle-trade

2. Install Dependencies
npm install
3. Configure Environment Variables

Create a .env file in the project root.

SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_KEY
SUPABASE_URL=YOUR_SUPABASE_URL

VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_KEY
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
🗄 Database Setup

This project uses Supabase PostgreSQL Database.

Option 1: Use Existing Database

If the database already exists:

Login to Supabase
Open your project
Copy:
Project URL
Publishable Key
Paste them into .env
Option 2: Create New Database
Step 1

Go to:

https://supabase.com

Step 2

Create a new project.

Step 3

Wait until database provisioning completes.

Step 4

Open:

Settings → API

Copy:

Project URL
Publishable Key

Paste into .env

Step 5: Run Database Migrations

Install Supabase CLI:

npm install -g supabase

Login:

supabase login

Link Project:

supabase link --project-ref YOUR_PROJECT_ID

Run migrations:

supabase db push

This creates:

Profiles
Waste Listings
Pickup Requests
Orders
Payments
Role Management

tables automatically.

▶ Running Project

Start Development Server:

npm run dev

Application will run on:

http://localhost:3000

or

http://localhost:5173

depending on Vite configuration.

🏗 Build Production Version
npm run build

Preview Production Build:

npm run preview
📂 Project Structure
loop-recycle-trade
│
├── src
│   ├── components
│   ├── routes
│   ├── integrations
│   │   └── supabase
│   ├── lib
│   └── hooks
│
├── supabase
│   ├── migrations
│   └── config.toml
│
├── package.json
├── vite.config.ts
└── .env
👥 User Roles
Industry
Create waste listings
Manage waste inventory
Collector
Accept pickup requests
Track collections
Recycler
Process collected waste
Create recycled products
Retailer
Purchase recycled products
Manage orders
Admin
Verify users
Manage platform activities
🔐 Authentication

Authentication is powered by Supabase Auth.

Supported methods:

Email Login
Email Signup
Session Management
Role-Based Access Control
🚀 Deployment

Build project:

npm run build

Deploy to:

Vercel
Netlify
AWS
Render
📝 License

MIT License

👨‍💻 Author

Moksha Modi

Loop Recycle Trade


---

## How to activate the database on your PC?

Since you're using **Supabase**, there are two ways:

### Method 1 (Recommended)

Use Supabase Cloud.

No database installation needed.

Just put the Supabase credentials in `.env` and run:

```bash
npm install
npm run dev
Method 2 (Local Database)

Install Docker and Supabase CLI.

npm install -g supabase

Start local Supabase:

supabase start

Apply migrations:

supabase db reset

Stop database:

supabase stop

This runs PostgreSQL locally on your PC through Docker.

For your hackathon/project demo, I recommend Method 1 (Supabase Cloud) because your project already contains a Supabase project ID and migrations
