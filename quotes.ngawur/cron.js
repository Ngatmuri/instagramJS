const { exec } = require('child_process');

// Fungsi untuk menjalankan skrip eksternal
function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const process = exec(`node ${scriptName}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error menjalankan ${scriptName}: ${error.message}`);
      } else if (stderr) {
        reject(`stderr dari ${scriptName}: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });

    // Menangani output stdout dan stderr
    process.stdout.on('data', (data) => {
      console.log(data);
    });
    process.stderr.on('data', (data) => {
      console.error(data);
    });
  });
}

// Menjalankan File A terlebih dahulu, kemudian File B
async function runScripts() {
  try {
    console.log("Menjalankan File A...");
    await runScript('create.js'); // Menjalankan File A
    console.log("File A selesai. Menjalankan File B...");
    await runScript('a.js'); // Menjalankan File B setelah File A selesai
  } catch (error) {
    console.error(`Terjadi error: ${error}`);
  }
}

runScripts();
