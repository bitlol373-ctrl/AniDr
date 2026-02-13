<?php
// Твой токен от BotFather
$botToken = "8550563875:AAE2uUhAFCSP0uf3wJqeummnmM24oEiIPHc";
$fileId = $_GET['file_id'];

if (!$fileId) die("No file_id provided");

// 1. Получаем путь к файлу в Telegram
$apiUrl = "https://api.telegram.org/bot$botToken/getFile?file_id=$fileId";
$res = json_decode(file_get_contents($apiUrl), true);

if (isset($res['result']['file_path'])) {
    $filePath = $res['result']['file_path'];
    $videoUrl = "https://api.telegram.org/file/bot$botToken/$filePath";

    // 2. Пробрасываем видео в браузер
    header("Content-Type: video/mp4");
    readfile($videoUrl);
} else {
    echo "Error finding file";
}
?>