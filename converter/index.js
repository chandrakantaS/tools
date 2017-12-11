// converts a file
/*
takes a file as input from console and encrypts it.
*/
const fs = require('fs');
const crypto = require('crypto');
const args = process.argv;
const dir = args[3];
const command = args[2]


const options = {};
// convert the console options to n object
args.filter(arg => {
   return /-/.test(arg)
}).forEach(opt => {
   options[opt.replace(/-/g, '')] = true;
})


function encrypt (data) { //function to encrypt a file
   const cipher = crypto.createCipher('aes-256-ctr', 'a secret key');
   if (Buffer.isBuffer(data)) { //handle separately if its buffer
      const crypted = Buffer.concat([cipher.update(data),cipher.final()]);
      return crypted;
   } else {
      // handle if not buffer
   }

}

function decrypt(data) {
   const decipher = crypto.createDecipher('aes-256-ctr', 'a secret key');
   if (Buffer.isBuffer(data)) {
      var dec = Buffer.concat([decipher.update(data) , decipher.final()]);
      return dec;
   } else {
         // handle if data is not buffer.
   }

}


function readAndWrite(i, o, enc) { // copy file from source and pastes after enc/dec
   let readStream = fs.createReadStream(i); //creates a read stream from input path
   let writeSream = fs.createWriteStream(o);// creates write steam for output path

   readStream.on('data', chunk => {
      if (enc) {
         // if its for encryptions, encrypt data before write
         writeSream.write(encrypt(chunk));
      } else {
         writeSream.write(decrypt(chunk));
      }

   });
   readStream.on('end', () => {
      console.log(i)
      if (!options.keep) // if user wants to keep old file dont delete, else do.
      fs.unlinkSync(i);
   })
}

if(!fs.existsSync(dir)) { // throw error if file not found
   throw new Error('Error: ENOENT');
}

if (command === 'encrypt') {
   if (fs.statSync(dir).isDirectory()) { //handle if the input os a directory
      const files = fs.readdirSync(dir);
      files.forEach(file => {
         readAndWrite(dir+file, dir+file+'.enc', true)
      })
   } else {
      readAndWrite(dir, dir+'.enc', true);
   }

} else {
   if(fs.statSync(dir).isDirectory()) {

      const files = fs.readdirSync(dir).filter(file => {
         return /.enc$/.test(file);
         //ignore files which are not encrypted. (not with .enc ext)
      });
      // console.log(files)
      files.forEach(file => {
         let outputFile = dir+file.slice(0, file.length-4)
         if (options.keep) {
            dir+'COPY_'+file.slice(0, file.length-4)
         }
         readAndWrite(dir+file, outputFile);

      })
   } else {
      let outputFile = dir.slice(0, dir.length-4);
      if (options.keep) {
         outputFile = 'COPY_' + dir.slice(0, dir.length-4)
      }
      readAndWrite(dir, outputFile);
   }

}
