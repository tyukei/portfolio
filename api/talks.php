<?php
/**
 * api/talks.php
 * SpeakerDeck の Atom フィードからスライド一覧を返す。
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$username  = 'tyukei';
$cacheDir  = __DIR__ . '/cache';
$cacheFile = $cacheDir . '/talks_' . date('Y-m-d') . '.json';

if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}

// ── キャッシュ ────────────────────────────────────────────────────────────────
if (file_exists($cacheFile)) {
    $cached = json_decode(file_get_contents($cacheFile), true);
    echo json_encode(['talks' => $cached], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Atom フィード取得 ─────────────────────────────────────────────────────────
$url = "https://speakerdeck.com/{$username}.atom";
$ctx = stream_context_create(['http' => [
    'timeout' => 10,
    'header'  => "User-Agent: Mozilla/5.0 portfolio-site/1.0\r\n",
]]);

$raw   = @file_get_contents($url, false, $ctx);
$talks = [];

if ($raw) {
    libxml_use_internal_errors(true);
    $xml = simplexml_load_string($raw);
    libxml_clear_errors();

    if ($xml) {
        foreach ($xml->entry as $entry) {
            $title   = (string)$entry->title;
            $link    = (string)($entry->link['href'] ?? $entry->id ?? '');
            $updated = (string)($entry->updated ?? $entry->published ?? '');
            $date    = $updated ? substr($updated, 0, 10) : null;

            // サムネイル取得: content 内の img src or data-thumbnail
            $thumb   = null;
            $content = (string)($entry->content ?? '');
            if (preg_match('/data-thumbnail=["\']([^"\']+)["\']/', $content, $m)) {
                $thumb = $m[1];
            } elseif (preg_match('/<img[^>]+src=["\']([^"\']+)["\']/', $content, $m)) {
                $thumb = $m[1];
            }

            $talks[] = [
                'title'     => $title,
                'url'       => $link,
                'date'      => $date,
                'thumbnail' => $thumb,
            ];
        }
    }
}

file_put_contents($cacheFile, json_encode($talks, JSON_UNESCAPED_UNICODE));
echo json_encode(['talks' => $talks], JSON_UNESCAPED_UNICODE);
