const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Data file paths
const SEATS_FILE = path.join(__dirname, 'data', 'seats.json');
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');
const LOCKS_FILE = path.join(__dirname, 'data', 'locks.json');

// In-memory storage for Vercel (serverless environment)
const isServerless = process.env.VERCEL === '1';
let memoryStorage = {
  seats: null,
  bookings: [],
  locks: []
};

// Initialize data files if they don't exist
const initializeData = () => {
  if (isServerless) {
    // Use in-memory storage for serverless
    if (!memoryStorage.seats) {
      memoryStorage.seats = generateInitialSeats();
    }
    return;
  }

  // Use file storage for local development
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  // Initialize seats data
  if (!fs.existsSync(SEATS_FILE)) {
    const initialSeats = generateInitialSeats();
    fs.writeFileSync(SEATS_FILE, JSON.stringify(initialSeats, null, 2));
  }

  // Initialize bookings data
  if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
  }

  // Initialize locks data
  if (!fs.existsSync(LOCKS_FILE)) {
    fs.writeFileSync(LOCKS_FILE, JSON.stringify([], null, 2));
  }
};

// Generate initial seat layout - Hong Kong Coliseum CENTER STAGE style
const generateInitialSeats = () => {
  const shows = ['2026-04-25', '2026-04-27', '2026-04-29'];
  const seats = {};

  shows.forEach(show => {
    seats[show] = [];
    
    // Hong Kong Coliseum Concert Layout - CENTER STAGE with 360° seating
    // 8 sections surrounding the stage (like compass directions)
    // Category C (Premium): Rows A-C (closest to center stage)
    // Category B: Rows D-G (middle distance)
    // Category A: Rows H-J (farthest from stage)
    
    // Section positions around the stage (clockwise from top)
    const sectionConfigs = [
      { section: 'S1', name: 'North', seatsPerRow: 14 },        // Top center
      { section: 'S2', name: 'Northeast', seatsPerRow: 12 },    // Top right
      { section: 'S3', name: 'East', seatsPerRow: 14 },         // Right center
      { section: 'S4', name: 'Southeast', seatsPerRow: 12 },    // Bottom right
      { section: 'S5', name: 'South', seatsPerRow: 14 },        // Bottom center
      { section: 'S6', name: 'Southwest', seatsPerRow: 12 },    // Bottom left
      { section: 'S7', name: 'West', seatsPerRow: 14 },         // Left center
      { section: 'S8', name: 'Northwest', seatsPerRow: 12 },    // Top left
    ];

    sectionConfigs.forEach(secConfig => {
      // Category C - Premium (Rows A-C, closest to stage)
      ['A', 'B', 'C'].forEach(row => {
        for (let seatNum = 1; seatNum <= secConfig.seatsPerRow; seatNum++) {
          const seatId = `${secConfig.section}-${row}${seatNum}`;
          seats[show].push({
            id: seatId,
            section: secConfig.section,
            sectionName: secConfig.name,
            row: row,
            number: seatNum,
            category: 'C',
            status: 'available'
          });
        }
      });

      // Category B - Middle (Rows D-G, middle distance)
      ['D', 'E', 'F', 'G'].forEach(row => {
        for (let seatNum = 1; seatNum <= secConfig.seatsPerRow; seatNum++) {
          const seatId = `${secConfig.section}-${row}${seatNum}`;
          seats[show].push({
            id: seatId,
            section: secConfig.section,
            sectionName: secConfig.name,
            row: row,
            number: seatNum,
            category: 'B',
            status: 'available'
          });
        }
      });

      // Category A - Upper (Rows H-J, farthest from stage)
      ['H', 'I', 'J'].forEach(row => {
        for (let seatNum = 1; seatNum <= secConfig.seatsPerRow; seatNum++) {
          const seatId = `${secConfig.section}-${row}${seatNum}`;
          seats[show].push({
            id: seatId,
  if (isServerless) {
    if (filePath === SEATS_FILE) return memoryStorage.seats;
    if (filePath === BOOKINGS_FILE) return memoryStorage.bookings;
    if (filePath === LOCKS_FILE) return memoryStorage.locks;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const writeJSON = (filePath, data) => {
  if (isServerless) {
    if (filePath === SEATS_FILE) memoryStorage.seats = data;
    if (filePath === BOOKINGS_FILE) memoryStorage.bookings = data;
    if (filePath === LOCKS_FILE) memoryStorage.locks = data;
    return;
  }
            category: 'A',
            status: 'available'
          });
        }
      });
    });
  });

  return seats;
};

// Helper functions
const readJSON = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const writeJSON = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Clean expired locks (older than 10 minutes)
const cleanExpiredLocks = () => {
  const locks = readJSON(LOCKS_FILE);
  const now = Date.now();
  const validLocks = locks.filter(lock => {
    return (now - lock.timestamp) < 600000; // 10 minutes in milliseconds
  });
  
  if (validLocks.length !== locks.length) {
    writeJSON(LOCKS_FILE, validLocks);
    return locks.filter(lock => !validLocks.includes(lock));
  }
  return [];
};

// API Routes

// Get all shows
app.get('/api/shows', (req, res) => {
  const shows = [
    { id: '2026-04-25', date: 'April 25, 2026', time: '19:30' },
    { id: '2026-04-27', date: 'April 27, 2026', time: '19:30' },
    { id: '2026-04-29', date: 'April 29, 2026', time: '19:30' }
  ];
  res.json(shows);
});

// Get ticket categories
app.get('/api/categories', (req, res) => {
  const categories = [
    { id: 'A', name: 'Category A', price: 980 },
    { id: 'B', name: 'Category B', price: 1480 },
    { id: 'C', name: 'Category C', price: 2480 }
  ];
  res.json(categories);
});

// Check availability
app.post('/api/check-availability', (req, res) => {
  cleanExpiredLocks();
  
  const { showId, category, quantity } = req.body;
  const seats = readJSON(SEATS_FILE);
  const locks = readJSON(LOCKS_FILE);

  if (!seats[showId]) {
    return res.status(400).json({ error: 'Invalid show date' });
  }

  // Get locked seat IDs
  const lockedSeatIds = locks
    .filter(lock => lock.showId === showId)
    .flatMap(lock => lock.seatIds);

  // Get available seats for the category
  const availableSeats = seats[showId].filter(seat => 
    seat.category === category && 
    seat.status === 'available' &&
    !lockedSeatIds.includes(seat.id)
  );

  const isAvailable = availableSeats.length >= quantity;

  res.json({
    available: isAvailable,
    availableCount: availableSeats.length,
    requestedCount: quantity
  });
});

// Get seating plan
app.get('/api/seating-plan/:showId/:category', (req, res) => {
  cleanExpiredLocks();
  
  const { showId, category } = req.params;
  const seats = readJSON(SEATS_FILE);
  const locks = readJSON(LOCKS_FILE);

  if (!seats[showId]) {
    return res.status(400).json({ error: 'Invalid show date' });
  }

  // Get locked seat IDs
  const lockedSeatIds = locks
    .filter(lock => lock.showId === showId)
    .flatMap(lock => lock.seatIds);

  // Filter seats by category and add lock status
  const categorySeats = seats[showId]
    .filter(seat => seat.category === category)
    .map(seat => ({
      ...seat,
      isLocked: lockedSeatIds.includes(seat.id)
    }));

  res.json(categorySeats);
});

// Lock seats (when user selects them)
app.post('/api/lock-seats', (req, res) => {
  cleanExpiredLocks();
  
  const { showId, seatIds } = req.body;
  const seats = readJSON(SEATS_FILE);
  const locks = readJSON(LOCKS_FILE);

  if (!seats[showId]) {
    return res.status(400).json({ error: 'Invalid show date' });
  }

  // Check if seats are available
  const lockedSeatIds = locks
    .filter(lock => lock.showId === showId)
    .flatMap(lock => lock.seatIds);

  const unavailableSeats = seatIds.filter(seatId => {
    const seat = seats[showId].find(s => s.id === seatId);
    return !seat || seat.status !== 'available' || lockedSeatIds.includes(seatId);
  });

  if (unavailableSeats.length > 0) {
    return res.status(400).json({ 
      error: 'Some seats are no longer available',
      unavailableSeats 
    });
  }

  // Create lock
  const lockId = uuidv4();
  const newLock = {
    lockId,
    showId,
    seatIds,
    timestamp: Date.now()
  };

  locks.push(newLock);
  writeJSON(LOCKS_FILE, locks);

  res.json({ 
    success: true, 
    lockId,
    expiresAt: newLock.timestamp + 600000 // 10 minutes
  });
});

// Release seats (when timer expires or user cancels)
app.post('/api/release-seats', (req, res) => {
  const { lockId } = req.body;
  let locks = readJSON(LOCKS_FILE);

  locks = locks.filter(lock => lock.lockId !== lockId);
  writeJSON(LOCKS_FILE, locks);

  res.json({ success: true });
});

// Process payment and complete booking
app.post('/api/complete-booking', (req, res) => {
  const {
    lockId,
    showId,
    seatIds,
    ticketHolders,
    contactEmail,
    paymentDetails
  } = req.body;

  // Verify lock exists and is valid
  cleanExpiredLocks();
  const locks = readJSON(LOCKS_FILE);
  const lock = locks.find(l => l.lockId === lockId);

  if (!lock) {
    return res.status(400).json({ error: 'Booking session expired' });
  }

  // Update seat status to booked
  const seats = readJSON(SEATS_FILE);
  seatIds.forEach(seatId => {
    const seat = seats[showId].find(s => s.id === seatId);
    if (seat) {
      seat.status = 'booked';
    }
  });
  writeJSON(SEATS_FILE, seats);

  // Create booking record
  const bookings = readJSON(BOOKINGS_FILE);
  const bookingId = uuidv4();
  const newBooking = {
    bookingId,
    showId,
    seatIds,
    ticketHolders,
    contactEmail,
    paymentDetails: {
      ...paymentDetails,
      cardNumber: `****${paymentDetails.cardNumber.slice(-4)}` // Mask card number
    },
    bookingDate: new Date().toISOString(),
    status: 'confirmed'
  };

  bookings.push(newBooking);
  writeJSON(BOOKINGS_FILE, bookings);

  // Release lock
  const updatedLocks = locks.filter(l => l.lockId !== lockId);
  writeJSON(LOCKS_FILE, updatedLocks);

  res.json({
    success: true,
    bookingId,
    booking: newBooking
  });
});

// Verify lock status
app.get('/api/verify-lock/:lockId', (req, res) => {
  cleanExpiredLocks();
  const locks = readJSON(LOCKS_FILE);
  const lock = locks.find(l => l.lockId === req.params.lockId);

  if (!lock) {
    return res.json({ valid: false });
  }

  const timeRemaining = 600000 - (Date.now() - lock.timestamp);
  res.json({
    valid: true,
    timeRemaining: Math.max(0, timeRemaining)
  });
});

// Initialize data and start server
initializeData();

// Only start server if not in serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Lady X Booking API running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
