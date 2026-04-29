<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once './config/Database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

$data = json_decode(file_get_contents("php://input"), true);

$id = $_GET['id'] ?? null;

/* ================= GET ================= */
if ($method === 'GET') {

    if ($id) {
        $stmt = $db->prepare("SELECT * FROM resources WHERE id = ?");
        $stmt->execute([$id]);
        $resource = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($resource) {
            echo json_encode(["success" => true, "data" => $resource]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Not found"]);
        }
    } else {
        $stmt = $db->query("SELECT * FROM resources ORDER BY created_at DESC");
        $resources = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "data" => $resources]);
    }
}

/* ================= POST ================= */
elseif ($method === 'POST') {

    $title = $data['title'] ?? '';
    $description = $data['description'] ?? '';
    $link = $data['link'] ?? '';

    if (!$title || !$link) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing fields"]);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO resources (title, description, link) VALUES (?, ?, ?)");
    $success = $stmt->execute([$title, $description, $link]);

    if ($success) {
        echo json_encode(["success" => true, "id" => $db->lastInsertId()]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false]);
    }
}

/* ================= PUT ================= */
elseif ($method === 'PUT') {

    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(["success" => false]);
        exit;
    }

    $stmt = $db->prepare("UPDATE resources SET title=?, description=?, link=? WHERE id=?");
    $success = $stmt->execute([
        $data['title'],
        $data['description'],
        $data['link'],
        $data['id']
    ]);

    echo json_encode(["success" => $success]);
}

/* ================= DELETE ================= */
elseif ($method === 'DELETE') {

    if (!$id) {
        http_response_code(400);
        echo json_encode(["success" => false]);
        exit;
    }

    $stmt = $db->prepare("DELETE FROM resources WHERE id=?");
    $success = $stmt->execute([$id]);

    echo json_encode(["success" => $success]);
}

else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>
