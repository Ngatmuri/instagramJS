const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// Ukuran gambar (1080x1080 px untuk Instagram)
const width = 1080;
const height = 1080;

// Membaca baris dari file remaja.txt dan memilih secara acak yang belum digunakan
function getRandomQuoteFromFile() {
    const filePath = 'remaja.txt'; // Ganti dengan path ke file remaja.txt
    const usedFilePath = 'sudahdigunakan.txt'; // File untuk menyimpan baris yang sudah digunakan

    // Membaca file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length === 0) {
        throw new Error('Tidak ada baris dalam file remaja.txt');
    }

    // Membaca baris yang sudah digunakan
    let usedLines = [];
    if (fs.existsSync(usedFilePath)) {
        usedLines = fs.readFileSync(usedFilePath, 'utf-8').split('\n').map(line => line.trim());
    }

    // Menyaring baris yang sudah digunakan
    const availableLines = lines.filter(line => !usedLines.includes(line));

    if (availableLines.length === 0) {
        throw new Error('Semua baris sudah digunakan');
    }

    // Memilih baris acak dari yang belum digunakan
    const randomIndex = Math.floor(Math.random() * availableLines.length);
    const randomQuote = availableLines[randomIndex];

    // Menambahkan baris yang sudah digunakan ke dalam sudahdigunakan.txt
    usedLines.push(randomQuote);
    fs.writeFileSync(usedFilePath, usedLines.join('\n'));

    // Menghapus baris yang sudah dipilih dari remaja.txt
    const updatedLines = lines.filter(line => line !== randomQuote);
    fs.writeFileSync(filePath, updatedLines.join('\n'));

    return randomQuote;
}

// Membuat kanvas
const canvas = createCanvas(width, height);
const context = canvas.getContext('2d');

// Fungsi untuk menyesuaikan ukuran font
function adjustFontSize(context, text, maxWidth, maxHeight) {
    let fontSize = 100; // Ukuran font awal
    const minFontSize = 40; // Ukuran font terkecil

    context.font = `${fontSize}px "Roboto Slab"`; // Menggunakan font tebal dan jelas

    // Menghitung tinggi total teks
    let totalHeight = calculateTextHeight(context, text, maxWidth, fontSize);
    
    // Mengurangi ukuran font sampai teks muat dalam maxHeight atau mencapai ukuran terkecil
    while (totalHeight > maxHeight && fontSize > minFontSize) {
        fontSize -= 2; // Mengurangi ukuran font
        context.font = `${fontSize}px "Roboto Slab"`;
        totalHeight = calculateTextHeight(context, text, maxWidth, fontSize);
    }

    return fontSize;
}

// Fungsi untuk menghitung tinggi teks yang dibungkus
function calculateTextHeight(context, text, maxWidth, fontSize) {
    const lineHeight = fontSize * 1.4;
    const sentences = text.split(/(?<=[."])(?=\s|\()|(?<=[)])\s+/); // Memisahkan kalimat dengan mempertimbangkan tanda kurung dan titik
    let totalHeight = 0;

    for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();
        if (trimmedSentence.length === 0) continue;
        
        const words = trimmedSentence.split(' ');
        let line = '';
        let lineCount = 0;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && line.length > 0) {
                lineCount++;
                line = words[n] + ' ';
            } else {
                line = testLine;
            }
        }
        
        // Add last line
        if (line.trim()) {
            lineCount++;
        }

        totalHeight += lineCount * lineHeight;
    }
    return totalHeight;
}

// Fungsi untuk memilih file logo acak dari folder
function getRandomLogo(folderPath) {
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.png'));
    if (files.length === 0) throw new Error('Tidak ada file logo di folder: ' + folderPath);
    const randomIndex = Math.floor(Math.random() * files.length);
    return path.join(folderPath, files[randomIndex]);
}

// Fungsi untuk membuat gambar
async function createImage() {
    const quote = getRandomQuoteFromFile(); // Mengambil quote acak dari file

    // Membuat kanvas latar belakang putih
    context.fillStyle = '#ffffff'; // Warna latar belakang putih
    context.fillRect(0, 0, width, height);

    // Mengatur padding dan lebar maksimal teks
    const paddingLeft = 60;
    const paddingRight = 60;
    const maxWidth = width - paddingLeft - paddingRight;
    const maxHeight = height * 0.6; // Batasi tinggi untuk teks agar tidak keluar dari gambar
    let fontSize = adjustFontSize(context, quote, maxWidth, maxHeight);
    const lineHeight = fontSize * 1.6;
    let x = paddingLeft;
    let y = height * 0.2; // Menempatkan teks lebih tinggi (sekitar 30% dari tinggi gambar)

    // Fungsi untuk membungkus teks dengan line break
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        const sentences = text.split(/(?<=[."])(?=\s|\()|(?<=[)])\s+/); // Memisahkan kalimat dengan mempertimbangkan tanda kurung dan titik

        for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();
            if (trimmedSentence.length === 0) continue;
            
            const words = trimmedSentence.split(' ');
            let line = '';

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = context.measureText(testLine);
                const testWidth = metrics.width;

                // Jika panjang baris melebihi maxWidth, cetak baris dan mulai baris baru
                if (testWidth > maxWidth && line.length > 0) {
                    context.fillText(line.trim(), x, y);
                    y += lineHeight;
                    line = words[n] + ' ';
                } else {
                    line = testLine;
                }
            }

            if (line.trim()) {
                context.fillText(line.trim(), x, y);
                y += lineHeight;
            }
        }
    }

    // Mengatur warna teks hitam dengan efek bayangan
    context.fillStyle = '#333333'; // Warna teks gelap
    context.shadowColor = '#aaaaaa'; // Warna bayangan
    context.shadowBlur = 10; // Blur bayangan
    context.shadowOffsetX = 4; // Geser bayangan horizontal
    context.shadowOffsetY = 4; // Geser bayangan vertikal
    wrapText(context, quote, x, y, maxWidth, lineHeight);

    // Memuat dan menambahkan logo kanan bawah
    const logoImage = await loadImage('logo.png'); // Ganti dengan path ke logo Anda
    const logoWidth = 100; // Lebar logo yang lebih besar
    const logoHeight = 100; // Tinggi logo yang lebih besar
    const logoX = width - logoWidth - 35; // Posisi horizontal logo
    const logoY = height - logoHeight - 40; // Posisi vertikal logo (di atas footer)

    context.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight); // Menempatkan logo di atas footer

    // Memilih dan menambahkan logo acak di tengah bawah
    const randomLogoPath = getRandomLogo('./logo'); // Folder tempat logo berada
    const centerLogoImage = await loadImage(randomLogoPath);
    const centerLogoWidth = 150; // Lebar logo tengah
    const centerLogoHeight = 190; // Tinggi logo tengah
    const centerLogoX = (width - centerLogoWidth) / 55; // Posisi horizontal tengah
    const centerLogoY = height - centerLogoHeight - 0; // Posisi vertikal tengah bawah

    context.drawImage(centerLogoImage, centerLogoX, centerLogoY, centerLogoWidth, centerLogoHeight);

    // Menambahkan teks "#Koceng404" di bawah logo kanan bawah
    const footerText = "@Quotes.Mberuh"; // Teks di pojokan
    context.font = '20px "Roboto Slab"'; // Ukuran font lebih kecil untuk footer
    const footerWidth = context.measureText(footerText).width;
    const footerX = width - footerWidth - 20; // Posisi horizontal
    const footerY = height - 20; // Posisi vertikal
    context.fillText(footerText, footerX, footerY); // Menulis footer

    // Menyimpan gambar sebagai file PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./Bahan.png', buffer);

    console.log('Gambar berhasil dibuat: quote_instagram_with_logo_large.png');
}

// Menjalankan fungsi untuk membuat gambar
createImage().catch(console.error);
