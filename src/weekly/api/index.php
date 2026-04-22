<?php

// ================= HEADERS =================
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$db = getDBConnection();

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true) ?? [];

$action    = $_GET['action'] ?? null;
$id        = $_GET['id'] ?? null;
$weekId    = $_GET['week_id'] ?? null;
$commentId = $_GET['comment_id'] ?? null;


// ================= HELPERS =================

function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function validateDate($date) {
    $d = DateTime::createFromFormat('Y-m-d', $date);
    return $d && $d->format('Y-m-d') === $date;
}

function sanitize($str) {
    return htmlspecialchars(strip_tags(trim($str)), ENT_QUOTES, 'UTF-8');
}


// ================= WEEKS =================

function getAllWeeks($db) {
    $stmt = $db->query("SELECT * FROM weeks ORDER BY start_date ASC");
    $weeks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($weeks as &$w) {
        $w['links'] = json_decode($w['links'], true) ?? [];
    }

    sendResponse(['success' => true, 'data' => $weeks]);
}

function getWeekById($db, $id) {
    if (!is_numeric($id)) sendResponse(['success' => false], 400);

    $stmt = $db->prepare("SELECT * FROM weeks WHERE id=?");
    $stmt->execute([$id]);
    $week = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$week) sendResponse(['success' => false], 404);

    $week['links'] = json_decode($week['links'], true) ?? [];

    sendResponse(['success' => true, 'data' => $week]);
}

function createWeek($db, $data) {

    if (empty($data['title']) || empty($data['start_date'])) {
        sendResponse(['success' => false], 400);
    }

    if (!validateDate($data['start_date'])) {
        sendResponse(['success' => false], 400);
    }

    $stmt = $db->prepare("INSERT INTO weeks(title,start_date,description,links) VALUES(?,?,?,?)");
    $stmt->execute([
        sanitize($data['title']),
        $data['start_date'],
        sanitize($data['description'] ?? ''),
        json_encode($data['links'] ?? [])
    ]);

    sendResponse([
        'success' => true,
        'id' => $db->lastInsertId()
    ], 201);
}

function updateWeek($db, $data) {

    if (empty($data['id']) || !is_numeric($data['id'])) {
        sendResponse(['success' => false], 400);
    }

    $check = $db->prepare("SELECT id FROM weeks WHERE id=?");
    $check->execute([$data['id']]);

    if (!$check->fetch()) {
        sendResponse(['success' => false], 404);
    }

    $fields = [];
    $values = [];

    if (isset($data['title'])) {
        $fields[] = "title=?";
        $values[] = sanitize($data['title']);
    }

    if (isset($data['start_date'])) {
        if (!validateDate($data['start_date'])) {
            sendResponse(['success' => false], 400);
        }
        $fields[] = "start_date=?";
        $values[] = $data['start_date'];
    }

    if (isset($data['description'])) {
        $fields[] = "description=?";
        $values[] = sanitize($data['description']);
    }

    if (isset($data['links'])) {
        $fields[] = "links=?";
        $values[] = json_encode($data['links']);
    }

    if (empty($fields)) {
        sendResponse(['success' => false], 400);
    }

    $values[] = $data['id'];

    $sql = "UPDATE weeks SET " . implode(",", $fields) . " WHERE id=?";
    $stmt = $db->prepare($sql);
    $stmt->execute($values);

    sendResponse(['success' => true]);
}

function deleteWeek($db, $id) {

    if (!is_numeric($id)) sendResponse(['success' => false], 400);

    $check = $db->prepare("SELECT id FROM weeks WHERE id=?");
    $check->execute([$id]);

    if (!$check->fetch()) {
        sendResponse(['success' => false], 404);
    }

    $stmt = $db->prepare("DELETE FROM weeks WHERE id=?");
    $stmt->execute([$id]);

    sendResponse(['success' => true]);
}


// ================= COMMENTS =================

function getCommentsByWeek($db, $weekId) {

    if (!is_numeric($weekId)) sendResponse(['success' => false], 400);

    $stmt = $db->prepare("SELECT * FROM comments_week WHERE week_id=? ORDER BY created_at ASC");
    $stmt->execute([$weekId]);

    sendResponse(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

function createComment($db, $data) {

    if (empty($data['week_id']) || empty($data['author']) || empty($data['text'])) {
        sendResponse(['success' => false], 400);
    }

    $stmt = $db->prepare("INSERT INTO comments_week(week_id,author,text) VALUES(?,?,?)");
    $stmt->execute([
        $data['week_id'],
        sanitize($data['author']),
        sanitize($data['text'])
    ]);

    sendResponse([
        'success' => true,
        'id' => $db->lastInsertId(),
        'data' => [
            'week_id' => $data['week_id'],
            'author' => $data['author'],
            'text' => $data['text']
        ]
    ], 201);
}

function deleteComment($db, $commentId) {

    if (!is_numeric($commentId)) sendResponse(['success' => false], 400);

    $stmt = $db->prepare("DELETE FROM comments_week WHERE id=?");
    $stmt->execute([$commentId]);

    sendResponse(['success' => true]);
}


// ================= ROUTER =================

try {

    if ($method === 'GET') {

        if ($action === 'comments') {
            getCommentsByWeek($db, $weekId);
        } elseif ($id) {
            getWeekById($db, $id);
        } else {
            getAllWeeks($db);
        }

    } elseif ($method === 'POST') {

        if ($action === 'comment') {
            createComment($db, $data);
        } else {
            createWeek($db, $data);
        }

    } elseif ($method === 'PUT') {

        updateWeek($db, $data);

    } elseif ($method === 'DELETE') {

        if ($action === 'delete_comment') {
            deleteComment($db, $commentId);
        } else {
            deleteWeek($db, $id);
        }

    } else {
        sendResponse(['success' => false], 405);
    }

} catch (Exception $e) {
    error_log($e->getMessage());
    sendResponse(['success' => false], 500);
}