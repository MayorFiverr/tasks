<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "task_manager");

// To Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed."]));
}

// To Handle request method
$method = $_SERVER['REQUEST_METHOD'];

if ($method === "GET") {
    // Fetch tasks with optional filtering
    $status = isset($_GET["status"]) ? $_GET["status"] : "";
    $query = "SELECT * FROM tasks";
    if ($status) {
        $query .= " WHERE status = ?";
    }
    $stmt = $conn->prepare($query);
    if ($status) {
        $stmt->bind_param("s", $status);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));

} elseif ($method === "POST") {
    // Validating the JSON input
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data["title"]) || !isset($data["description"]) || !isset($data["due_date"])) {
        echo json_encode(["error" => "All fields are required."]);
        exit;
    }

    // Insert new task
    $stmt = $conn->prepare("INSERT INTO tasks (title, description, due_date, status) VALUES (?, ?, ?, 'pending')");
    $stmt->bind_param("sss", $data["title"], $data["description"], $data["due_date"]);
    if ($stmt->execute()) {
        echo json_encode(["message" => "Task added successfully."]);
    } else {
        echo json_encode(["error" => "Failed to add task."]);
    }

} elseif ($method === "PUT") {
    // To Validate data status
    parse_str(file_get_contents("php://input"), $data);
    if (!isset($data["status"]) || !isset($_GET["id"])) {
        echo json_encode(["error" => "Invalid request."]);
        exit;
    }

    // Update task
    $stmt = $conn->prepare("UPDATE tasks SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $data["status"], $_GET["id"]);
    if ($stmt->execute()) {
        echo json_encode(["message" => "Task updated."]);
    } else {
        echo json_encode(["error" => "Failed to update task."]);
    }

} elseif ($method === "DELETE") {
    // To Delete task
    if (!isset($_GET["id"])) {
        echo json_encode(["error" => "Task ID is required."]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM tasks WHERE id = ?");
    $stmt->bind_param("i", $_GET["id"]);
    if ($stmt->execute()) {
        echo json_encode(["message" => "Task deleted."]);
    } else {
        echo json_encode(["error" => "Error in deleting Task."]);
    }
} else {
    echo json_encode(["error" => "Invalid requestt."]);
}
?>
