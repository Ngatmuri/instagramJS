const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: true, // Mode headless untuk berjalan tanpa GUI
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Dukungan sandbox
    });
    const page = await browser.newPage();

    // Memblokir gambar
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (request.resourceType() === 'image') {
            request.abort(); // Memblokir permintaan gambar
        } else {
            request.continue();
        }
    });

    // Muat cookie jika ada
    if (fs.existsSync('cookies.json')) {
        const cookies = JSON.parse(fs.readFileSync('cookies.json'));
        console.log('Cookies yang dimuat:', cookies);
        await page.setCookie(...cookies);
    }

    console.log('Mengakses Instagram...');
    await page.goto('https://www.instagram.com', { waitUntil: 'networkidle2' });
    console.log('Halaman utama dimuat.');

    // Tunggu halaman sepenuhnya dimuat
    await page.waitForTimeout(2000);

    // Lanjutkan dengan proses upload
    try {
        console.log('Menunggu tombol "Postingan baru" muncul...');
        await page.waitForSelector('svg[aria-label="Postingan baru"]', { visible: true, timeout: 10000 });

        // Klik tombol "Postingan baru"
        const createButton = await page.$('svg[aria-label="Postingan baru"]');
        await createButton.click();
        console.log('Tombol "Postingan baru" diklik.');

        // Tunggu dan klik elemen <svg> dengan aria-label="Postingan"
        await page.waitForSelector('svg[aria-label="Postingan"]'); // Tunggu hingga elemen ada
        await page.click('svg[aria-label="Postingan"]'); // Klik elemen

        // Tambahkan tindakan lainnya setelah klik
        console.log("Klik elemen Postingan berhasil");

        // Tunggu hingga tombol "Pilih dari komputer" muncul
        console.log('Menunggu tombol "Pilih dari komputer" muncul...');
        await page.waitForSelector('button._acan._acap._acas._aj1-._ap30', { visible: true, timeout: 10000 });

        const inputFileSelector = 'input[type="file"]';
        await page.waitForFunction(
            selector => document.querySelector(selector) !== null,
            { timeout: 15000 },
            inputFileSelector
        );

        // Pilih file untuk di-upload
        const inputUploadHandle = await page.$(inputFileSelector);
        await inputUploadHandle.uploadFile('Bahan.png'); // Ubah dengan path file yang ingin di-upload
        console.log('File untuk di-upload telah dipilih.');

        // Delay 2 detik
        await page.waitForTimeout(2000);

        // Tunggu tombol "Selanjutnya" muncul dan klik menggunakan XPath
        console.log('Menunggu tombol "Selanjutnya" muncul...');
        await page.waitForXPath('//div[contains(@role, "button") and contains(text(), "Selanjutnya")]', { visible: true, timeout: 10000 });

        const nextButton = await page.$x('//div[contains(@role, "button") and contains(text(), "Selanjutnya")]');
        await nextButton[0].click();
        console.log('Tombol "Selanjutnya" diklik.');

        // Tunggu tombol "Selanjutnya" muncul lagi dan klik
        console.log('Menunggu tombol "Selanjutnya" muncul lagi...');
        await page.waitForXPath('//div[contains(@role, "button") and contains(text(), "Selanjutnya")]', { visible: true, timeout: 10000 });

        const nextButtonAgain = await page.$x('//div[contains(@role, "button") and contains(text(), "Selanjutnya")]');
        await nextButtonAgain[0].click();
        console.log('Tombol "Selanjutnya" kedua diklik.');

        // Tunggu elemen input caption muncul
        console.log('Menunggu elemen input caption muncul...');
        const captionSelector = 'div[aria-label="Tulis keterangan..."]';
        await page.waitForSelector(captionSelector, { visible: true, timeout: 10000 });

        // Isi caption
        console.log('Mengisi caption...');
        const captionInput = await page.$(captionSelector);
        await captionInput.focus(); // Fokus pada elemen
        await page.keyboard.type(`-
-
-
-
-
Hashtags:
#quotesindonesian #quotes #insomkopi☕ #katakatacinta #katakatagalau #galauquotes #quotescinta #quotesbaper #katakatabaper #motivasicinta #motivasikehidupan #motivasi #motivasiindinesia #galau #cinta #katakatabijak #quotesbijak #katakatabijak #captiongalau #captionbijak #captioncinta #katakatasindiran #quotessindiran #captionbaper #baper #quotescinta #quotes #quotesbaper`); // Tulis caption

        // Tunggu tombol "Bagikan" muncul dan klik
        console.log('Menunggu tombol "Bagikan" muncul...');
        await page.waitForXPath('//div[contains(@role, "button") and contains(text(), "Bagikan")]', { visible: true, timeout: 10000 });

        const shareButton = await page.$x('//div[contains(@role, "button") and contains(text(), "Bagikan")]');
        await shareButton[0].click();
        console.log('Tombol "Bagikan" diklik.');

        // Tunggu hingga gambar centang muncul dengan memeriksa keberadaan gambar
        console.log('Menunggu gambar centang muncul...');
        const checkmarkSelector = 'img[src*="sHkePOqEDPz.gif"]';
        
        await page.waitForFunction(
            (selector) => !!document.querySelector(selector),
            {},
            checkmarkSelector
        );

        console.log('Gambar centang muncul. Menutup dialog...');
        const closeButtonSelector = 'div[role="button"] .x1lliihq[aria-label="Tutup"]';
        await page.waitForSelector(closeButtonSelector, { visible: true, timeout: 10000 });
        
        const closeButton = await page.$(closeButtonSelector);
        await closeButton.click();
        console.log('Dialog ditutup.');

        // Tutup browser langsung setelah dialog ditutup
        console.log('Menutup browser...');
        await browser.close();
        console.log('Browser ditutup.');
        return; // Keluar dari fungsi setelah browser ditutup
    } catch (error) {
        console.error('Terjadi kesalahan saat melanjutkan upload:', error);
        
        // Menangkap screenshot saat terjadi error
        await page.screenshot({ path: 'error-screenshot.png' });
        console.log('Screenshot diambil saat terjadi error.');
    }

    // Pastikan browser ditutup jika ada error
    await browser.close();
})().catch(error => {
    console.error('Terjadi kesalahan:', error);
});
