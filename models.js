const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const movieSchema = mongoose.Schema({
  Title: {type: String, requrired: true},
  Description: {type: String, requried: true},
  Genre: {
      Name: String,
      Description: String
  },
  Director: {
      Name: String,
      Bio: String
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

const userSchema = mongoose.Schema({
  Username: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

//method to hash password
userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};
// method to validate password
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password);
};

const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;