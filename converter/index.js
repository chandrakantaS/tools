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
args.filter(arg => {
   return /-/.test(arg)
}).forEach(opt => {
   options[opt.replace(/-/g, '')] = true;
})

console.log(options);

function encrypt (data) {
   const cipher = crypto.createCipher('aes-256-ctr', 'a secret key');
   if (Buffer.isBuffer(data)) {
      const crypted = Buffer.concat([cipher.update(data),cipher.final()]);
      return crypted;
   }
}

function decrypt(data) {
   const decipher = crypto.createDecipher('aes-256-ctr', 'a secret key');
   var dec = Buffer.concat([decipher.update(data) , decipher.final()]);
   return dec;
}


function readAndWrite(i, o, enc) {
   console.log(i, o)
   let readStream = fs.createReadStream(i);
   let writeSream = fs.createWriteStream(o);
   readStream.on('data', chunk => {
      if (enc) {
         writeSream.write(encrypt(chunk));

      }
      else {
         writeSream.write(decrypt(chunk));
      }

   });
   readStream.on('end', () => {
      console.log('ended');
      if (!options.keep)
      fs.unlinkSync(i);
   })
}

if(!fs.existsSync(dir)) {
   console.log('Error: ENOENT')
   return;
}

if (command === 'encrypt') {
   if (fs.statSync(dir).isDirectory()) {
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
         //removes files which are not encrypted. (not with .enc ext)
      });
      console.log(files)
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
