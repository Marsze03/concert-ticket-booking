const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const SEATS_FILE = path.join(__dirname, 'data', 'seats.json');
const BOOKINGS_FILE = path.join(__dirname, 'data', 'bookings.json');
const LOCKS_FILE = path.join(__dirname, 'data', 'locks.json');

const isServerless = process.env.VERCEL === '1';
let memoryStorage = { seats: null, bookings: [], locks: [] };

const generateInitialSeats = () => {
  const shows = ['2026-04-25', '2026-04-27', '2026-04-29'];
  const seats = {};
  shows.forEach(show => {
    seats[show] = [];
    const sectionConfigs = [
      { section: 'S1', name: 'North',     seatsPerRow: 14 },
      { section: 'S2', name: 'Northeast', seatsPerRow: 12 },
      { section: 'S3', name: 'East',      seatsPerRow: 14 },
      { section: 'S4', name: 'Southeast', seatsPerRow: 12 },
      { section: 'S5', name: 'South',     seatsPerRow: 14 },
      { section: 'S6', name: 'Southwest', seatsPerRow: 12 },
      { section: 'S7', name: 'West',      seatsPerRow: 14 },
      { section: 'S8', name: 'Northwest', seatsPerRow: 12 },
    ];
    sectionConfigs.forEach(secConfig => {
      ['A','B','C'].forEach(row => {
        for (let n = 1; n <= secConfig.seatsPerRow; n++) {
          seats[show].push({ id: `${secConfig.section}-${row}${n}`, section: secConfig.section, sectionName: secConfig.name, row, number: n, category: 'C', status: 'available' });
        }
      });
      ['D','E','F','G'].forEach(row => {
        for (let n = 1; n <= secConfig.seatsPerRow; n++) {
          seats[show].push({ id: `${secConfig.section}-${row}${n}`, section: secConfig.section, sectionName: secConfig.name, row, number: n, category: 'B', status: 'available' });
        }
      });
      ['H','I','J'].forEach(row => {
        for (let n = 1; n <= secConfig.seatsPerRow; n++) {
          seats[show].push({ id: `${secConfig.section}-${row}${n}`, section: secConfig.section, sectionName: secConfig.name, row, number: n, category: 'A', status: 'available' });
        }
      });
    });
  });
  return seats;
};

const readJSON = (filePath) => {
  if (isServerless) {
    if (!memoryStorage.seats) memoryStorage.seats = generateInitialSeats();
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
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const initializeData = () => {
  if (isServerless) {
    if (!memoryStorage.seats) memoryStorage.seats = generateInitialSeats();
    return;
  }
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  if (!fs.existsSync(SEATS_FILE)) fs.writeFileSync(SEATS_FILE, JSON.stringify(generateInitialSeats(), null, 2));
  if (!fs.existsSync(BOOKINGS_FILE)) fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
  if (!fs.existsSync(LOCKS_FILE)) fs.writeFileSync(LOCKS_FILE, JSON.stringify([], null, 2));
};

const cleanExpiredLocks = () => {
  const locks = readJSON(LOCKS_FILE);
  const validLocks = locks.filter(lock => (Date.now() - lock.timestamp) < 600000);
  if (validLocks.length !== locks.length) writeJSON(LOCKS_FILE, validLocks);
};

app.get('/api/shows', (req, res) => {
  res.json([
    { id: '2026-04-25', date: 'April 25, 2026', time: '19:30' },
    { id: '2026-04-27', date: 'April 27, 2026', time: '19:30' },
    { id: '2026-04-29', date: 'April 29, 2026', time: '19:30' }
  ]);
});

app.get('/api/categories', (req, res) => {
  res.json([
    { id: 'A', name: 'Category A', price: 980 },
    { id: 'B', name: 'Category B', price: 1480 },
    { id: 'C', name: 'Category C', price: 2480 }
  ]);
});

app.post('/api/check-availability', (req, res) => {
  cleanExpiredLocks();
  const { showId, category, quantity } = req.body;
  const seats = readJSON(SEATS_FILE);
  const locks = readJSON(LOCKS_FILE);
  if (!seats[showId]) return res.status(400).json({ error: 'Invalid show date' });
  const lockedSeatIds = locks.filter(l => l.showId === showId).flatMap(l => l.seatIds);
  const availableSeats = seats[showId].filter(s => s.category === category && s.status === 'available' && !lockedSeatIds.includes(s.id));
  res.json({ available: availableSeats.length >= quantity, availableCount: availableSeats.length, requestedCount: quantity });
});

app.get('/api/seating-plan/:showId/:category', (req, res) => {
  cleanExpiredLocks();
  const { showId, category } = req.params;
  const seats = readJSON(SEATS_FILE);
  const locks = readJSON(LOCKS_FILE);
  if (!seats[showId]) return res.status(400).json({ error: 'Invalid show date' });
  const lockedSeatIds = locks.filter(l => l.showId === showId).flatMap(l => l.seatIds);
  const categorySeats = seats[showId].filter(s => s.category === category).map(s => ({ ...s, isLocked: lockedSeatIds.includes(s.id) }));
  res.json(categorySeats);
});

app.post('/api/lock-seats', (req, res) => {
  cleanExpiredLocks();
  const { showId, seatIds } = req.body;
  const seats = readJSON(SEATS_FILE);
  const locks = readJSON(LOCKS_FILE);
  if (!seats[showId]) return res.status(400).json({ error: 'Invalid show date' });
  const lockedSeatIds = locks.filter(l => l.showId === showId).flatMap(l => l.seatIds);
  const unavailable = seatIds.filter(id => { const s = seats[showId].find(x => x.id === id); return !s || s.status !== 'available' || lockedSeatIds.includes(id); });
  if (unavailable.length > 0) return res.status(400).json({ error: 'Some seats are no longer available', unavailableSeats: unavailable });
  const lockId = uuidv4();
  locks.push({ lockId, showId, seatIds, timestamp: Date.now() });
  writeJSON(LOCKS_FILE, locks);
  res.json({ success: true, lockId, expiresAt: Date.now() + 600000 });
});

app.post('/api/release-seats', (req, res) => {
  const { lockId } = req.body;
  writeJSON(LOCKS_FILE, readJSON(LOCKS_FILE).filter(l => l.lockId !== lockId));
  res.json({ success: true });
});

app.post('/api/complete-booking', (req, res) => {
  const { lockId, showId, seatIds, ticketHolders, contactEmail, paymentDetails } = req.body;
  cleanExpiredLocks();
  const locks = readJSON(LOCKS_FILE);
  const lock = locks.find(l => l.lockId === lockId);
  if (!lock) return res.status(400).json({ error: 'Booking session expired' });
  const seats = readJSON(SEATS_FILE);
  seatIds.forEach(id => { const s = seats[showId].find(x => x.id === id); if (s) s.status = 'booked'; });
  writeJSON(SEATS_FILE, seats);
  const bookings = readJSON(BOOKINGS_FILE);
  const bookingId = uuidv4();
  const newBooking = { bookingId, showId, seatIds, ticketHolders, contactEmail, paymentDetails: { ...paymentDetails, cardNumber: `****${paymentDetails.cardNumber.slice(-4)}` }, bookingDate: new Date().toISOString(), status: 'confirmed' };
  bookings.push(newBooking);
  writeJSON(BOOKINGS_FILE, bookings);
  writeJSON(LOCKS_FILE, locks.filter(l => l.lockId !== lockId));
  res.json({ success: true, bookingId, booking: newBooking });
});

app.get('/api/verify-lock/:lockId', (req, res) => {
  cleanExpiredLocks();
  const lock = readJSON(LOCKS_FILE).find(l => l.lockId === req.params.lockId);
  if (!lock) return res.json({ valid: false });
  res.json({ valid: true, timeRemaining: Math.max(0, 600000 - (Date.now() - lock.timestamp)) });
});

initializeData();

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => console.log(`Lady X Booking API running on http://localhost:${PORT}`));
}

module.exports = app;
