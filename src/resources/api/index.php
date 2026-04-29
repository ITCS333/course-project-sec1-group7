<?php
header("Content-Type: application/json");

require_once './config/Database.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

$data = json_decode(file_get_contents("php://input"), true);

$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;
$resource_id = $_GET['resource_id'] ?? null;

/* ========= GET ========= */
if ($method === 'GET') {

    if ($action === 'comments' && $resource_id) {
        $stmt = $db->prepare("SELECT * FROM comments_resource WHERE resource_id = ? ORDER BY created_at ASC");
        $stmt->execute([$resource_id]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "data" => $comments]);
        exit;
    }

    if ($id) {
        $stmt = $db->prepare("SELECT * FROM resources WHERE id = ?");
        $stmt->execute([$id]);
        $resource = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($resource) {
            echo json_encode(["success" => true, "data" => $resource]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false]);
        }
        exit;
    }

    $stmt = $db->query("SELECT * FROM resources ORDER BY created_at DESC");
    $resources = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $resources]);
}

/* ========= POST ========= */
elseif ($method === 'POST') {

    if ($action === 'comment') {

        $stmt = $db->prepare("INSERT INTO comments_resource (resource_id, author, text) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['resource_id'],
            $data['author'],
            $data['text']
        ]);

        $newComment = [
            "id" => $db->lastInsertId(),
            "resource_id" => $data['resource_id'],
            "author" => $data['author'],
            "text" => $data['text']
        ];

        echo json_encode(["success" => true, "data" => $newComment]);
        exit;
    }

    $stmt = $db->prepare("INSERT INTO resources (title, description, link) VALUES (?, ?, ?)");
    $stmt->execute([
        $data['title'],
        $data['description'],
        $data['link']
    ]);

    echo json_encode([
        "success" => true,
        "id" => $db->lastInsertId()
    ]);
}

/* ========= PUT ========= */
elseif ($method === 'PUT') {

    $stmt = $db->prepare("UPDATE resources SET title=?, description=?, link=? WHERE id=?");
    $stmt->execute([
        $data['title'],
        $data['description'],
        $data['link'],
        $data['id']
    ]);

    echo json_encode(["success" => true]);
}

/* ========= DELETE ========= */
elseif ($method === 'DELETE') {

    if ($action === 'delete_comment') {
        $comment_id = $_GET['comment_id'];

        $stmt = $db->prepare("DELETE FROM comments_resource WHERE id=?");
        $stmt->execute([$comment_id]);

        echo json_encode(["success" => true]);
        exit;
    }

    $stmt = $db->prepare("DELETE FROM resources WHERE id=?");
    $stmt->execute([$id]);

    echo json_encode(["success" => true]);
}
?>
