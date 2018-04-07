const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images'); //null is error
    },

    filename: (req, file, cb) => {
      cb(null, file.originalname); //originalname gives us the the original name of the file which have been uploaded form the client side
    }                            //by default it will be random string
}); //Enables us to define the storage engine

const imageFileFilter = (req, file, cb) =>{
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('You can upload only image files!'), false);
  }
  cb(null, true);
};

const upload = multer({storage: storage, fileFilter: imageFileFilter});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json()); // to make use of the body message in the res and req

uploadRouter.route('/')
.get(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
  res.statusCode = 403;
  res.end('GET operation not supported on /imageUpload');
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json(req.file);
  console.log('cicki');
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
  res.statusCode = 403;
  res.end('PUT operation not supported on /dishes');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
  res.statusCode = 403;
  res.end('DELETE operation not supported on /dishes');
});

module.exports = uploadRouter;
