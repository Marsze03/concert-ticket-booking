# Lady X Ticket Booking System

A professional full-stack ticket booking application for the "Lady X" concert at Hong Kong Coliseum featuring:
- Real-time seat availability checking
- Interactive Hong Kong Coliseum center-stage seating plan (360° layout)
- Anti-scalper real-name registration
- Payment processing with validation
- 10-minute booking timer
- Professional e-ticket with print functionality

## Tech Stack
- **Frontend**: React 18.2 + Vite 4.4
- **Backend**: Node.js + Express 4.18
- **Database**: JSON file-based storage
- **Styling**: Custom CSS with rock concert theme
- **Routing**: React Router DOM 6.16

## Features

### 🎟️ Booking Flow
1. **Performance Selection** - Choose show date and ticket category
2. **Interactive Seating Plan** - Select seats from Hong Kong Coliseum center-stage layout
3. **Real-Name Registration** - HKID/Passport validation for all ticket holders
4. **Secure Payment** - Credit card processing with Luhn algorithm validation
5. **E-Ticket Confirmation** - Printable confirmation with booking reference

### 🏟️ Hong Kong Coliseum Layout
- **8 sections** surrounding center stage (S1-S8: North, Northeast, East, Southeast, South, Southwest, West, Northwest)
- **3 categories** based on distance from stage:
  - **Category A**: $980 (Rows H-J, farthest from stage)
  - **Category B**: $1480 (Rows D-G, middle distance)
  - **Category C**: $2480 (Rows A-C, closest to stage - premium)

### 🔒 Anti-Scalper Features
- Real-name registration required for all tickets
- HKID/Passport number validation with check digit algorithm
- 10-minute seat lock timer
- One-to-one seat-to-holder mapping
- ID verification required at venue entrance

### 📅 Show Dates
- April 25, 2026
- April 27, 2026
- April 29, 2026

## Installation

```bash
# Install all dependencies (backend + frontend)
npm run install-all
```

## Running the Application

### Development Mode
```bash
# Run both frontend and backend concurrently
npm run dev
```

- Backend runs on: http://localhost:3000
- Frontend runs on: http://localhost:5173

### Production Build
```bash
# Build frontend for production
cd frontend
npm run build

# Run backend
cd ../backend
node server.js
```

## Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Git installed

### Step 1: Push to GitHub

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Lady X booking system"

# Add remote repository (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/lady-x-booking.git

# Push to GitHub
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your `lady-x-booking` repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Click "Deploy"

Your app will be live at: `https://your-project-name.vercel.app`

### Environment Variables (if needed)
Add these in Vercel dashboard under Settings → Environment Variables:
- `NODE_ENV=production`

## Testing Credentials

### Valid HKID Examples
- `A123456(3)`
- `B987654(0)`
- `SB134575(4)`
- `AB123456(9)`
- `CD987654(4)`

### Valid Credit Cards (Test)
**Visa:**
- `4532 0151 1283 0366`
- `4556 7375 8689 9855`

**Mastercard:**
- `5425 2334 3010 9903`
- `5555 5555 5555 4444`

**American Express:**
- `3782 822463 10005`
- `3714 496353 98431`

**Expiry:** Any future date (e.g., `12/28`)  
**CVV:** Any 3 digits (e.g., `123`)

### Passport Examples
- `K12345678` (Hong Kong SAR)
- `E87654321` (Hong Kong SAR)
- `P98765432` (Foreign)

**Nationalities:** United Kingdom, United States, Canada, Australia, Japan, Singapore, etc.

## Project Structure

```
lady-x-booking/
├── backend/
│   ├── data/
│   │   ├── seats.json          # Seat inventory (auto-generated)
│   │   ├── bookings.json       # Booking records
│   │   └── locks.json          # Temporary seat locks
│   └── server.js               # Express API server
├── frontend/
│   ├── src/
│   │   ├── pages/              # React page components
│   │   │   ├── PerformanceSelection.jsx
│   │   │   ├── BookingForm.jsx
│   │   │   ├── SeatingPlan.jsx
│   │   │   ├── TicketHolderDetails.jsx
│   │   │   ├── Payment.jsx
│   │   │   └── Confirmation.jsx
│   │   ├── services/           # API services
│   │   │   └── api.js
│   │   ├── utils/              # Validation utilities
│   │   │   └── validation.js
│   │   ├── App.jsx             # Main app component
│   │   └── index.css           # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .gitignore
├── vercel.json                 # Vercel deployment config
├── package.json                # Root package.json
└── README.md
```

## API Endpoints

### GET `/api/shows`
Get list of available shows with dates and availability

### GET `/api/seating-plan/:showId/:category`
Get available seats for specific show and category

### POST `/api/lock-seats`
Lock selected seats for 10 minutes
```json
{
  "showId": "2026-04-25",
  "seatIds": ["S1-A1", "S1-A2"]
}
```

### POST `/api/release-seats`
Release locked seats
```json
{
  "lockId": "uuid"
}
```

### POST `/api/complete-booking`
Complete booking and process payment
```json
{
  "lockId": "uuid",
  "showId": "2026-04-25",
  "seatIds": ["S1-A1", "S1-A2"],
  "ticketHolders": [...],
  "contactEmail": "user@example.com",
  "paymentDetails": {...}
}
```

## Validation Rules

### HKID Format
- Pattern: `A123456(3)` or `AB123456(9)`
- Check digit algorithm validated
- 1-2 letters + 6 digits + check digit in parentheses

### Credit Card
- Luhn algorithm validation
- 13-19 digits
- Supports Visa, Mastercard, Amex

### Expiry Date
- Format: `MM/YY`
- Must be future date

## License
MIT

## Support
For inquiries: support@ladyx.com (demo email)
