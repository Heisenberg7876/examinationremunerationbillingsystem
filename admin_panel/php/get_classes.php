<?php
include 'db.php';

$faculty_name = isset($_GET['faculty']) ? $_GET['faculty'] : '';
$level_id = isset($_GET['level_id']) ? (int)$_GET['level_id'] : 0;

$query = "SELECT DISTINCT c.id, c.class_name 
          FROM classes c 
          JOIN faculties f ON c.faculty_id = f.id";
$conditions = [];
$params = [];
$types = '';

if ($faculty_name) {
    $conditions[] = "f.faculty_name = ?";
    $params[] = $faculty_name;
    $types .= 's';
}
if ($level_id) {
    $level_stmt = $conn->prepare("SELECT level_name FROM academic_level WHERE id = ?");
    $level_stmt->bind_param("i", $level_id);
    $level_stmt->execute();
    $level_result = $level_stmt->get_result();
    $level_name = $level_result->num_rows > 0 ? $level_result->fetch_assoc()['level_name'] : '';
    $level_stmt->close();
    if ($level_name) {
        $conditions[] = "c.class_name LIKE ?";
        $params[] = "%" . ($level_name === 'UG' ? 'UG' : 'PG') . "%";
        $types .= 's';
    }
}

if (!empty($conditions)) {
    $query .= " WHERE " . implode(" AND ", $conditions);
}

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$classes = [];
while ($row = $result->fetch_assoc()) {
    $classes[] = $row;
}

echo json_encode($classes);

$stmt->close();
$conn->close();
?>