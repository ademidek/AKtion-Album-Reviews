import mongoose from 'mongoose';
import "./config.mjs";

// Uncomment the following line to debug the value of the database connection string
// console.log('Database Connection String:', process.env.DSN);

mongoose.connect(process.env.DSN, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(error => {
  console.error('Database connection failed:', error);
});

// Add event listeners for the connection
mongoose.connection.on('error', err => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.once('open', () => {
  console.log('Mongoose connected to the DB.');
});

// Schema for reviews
const ReviewSchema = new mongoose.Schema({
  courseNumber: { type: String, required: true },
  courseName: { type: String, required: true },
  semester: String,
  year: { type: Number, min: 2000, max: new Date().getFullYear() },
  professor: String,
  review: { type: String, required: true }
});

// Create and export the model
const Review = mongoose.model('Review', ReviewSchema);
export default Review;
