const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
  user: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dishes: [
    {//tuka treba da pazam koga vnesuvam dish kje treba dish.pus({'_id' : req.params.dishId})
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish' //or Dish?? definitivno Dish
    }
  ]
},  {
  timestamps:true
});

var Favorites = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorites;
