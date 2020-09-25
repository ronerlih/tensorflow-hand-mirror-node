const cv = require("opencv4nodejs");
const fs = require("fs");
const path = require("path");

fs.readdir(path.join(__dirname, "../data"), logFiles);

async function logFiles(err, files) {
   if (err) console.log(err);

   files
      .filter((filename) => filename.slice(-3) === "jpg")
      .forEach(async (filename) => {
         let mat;
         console.log(filename)
         try {
            mat = await cv.imreadAsync(path.join(__dirname, "../data", filename));
         } catch (e) {
            console.log(e);
            return e;
         }
         mat = mat.copyMakeBorder(50, 50, 50, 50, 0, new cv.Vec3(255,255,255));
         cv.imwriteAsync(path.join(__dirname, "../data/border", filename), mat, (err) => {
            if (err) console.log(err);
            console.log(filename);

            // cv.readImage( path.join(__dirname,"../data" , filename), function(err, mat){

            // if (err) return err;
            // add border
            // mat.copyMakeBorder(mat,mat,50,cv., (255,255,255))
            // mat.open()
            // mat.save('../data/border/' + filename);
         });
      });
}
// console.log(Object.keys(cv))
