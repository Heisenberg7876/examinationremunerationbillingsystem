<?php
include 'db.php';

$class_name = isset($_GET['class']) ? $_GET['class'] : '';
$level_id = isset($_GET['level_id']) ? (int)$_GET['level_id'] : 0;

$query = "SELECT DISTINCT ms.id, ms.major_subject_name 
          FROM major_subjects ms 
          JOIN classes c ON ms.class_id = c.id 
          WHERE c.class_name = ?";
$params = [$class_name];
$types = 's';

if ($level_id) {
    $level_stmt = $conn->prepare("SELECT level_name FROM academic_level WHERE id = ?");
    $level_stmt->bind_param("i", $level_id);
    $level_stmt->execute();
    $level_result = $level_stmt->get_result();
    $level_name = $level_result->num_rows > 0 ? $level_result->fetch_assoc()['level_name'] : '';
    $level_stmt->close();
    if ($level_name) {
        $query .= " AND c.class_name LIKE ?";
        $params[] = "%" . ($level_name === 'UG' ? 'UG' : 'PG') . "%";
        $types .= 's';
    }
}

$stmt = $conn->prepare($query);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$subjects = [];
while ($row = $result->fetch_assoc()) {
    $subjects[] = $row;
}

echo json_encode($subjects);

$stmt->close();
$conn->close();
?>