const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

app.use(cors());
app.use(bodyParser.json());

// In-memory user store (replace with DB later)
const users = [];
const resetTokens = {};
// In-memory expert Q&A store
const questions = [];
let questionIdCounter = 1;

// Middleware to authenticate and attach user to req
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

// Middleware to require a specific role
function requireRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Insufficient role.' });
    }
  };
}

// Register endpoint (default role: user)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'Email already registered.' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, name, email, password: hashed, role: 'user' };
  users.push(user);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, role: user.role });
});

// Login endpoint (returns role)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, role: user.role });
});

// Request password reset
app.post('/api/auth/request-reset', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: 'No account found with that email.' });
  }
  // Generate a simple reset token (for demo only)
  const token = Math.random().toString(36).substring(2, 10);
  resetTokens[email] = token;
  // Simulate sending email
  console.log(`Password reset link for ${email}: http://localhost:4000/reset?email=${encodeURIComponent(email)}&token=${token}`);
  res.json({ message: 'Password reset link sent (check server console for demo).' });
});

// Reset password
app.post('/api/auth/reset', (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!resetTokens[email] || resetTokens[email] !== token) {
    return res.status(400).json({ message: 'Invalid or expired reset token.' });
  }
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: 'No account found with that email.' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }
  user.password = bcrypt.hashSync(newPassword, 10);
  delete resetTokens[email];
  res.json({ message: 'Password reset successful.' });
});

// Promote user to expert (admin only, for demo just by email)
app.post('/api/auth/promote', authenticate, (req, res) => {
  // For demo, allow any logged-in user to promote (in real app, require admin)
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  user.role = 'expert';
  res.json({ message: 'User promoted to expert.' });
});

// Submit a question (user)
app.post('/api/expert/questions', authenticate, (req, res) => {
  const { questionText } = req.body;
  if (!questionText) return res.status(400).json({ message: 'Question text required.' });
  const question = {
    questionId: questionIdCounter++,
    userId: req.user.id,
    questionText,
    timestamp: Date.now(),
    status: 'open',
    answerText: '',
    expertId: null
  };
  questions.push(question);
  res.json({ message: 'Question submitted.', question });
});

// Get all open questions (expert)
app.get('/api/expert/questions', authenticate, requireRole('expert'), (req, res) => {
  const openQuestions = questions.filter(q => q.status === 'open');
  res.json(openQuestions);
});

// Answer a question (expert)
app.post('/api/expert/answers', authenticate, requireRole('expert'), (req, res) => {
  const { questionId, answerText } = req.body;
  const question = questions.find(q => q.questionId === questionId);
  if (!question) return res.status(404).json({ message: 'Question not found.' });
  if (question.status !== 'open') return res.status(400).json({ message: 'Question already answered.' });
  question.answerText = answerText;
  question.status = 'answered';
  question.expertId = req.user.id;
  res.json({ message: 'Answer submitted.', question });
});

// Get answers for a user (user)
app.get('/api/expert/answers', authenticate, (req, res) => {
  const userQuestions = questions.filter(q => q.userId === req.user.id && q.status === 'answered');
  res.json(userQuestions);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
}); 