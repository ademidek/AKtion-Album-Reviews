import './config.mjs';
import express from 'express';
import { engine } from 'express-handlebars';
import session from 'express-session';
import url from 'url';
import path from 'path';
import Review from './db.mjs';

const app = express();
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'some_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Track page views in the session
app.use((req, res, next) => {
  if (!req.session.views) {
    req.session.views = 0;
  }
  req.session.views += 1;
  res.locals.pageVisits = req.session.views;
  next();
});

// Configure Handlebars templating
app.engine('hbs', engine({
  defaultLayout: 'layout',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.courseNumber) {
      query.courseNumber = { $regex: req.query.courseNumber, $options: 'i' };
    }
    if (req.query.courseName) {
      query.courseName = { $regex: req.query.courseName, $options: 'i' };
    }
    if (req.query.professor) {
      query.professor = { $regex: req.query.professor, $options: 'i' };
    }

    const reviews = await Review.find(query).lean();
    res.render('reviews', { title: "All Reviews", reviews, count: req.session.views });
  } catch (err) {
    console.error("Error retrieving reviews:", err);
    res.status(500).send("Server error occurred.");
  }
});

app.get('/reviews/add', (req, res) => {
  res.render('addReview', { title: "Add a Review" });
});

app.get('/reviews/mine', (req, res) => {
  const sessionReviews = req.session.myReviews || [];
  res.render('myReviews', { title: "My Reviews", reviews: sessionReviews });
});

app.post('/reviews/add', async (req, res) => {
  try {
    const newReview = new Review(req.body);
    await newReview.save();
    
    if (!req.session.myReviews) {
      req.session.myReviews = [];
    }

    req.session.myReviews.push(newReview);

    res.redirect('/reviews/mine');
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).send("Failed to add review.");
  }
});

app.listen(process.env.PORT ?? 3000, () => {
  console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
});
