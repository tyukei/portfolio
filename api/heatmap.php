<?php

// ── 設定と初期化 ─────────────────────────────────────────────────────────────
$year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');
$cacheDir = __DIR__ . '/cache';
$cacheFile = "{$cacheDir}/heatmap_{$year}.json";

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// ── キャッシュ返却 ────────────────────────────────────────────────────────────
if (file_exists($cacheFile)) {
    echo file_get_contents($cacheFile);
    exit;
}

if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}

function fetchGitHubUser(string $username, int $year): array
{
    // .envファイルからトークンを読み込む（存在する場合）
    $envFile = __DIR__ . '/.env';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) continue;
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv(sprintf('%s=%s', $name, $value));
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }

    $token = getenv('GITHUB_TOKEN'); 
    $contributions = [];

    // トークンが設定されていない場合は空配列を返す（エラーで止まるのを防ぐ）
    if (!$token) {
        return [];
    }

    $from = "{$year}-01-01T00:00:00Z";
    $to = "{$year}-12-31T23:59:59Z";

    $query = 'query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }';

    $variables = [
        'username' => $username,
        'from' => $from,
        'to' => $to,
    ];

    $data = json_encode(['query' => $query, 'variables' => $variables]);

    $ctx = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => implode("\r\n", [
                "User-Agent: portfolio-site/1.0",
                "Authorization: bearer {$token}",
                "Content-Type: application/json",
            ]),
            'content' => $data,
            'timeout' => 10,
        ]
    ]);

    $raw = @file_get_contents('https://api.github.com/graphql', false, $ctx);
    if (!$raw) return [];

    $res = json_decode($raw, true);
    $weeks = $res['data']['user']['contributionsCollection']['contributionCalendar']['weeks'] ?? [];

    foreach ($weeks as $week) {
        foreach ($week['contributionDays'] ?? [] as $day) {
            $count = $day['contributionCount'] ?? 0;
            if ($count > 0) {
                $contributions[$day['date']] = $count;
            }
        }
    }

    return $contributions;
}

/**
 * 複数の GitHub アカウントのコントリビューションを合算して返す
 */
function fetchGitHub(array $usernames, int $year): array
{
    $merged = [];
    foreach ($usernames as $username) {
        foreach (fetchGitHubUser($username, $year) as $date => $count) {
            $merged[$date] = ($merged[$date] ?? 0) + $count;
        }
    }
    return $merged;
}

// ── Zenn ─────────────────────────────────────────────────────────────────────
function fetchZenn(string $username): array
{
    $dates = [];
    $page = 1;
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 10,
            'header' => "User-Agent: portfolio-site/1.0\r\n",
        ]
    ]);

    while ($page <= 5) {
        $url = "https://zenn.dev/api/articles?username={$username}&order=latest&count=96&page={$page}";
        $raw = @file_get_contents($url, false, $ctx);
        if (!$raw)
            break;

        $data = json_decode($raw, true);
        if (empty($data['articles']))
            break;

        foreach ($data['articles'] as $article) {
            $date = substr($article['published_at'], 0, 10);
            $dates[$date] = ($dates[$date] ?? 0) + 1;
        }
        $page++;
    }
    return $dates;
}

// ── Connpass ─────────────────────────────────────────────────────────────────
function fetchConnpass(string $username): array
{
    $dates = [];
    $url = "https://connpass.com/api/v1/event/?nickname={$username}&count=100";
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 10,
            'header' => "User-Agent: portfolio-site/1.0\r\n",
        ]
    ]);
    $raw = @file_get_contents($url, false, $ctx);
    if (!$raw)
        return $dates;

    $data = json_decode($raw, true);
    if (empty($data['events']))
        return $dates;

    foreach ($data['events'] as $event) {
        $date = substr($event['started_at'], 0, 10);
        $dates[$date] = ($dates[$date] ?? 0) + 1;
    }
    return $dates;
}

// ── SpeakerDeck ──────────────────────────────────────────────────────────────
function fetchSpeakerDeck(string $username): array
{
    $dates = [];
    $url = "https://speakerdeck.com/{$username}.atom";
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 10,
            'header' => "User-Agent: portfolio-site/1.0\r\n",
        ]
    ]);
    $raw = @file_get_contents($url, false, $ctx);
    if (!$raw)
        return $dates;

    libxml_use_internal_errors(true);
    $xml = simplexml_load_string($raw);
    libxml_clear_errors();
    if (!$xml)
        return $dates;

    foreach ($xml->entry as $entry) {
        $updated = (string) ($entry->updated ?? $entry->published ?? '');
        $date = substr($updated, 0, 10);
        if ($date)
            $dates[$date] = ($dates[$date] ?? 0) + 1;
    }
    return $dates;
}

// ── 集計 ─────────────────────────────────────────────────────────────────────
$github = fetchGitHub(['tyukei', 'chukei2'], $year);
$zenn = fetchZenn('kei_ninja');
$connpass = fetchConnpass('tyukei');
$speakerdeck = fetchSpeakerDeck('tyukei');

$rangeStart = "{$year}-01-01";
$rangeEnd = "{$year}-12-31";

$allDates = array_unique(array_merge(
    array_keys($github),
    array_keys($zenn),
    array_keys($connpass),
    array_keys($speakerdeck)
));

$response = [];
foreach ($allDates as $date) {
    if ($date < $rangeStart || $date > $rangeEnd)
        continue;

    $gh = $github[$date] ?? 0;
    $z = $zenn[$date] ?? 0;
    $c = $connpass[$date] ?? 0;
    $s = $speakerdeck[$date] ?? 0;

    $total = $gh + $z + $c + $s;
    if ($total > 0) {
        $response[$date] = [
            'count' => $total,
            'platforms' => [
                'github' => $gh,
                'zenn' => $z,
                'connpass' => $c,
                'speakerdeck' => $s,
            ]
        ];
    }
}

ksort($response);

$json = json_encode(['data' => $response]);
file_put_contents($cacheFile, $json);

echo $json;
