<?php
header("Content-Type: application/json");

require_once './config/Database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

$id = $_GET['id'] ?? null;

/* ===== GET ===== */
if ($method === 'GET') {

    if ($id) {
        $stmt = $db->prepare("SELECT * FROM resources WHERE id = ?");
        $stmt->execute([$id]);
        $resource = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($resource) {
            echo json_encode($resource);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Not found"]);
        }

    } else {
        $stmt = $db->query("SELECT * FROM resources ORDER BY created_at DESC");
        $resources = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($resources);
    }
}

/* ===== POST ===== */
elseif ($method === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $title = $data['title'] ?? '';
    $description = $data['description'] ?? '';
    $link = $data['link'] ?? '';

    if (!$title || !$link) {
        http_response_code(400);
        echo json_encode(["error" => "Missing data"]);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO resources (title, description, link) VALUES (?, ?, ?)");
    $stmt->execute([$title, $description, $link]);

    echo json_encode(["success" => true]);
}

/* ===== PUT ===== */
elseif ($method === 'PUT') {

    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $db->prepare("UPDATE resources SET title=?, description=?, link=? WHERE id=?");
    $stmt->execute([
        $data['title'],
        $data['description'],
        $data['link'],
        $data['id']
    ]);

    echo json_encode(["success" => true]);
}

/* ===== DELETE ===== */
elseif ($method === 'DELETE') {

    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Missing id"]);
        exit;
    }

    $stmt = $db->prepare("DELETE FROM resources WHERE id=?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true]);
}
?>
