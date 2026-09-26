# 🍽️ Smart Food Pickup System

### Campus Canteen Ordering & Digital Token Management Platform

A modern full-stack web application designed to reduce queues in college canteens by allowing students to browse food, place orders online, receive a digital pickup token, and track preparation status in real time.

The system also provides a dedicated canteen administration interface for managing menu items, incoming orders, serving tokens, announcements, and operational statistics.

> **🎓 Academic Project:** Web Technology / Full-Stack Web Application  


## ✨ Project Highlights

- 🛒 Online food ordering for students
- 🎟️ Automatic digital pickup token generation
- 📋 Live order status tracking
- 🔔 Now-serving token display
- ⏱️ Estimated preparation time
- 👨‍🍳 Canteen order queue management
- 🍔 Menu management with availability controls
- 📊 Admin dashboard with order and revenue statistics
- 🔐 Student/Admin role-based application flow
- 📱 Responsive interface for desktop, tablet, and mobile
- 🎨 Modern UI with animations and reusable components
- ☁️ Vercel-ready serverless API architecture
- 🗄️ Supabase PostgreSQL database integration

---

## 🎯 Problem Statement

Traditional college canteens often depend on physical queues for ordering and collecting food. During peak hours this can lead to:

- Long waiting times
- Crowded counters
- Manual order handling
- Difficulty tracking order status
- Confusion around ready orders
- Limited visibility for canteen staff
- Time-consuming manual reporting

The **Smart Food Pickup System** addresses these issues by moving the ordering and tracking process to a digital platform.

---

## 💡 Proposed Solution

The application provides a centralized digital workflow:

```text
Student
   │
   ▼
Browse Menu
   │
   ▼
Add Food to Cart
   │
   ▼
Checkout
   │
   ▼
Digital Token Generated
   │
   ▼
Order → Preparing → Ready
   │
   ▼
Now Serving Board
   │
   ▼
Food Collected
```

At the same time, canteen staff can monitor and update the order queue from the admin dashboard.

---

## 👨‍🎓 Student Features

### 1. Digital Menu
Students can browse available food items with:

- Food name
- Description
- Price
- Category
- Rating
- Vegetarian indicator
- Preparation time
- Availability status

### 2. Search & Filtering

Students can quickly find food using:

- Search
- Category filters
- Vegetarian-only filter
- Price sorting
- Availability information

### 3. Smart Cart

The cart supports:

- Quantity adjustment
- Item removal
- Total calculation
- LocalStorage persistence
- Checkout navigation

### 4. Digital Pickup Token

After checkout, the system generates a token such as:

```text
C101
C102
C103
```

The token can be used by the student at the canteen pickup counter.

### 5. Live Order Tracking

Orders move through the following workflow:

```text
Ordered
   ↓
Preparing
   ↓
Ready for Pickup
   ↓
Collected
```

### 6. Order History

Students can view active and previous orders and open an individual order to view its digital token and status.

### 7. Now Serving

A dedicated serving board displays ready orders and the currently served token.

---

## 👨‍🍳 Admin Features

### Admin Dashboard

The dashboard provides operational information such as:

- Total orders
- Pending orders
- Completed orders
- Cancelled orders
- Revenue
- Today's orders
- Today's revenue
- Average order value
- Daily order statistics
- Top-selling items

### Order Management

Staff can monitor the live queue and update order status:

```text
Ordered → Preparing → Ready → Collected
```

### Menu Management

Administrators can:

- Add menu items
- Edit menu items
- Delete menu items
- Change availability
- Set price
- Set preparation time
- Update category
- Update images
- Configure vegetarian status

### Serving Counter

The admin can:

- Change the current serving token
- Open/close the canteen
- Publish announcements
- Monitor ready/preparing orders

---

## 🏗️ System Architecture

```text
┌───────────────────────────────┐
│          Student UI           │
│       React + TypeScript      │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│       React Application       │
│ Routing • Context • UI State  │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│      Vercel Serverless API    │
│ /api/menu                     │
│ /api/orders                   │
│ /api/stats                    │
│ /api/serving                  │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│        Supabase Auth          │
│      + PostgreSQL Database    │
└───────────────────────────────┘
```

---

## 🧩 Main Modules

| Module | Purpose |
|---|---|
| Authentication | Student/admin login and session handling |
| Menu | Food catalogue and availability |
| Cart | Item selection and quantity management |
| Checkout | Order creation and payment method selection |
| Order Tracking | Real-time order progress |
| Serving Board | Ready-order and token display |
| Admin Dashboard | Statistics and operational overview |
| Order Management | Kitchen queue and status updates |
| Menu Management | CRUD operations for menu items |
| Counter Management | Serving token and canteen status |

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Routing | React Router |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| Backend | Vercel Serverless Functions |
| Deployment | Vercel |
| Version Control | Git & GitHub |

---

## 📁 Project Structure

```text
smart-food-pickup-system/
│
├── api/
│   ├── db-client.js
│   ├── db-wake.js
│   ├── menu.js
│   ├── orders.js
│   ├── serving.js
│   └── stats.js
│
├── public/
│   ├── favicon.svg
│   └── vite.svg
│
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── CartDrawer.tsx
│   │   ├── FoodCard.tsx
│   │   ├── Loaders.tsx
│   │   ├── Navbar.tsx
│   │   ├── OrderTimeline.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ServingBoard.tsx
│   │   ├── StatusBadge.tsx
│   │   └── TokenTicket.tsx
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── googleAuth.ts
│   │   ├── supabase.ts
│   │   └── types.ts
│   │
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── AuthPages.tsx
│   │   ├── StudentHomePage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── MyOrdersPage.tsx
│   │   ├── TrackOrderPage.tsx
│   │   ├── ServingPage.tsx
│   │   ├── AdminDashboardPage.tsx
│   │   ├── AdminOrdersPage.tsx
│   │   ├── AdminMenuPage.tsx
│   │   └── AdminCounterPage.tsx
│   │
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## ⚙️ Installation

### Prerequisites

Install:

- Node.js 18+
- npm
- Git
- Supabase account
- Vercel account (for deployment)

### Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/smart-food-pickup-system.git
cd smart-food-pickup-system
```

### Install dependencies

```bash
npm install
```

---

## 🔐 Environment Configuration

Create a `.env` file in the project root.

Use `.env.example` as the template:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key

VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_AUTH_PROXY=

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Security

**Never commit:**

```text
.env
SUPABASE_SERVICE_ROLE_KEY
private API keys
OAuth client secrets
database passwords
```

The GitHub-ready version intentionally does **not** include the original deployment secrets.

---

## 🗄️ Database

The application expects the following Supabase tables.

### `menu_items`

```text
id
name
description
price
category
image
available
prep_time
rating
is_veg
created_at
```

### `orders`

```text
id
token
student_id
student_name
student_email
items
total
status
payment_method
estimated_minutes
created_at
updated_at
```

### `canteen_settings`

```text
id
serving_token
is_open
announcement
updated_at
```

For a production deployment, configure appropriate Supabase Row Level Security policies and server-side authorization.

---

## ▶️ Run Locally

```bash
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

## 🏗️ Production Build

Test the production build locally:

```bash
npm run build
npm run preview
```

Run linting:

```bash
npm run lint
```

---

## ☁️ Deploy to Vercel

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Select **Vite** / automatically detected settings.
4. Add the required environment variables in Vercel.
5. Deploy.
6. Verify the `/api/*` serverless endpoints.
7. Configure Supabase authentication redirect URLs for the deployed domain.

The existing `api/` directory is designed for Vercel serverless functions.

---

## 🔄 Order Lifecycle

```text
                 ┌──────────────┐
                 │    Ordered   │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │  Preparing   │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │    Ready     │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │  Collected   │
                 └──────────────┘

Ordered → Cancelled
Preparing → Cancelled
```

---

## 🔌 API Endpoints

### Menu

```text
GET    /api/menu
POST   /api/menu
PUT    /api/menu
DELETE /api/menu
```

### Orders

```text
GET    /api/orders
POST   /api/orders
PUT    /api/orders
DELETE /api/orders
```

### Serving

```text
GET /api/serving
PUT /api/serving
```

### Statistics

```text
GET /api/stats
```

---

## 🎓 Academic Use

This project is suitable for demonstrating:

- Web Technology
- Full-Stack Development
- React Application Architecture
- REST API Integration
- Authentication
- Database Management
- CRUD Operations
- Responsive UI Design
- Cloud Deployment
- Serverless Computing
- Real-world problem solving

---

## 🚀 Future Enhancements

Potential improvements include:

- Online payment gateway integration
- QR-code based pickup
- Push notifications
- Email/SMS order notifications
- Multiple canteen support
- Advanced role and permission management
- Inventory management
- Food stock alerts
- Customer feedback and reviews
- Sales forecasting
- Analytics dashboard
- PWA/mobile application
- Stronger API authentication and authorization

---

## 📌 Project Information

**Project Title:** Smart Food Pickup System  
**Domain:** Web Technology / Full-Stack Development  
**Application Type:** College Canteen Ordering Platform  
**Frontend:** React + TypeScript + Vite  
**Backend:** Vercel Serverless Functions  
**Database:** Supabase PostgreSQL  

## 📄 License

This project is created for academic and educational purposes.

You are free to modify and extend the project for learning and demonstration.
