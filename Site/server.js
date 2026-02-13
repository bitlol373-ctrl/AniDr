const express = require('express');
const axios = require('axios');
const app = express();

const BOT_TOKEN = '8550563875:AAE2uUhAFCSP0uf3wJqeummnmM24oEiIPHc';

app.get('/stream/:file_id', async (req, res) => {
    try {
        const fileId = req.params.file_id;

        // 1. Получаем путь к файлу через Telegram API
        const getFileUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;
        const fileInfo = await axios.get(getFileUrl);
        const filePath = fileInfo.data.result.file_path;

        // 2. Формируем прямую ссылку на скачивание
        const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

        // 3. Перенаправляем поток данных прямо в браузер
        const response = await axios({
            method: 'get',
            url: downloadUrl,
            responseType: 'stream'
        });

        // Пробрасываем заголовки (тип видео, размер)
        res.set(response.headers);
        response.data.pipe(res);
        
    } catch (error) {
        res.status(500).send('Ошибка стриминга видео');
    }
});

app.listen(3000, () => console.log('Стример запущен на порту 3000'));