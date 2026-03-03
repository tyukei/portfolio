<?php
/**
 * api/articles.php
 * Zenn の記事一覧を返す。
 * ?count=N  (default 6, max 20)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$count    = min((int)($_GET['count'] ?? 6), 20);
$username = 'kei_ninja';

$cacheDir  = __DIR__ . '/cache';
$cacheFile = $cacheDir . '/articles_' . date('Y-m-d') . '.json';

if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}

// ── キャッシュ ────────────────────────────────────────────────────────────────
if (file_exists($cacheFile)) {
    $cached = json_decode(file_get_contents($cacheFile), true);
    echo json_encode(['articles' => array_slice($cached, 0, $count)], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Zenn API 取得 ─────────────────────────────────────────────────────────────
$url = "https://zenn.dev/api/articles?username={$username}&order=latest&count=20";
$ctx = stream_context_create(['http' => [
    'timeout' => 10,
    'header'  => "User-Agent: portfolio-site/1.0\r\n",
]]);

$raw = @file_get_contents($url, false, $ctx);
if (!$raw) {
    echo json_encode(['error' => 'Failed to fetch articles', 'articles' => []], JSON_UNESCAPED_UNICODE);
    exit;
}

$data     = json_decode($raw, true);
$articles = [];

foreach ($data['articles'] ?? [] as $a) {
    $articles[] = [
        'title'        => $a['title']        ?? '',
        'url'          => 'https://zenn.dev' . ($a['path'] ?? ''),
        'emoji'        => $a['emoji']        ?? '📝',
        'type'         => $a['article_type'] ?? 'tech',
        'published_at' => $a['published_at'] ?? '',
        'liked_count'  => $a['liked_count']  ?? 0,
    ];
}

file_put_contents($cacheFile, json_encode($articles, JSON_UNESCAPED_UNICODE));
echo json_encode(['articles' => array_slice($articles, 0, $count)], JSON_UNESCAPED_UNICODE);
