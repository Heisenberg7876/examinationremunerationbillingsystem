<?php
include 'db.php';

$faculty_id = isset($_GET['faculty_id']) ? intval($_GET['faculty_id']) : 0;
$level_id   = isset($_GET['academicLevel']) ? intval($_GET['academicLevel']) : 0;

if (!$faculty_id || !$level_id) {
    echo json_encode([]);
    exit;
}

// Determine prefix based on academic level (1 = UG → B.*, 2 = PG → M.*)
$prefix = '';
if ($level_id == 1) {
    $prefix = 'B.%';  // Undergraduate: B.Sc, B.A, B.Com, etc.
} elseif ($level_id == 2) {
    $prefix = 'M.%';  // Postgraduate: M.Sc, M.A, M.Com, etc.
} else {
    echo json_encode([]);
    exit;
}

// Query: filter by faculty_id and class_name starting with correct prefix
$stmt = $conn->prepare("SELECT id, class_name 
                        FROM classes 
                        WHERE faculty_id = ? 
                          AND class_name LIKE ? 
                        ORDER BY class_name");
$stmt->bind_param("is", $faculty_id, $prefix);
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