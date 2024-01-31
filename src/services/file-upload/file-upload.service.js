const fs = require('fs');
const path = require('path');
/*
const uploadImage = (req, res) => {
    // Lógica para subir la imagen (ya manejada por Multer)
    res.status(200).json({ message: 'Imagen subida correctamente', filename: res.filename });
    res.send('Imagen subida correctamente');
};
*/
const uploadImage = (fileName) => {
    // Lógica para subir la imagen (ya manejada por Multer)
    return ({ message: 'Imagen subida correctamente Man', filename: fileName });
};

const deleteImage = (req, res) => {
    const filePath = path.join(__dirname, '..', 'images/img', req.params.filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            res.status(500).send('Error al borrar la imagen');
        } else {
            res.send('Imagen eliminada correctamente');
        }
    });
};

module.exports = {
    uploadImage,
    deleteImage
};
