<?php
/**
 * api/events.php
 * Connpass のイベント一覧を返す。
 * ?count=N  (default 8, max 20)
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$count = min((int) ($_GET['count'] ?? 8), 20);
$nickname = 'tyukei';
$connpassKey = '9gs8bPSr.VBKOwC1zoi87L9IEGsBGeGoTb1ex685UFbok6Ylc0VmPRgeIs8xOyZnw';

$cacheDir = __DIR__ . '/cache';
$cacheFile = $cacheDir . '/events_' . date('Y-m-d') . '.json';

if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}

// ── キャッシュ ────────────────────────────────────────────────────────────────
if (file_exists($cacheFile)) {
    $cached = json_decode(file_get_contents($cacheFile), true);
    echo json_encode(['events' => array_slice($cached, 0, $count)], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Connpass API v2 取得 ──────────────────────────────────────────────────────
function connpassGet(string $url, string $apiKey): ?array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
            "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "X-API-Key: $apiKey",
        ],
    ]);
    $raw = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($raw === false || $code !== 200)
        return null;
    return json_decode($raw, true);
}

$events = [];

$url = "https://connpass.com/api/v2/users/{$nickname}/presenter_events/?count=100&order=2";
$data = connpassGet($url, $connpassKey);
foreach ($data['events'] ?? [] as $ev) {
    $id = $ev['id'];
    $events[$id] = [
        'event_id' => $id,
        'title' => $ev['title'],
        'event_url' => $ev['url'],
        'started_at' => $ev['started_at'],
        'is_owner' => strtolower((string) ($ev['owner_nickname'] ?? '')) === strtolower($nickname),
        'is_presenter' => true,
    ];
}

// 日付降順にソート
usort($events, fn($a, $b) => strcmp($b['started_at'], $a['started_at']));
$events = array_values($events);

file_put_contents($cacheFile, json_encode($events, JSON_UNESCAPED_UNICODE));
echo json_encode(['events' => array_slice($events, 0, $count)], JSON_UNESCAPED_UNICODE);
