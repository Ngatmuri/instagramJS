const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

// Ukuran gambar (1080x1080 px untuk Instagram)
const width = 1080;
const height = 1080;

// Membuat kanvas
const canvas = createCanvas(width, height);
const context = canvas.getContext('2d');

// Quote yang ingin dibuat gambar
const quote = `"Orang yang paling sempurna imannya di antara kaum mukminin adalah yang paling baik akhlaknya, dan sebaik-baik kalian adalah yang paling baik kepada istrinya."
(HR, Tirmidzi)`;

// Fungsi untuk menyesuaikan ukuran font
function adjustFontSize(context, text, maxWidth) {
    let fontSize = 100; // Ukuran font awal
    const minFontSize = 40; // Ukuran font terkecil

    context.font = `${fontSize}px "Comic Sans MS"`; // Menggunakan Comic Sans MS

    // Mengurangi ukuran font sampai teks muat dalam maxWidth atau mencapai ukuran terkecil
    while (context.measureText(text).width > maxWidth && fontSize > minFontSize) {
        fontSize -= 2; // Mengurangi ukuran font
        context.font = `${fontSize}px "Comic Sans MS"`;
    }

    return fontSize;
}

// Fungsi untuk membuat gambar
async function createImage() {
    // Mengisi latar belakang dengan warna solid
    context.fillStyle = '#f5f7fa'; // Warna latar belakang
    context.fillRect(0, 0, width, height);

    // Memuat gambar template
    const templateImage = await loadImage('s.png'); // Ganti dengan path ke gambar Anda
    const templateWidth = 250; // Lebar gambar template
    const templateHeight = 250; // Tinggi gambar template
    const templateY = height - templateHeight; // Posisi vertikal gambar template
    context.drawImage(templateImage, 0, templateY, templateWidth, templateHeight); // Menempatkan gambar di pojok kiri bawah

    // Mengatur padding
    const paddingLeft = 60; // Jarak dari tepi kiri
    const paddingRight = 40; // Jarak dari tepi kanan

    // Mengatur posisi teks agar berada di dalam batas
    const maxWidth = width - templateWidth - paddingLeft - paddingRight; // Lebar maksimal teks
    let fontSize = adjustFontSize(context, quote, maxWidth); // Menyesuaikan ukuran font
    const lineHeight = fontSize * 1.4;  // Jarak antar baris yang lebih besar
    let x = paddingLeft;  // Posisi horizontal (menjaga jarak dari tepi kiri)

    // Mengatur posisi vertikal untuk teks
    let y = height * 0.1;  // Menempatkan teks lebih tinggi (sekitar 10% dari tinggi gambar)

    // Fungsi untuk membungkus teks dengan line break
    function wrapText(context, text, x, y, maxWidth, lineHeight) {
        const sentences = text.split(/(?<=[."])(?=\s|\()|(?<=[)])\s+/); // Memisahkan kalimat dengan mempertimbangkan tanda kurung dan titik

        for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();
            if (trimmedSentence.length === 0) continue; // Lewati jika kosong
            
            const words = trimmedSentence.split(' ');
            let line = '';

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = context.measureText(testLine);
                const testWidth = metrics.width;

                // Jika panjang baris melebihi maxWidth, cetak baris dan mulai baris baru
                if (testWidth > maxWidth && line.length > 0) {
                    context.fillText(line.trim(), x, y); // Cetak baris yang sudah dibentuk
                    y += lineHeight; // Geser vertikal untuk baris baru
                    line = words[n] + ' '; // Memulai baris baru dengan kata yang terlalu panjang
                } else {
                    line = testLine; // Tambahkan kata ke baris
                }
            }

            // Cetak baris terakhir jika ada
            if (line.trim()) {
                context.fillText(line.trim(), x, y);
                y += lineHeight; // Geser vertikal untuk jarak antar kalimat
            }
        }
    }

    // Mengatur warna teks dan menggambar
    context.fillStyle = '#000000'; // Warna teks hitam
    wrapText(context, quote, x, y, maxWidth, lineHeight); // Menggambarkan teks

    // Menambahkan teks "#Koceng404" di pojok kanan bawah
    const footerText = "#Koceng404";
    context.font = '50px "Comic Sans MS"'; // Ukuran font lebih kecil untuk footer
    const footerWidth = context.measureText(footerText).width;
    const footerX = width - footerWidth - 20; // Posisi horizontal
    const footerY = height - 20; // Posisi vertikal
    context.fillText(footerText, footerX, footerY); // Menulis footer

    // Menyimpan gambar sebagai file PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./quote_instagram.png', buffer);

    console.log('Gambar berhasil dibuat: quote_instagram.png');
}

// Menjalankan fungsi untuk membuat gambar
createImage().catch(console.error);
