
const multer = require('multer');
const fileUploadService = require('../../services/file-upload/file-upload.service');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/img');
    },
     filename: function (req, file, cb) {
       cb(null, file.originalname); 
    }
   // filename: function (req, file, cb) {
   //     cb(null, file.fieldname + '-' + Date.now() + '.png'); // Puedes ajustar la extensión o el nombre del archivo si es necesario
   // }
});

const upload = multer({ storage });

const uploadFiles = (express) => {
    const router = express.Router();
    router
    .post('/',  upload.single('image'), async (req,res) =>{
        const fileName = req.file;
        console.log(fileName);
        //Aqui ya meterlo en basse de datos con toda la consulta??
        res.status(200).json(fileUploadService.uploadImage(fileName));
    })

    .delete('/delete/:filename', fileUploadService.deleteImage);
    return router;
};

module.exports = uploadFiles;

