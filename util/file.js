const fs = require('fs')
const path = require('path')
const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) throw err;
        console.log('File deleted!');
    })
}

exports.deleteFile = deleteFile