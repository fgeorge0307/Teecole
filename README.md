# Teecole Limited - Modern Website

A modern, mobile-friendly property services website built with React, Node.js, and SQLite. Features Material 3 expressive design with Apple's glassmorphic aesthetics.

## 🌟 Features

- **Modern UI/UX**: Material 3 design with glassmorphic effects
- **Fully Responsive**: Mobile-first design approach
- **Smooth Animations**: Framer Motion for fluid interactions
- **Professional Typography**: Josefin Sans font family
- **Backend API**: RESTful API with Node.js and Express
- **Database**: SQLite for efficient data management
- **Contact Form**: Functional contact submission system
- **Services Management**: Dynamic service showcase
- **Admin Dashboard**: Secure login and gallery management
- **Project Gallery**: Public gallery with category filtering
- **Image Upload**: Admin can upload and manage project images
- **Featured Projects**: Showcase featured work on homepage

## 🛠️ Tech Stack

### Frontend
- React 18.2
- Material-UI (MUI) 5.14
- Framer Motion 10.16
- React Router 6.20
- Axios
- Josefin Sans Font

### Backend
- Node.js
- Express 4.18
- SQLite3 5.1
- CORS
- Body Parser
- Dotenv

## 📁 Project Structure

```
teecole/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Hero.js
│   │   │   ├── Services.js
│   │   │   ├── About.js
│   │   │   ├── Contact.js
│   │   │   └── Footer.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── theme.js
│   │   └── index.css
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── controllers/
    │   │   └── apiController.js
    │   ├── database/
    │   │   └── db.js
    │   ├── routes/
    │   │   └── api.js
    │   └── server.js
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

### Running the Application

#### Start Backend Server
```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```
The backend server will run on `http://localhost:5000`

#### Start Frontend Development Server
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

### Building for Production

#### Build Frontend
```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build` folder.

## 📡 API Endpoints

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact-submissions` - Get all submissions (admin)

### Admin Authentication
- `POST /api/admin/login` - Admin login (returns JWT token)
- `GET /api/admin/verify` - Verify JWT token

### Gallery
- `GET /api/gallery` - Get all gallery items (public)
- `POST /api/admin/gallery` - Add gallery item (admin only)
- `PUT /api/admin/gallery/:id` - Update gallery item (admin only)
- `DELETE /api/admin/gallery/:id` - Delete gallery item (admin only)

### Health
- `GET /health` - Health check endpoint

### Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **Note**: Change these credentials in production!

## 🎨 Design Features

### Material 3 Expressive Design
- Modern color palette with primary (#6750A4) and complementary colors
- Expressive rounded corners (16px border radius)
- Elevated surfaces with sophisticated shadows
- Dynamic button states with hover effects

### Glassmorphic Design
- Frosted glass effects with backdrop-filter
- Semi-transparent backgrounds
- Smooth blur and saturation
- Apple-inspired aesthetics

### Typography
- Josefin Sans font family throughout
- Responsive font sizes
- Optimized line heights and spacing
- Clear hierarchy

### Animations
- Smooth page transitions
- Scroll-based animations
- Interactive hover effects
- Fluid motion design

## 📱 Mobile Responsiveness

The website is fully responsive with breakpoints for:
- Mobile: < 600px
- Tablet: 600px - 960px
- Desktop: > 960px

All components adapt seamlessly across devices.

## 🔧 Configuration

### Environment Variables

**Backend** (`.env`):
```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`.env`):
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📄 Database Schema

### Services Table
```sql
- id: INTEGER PRIMARY KEY
- title: TEXT
- description: TEXT
- icon: TEXT
- color: TEXT
- features: TEXT (JSON)
- image_url: TEXT
- created_at: DATETIME
```

### Contact Submissions Table
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT
- email: TEXT
- phone: TEXT
- subject: TEXT
- message: TEXT
- status: TEXT
- created_at: DATETIME
```

## 🎯 Services Offered

1. **Property Redesign and Refurbishment**
   - Design & Build Service
   - Residential & Commercial
   - Project Management
   - Quality Finish

2. **Property Sales and Management**
   - Investment Properties
   - Best Market Rates
   - Mortgage Options
   - Management Packages

3. **Cleaning Services**
   - Commercial Cleaning
   - Industrial Spaces
   - Medical Facilities
   - 100% Satisfaction

4. **AirBnB Hosting & Management** ✨ NEW
   - Full Property Management
   - Guest Communication
   - Professional Photography
   - 24/7 Support

## 📞 Contact Information

**Teecole Limited**
- Address: Office 9, Dalton House, 60 Windsor Avenue, London, SW19 2RR, United Kingdom
- Phone: +44 1293 859148
- Email: info@teecoleltd.com

## 🤝 Contributing

This is a proprietary project for Teecole Limited. For any modifications or improvements, please contact the development team.

## 📝 License

Copyright © 2025 Teecole Limited. All rights reserved.

## 👨‍💻 Development

Built with 20+ years of software development expertise, incorporating:
- Modern React best practices
- RESTful API design
- Secure data handling
- Performance optimization
- Accessibility standards
- SEO-friendly structure

---

**Teecole Limited** - Building Excellence Since 2022
