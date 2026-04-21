<?php
include 'db.php';

$paper_type = isset($_GET['paperType']) ? $_GET['paperType'] : 'all';
$course_type = isset($_GET['courseType']) ? $_GET['courseType'] : 'all';
$al_id = isset($_GET['al_id']) ? $_GET['al_id'] : 'all';
$special_case = isset($_GET['specialCase']) ? $_GET['specialCase'] : 'all';

$query = "SELECT rr.*, al.level_name AS alevel_name 
          FROM remuneration_rates rr
          LEFT JOIN academic_level al ON rr.al_id = al.id";
$conditions = [];
$params = [];
$types = '';

if ($paper_type !== 'all') {
    $conditions[] = "paper_type = ?";
    $params[] = $paper_type;
    $types .= 's';
}
if ($course_type !== 'all') {
    $conditions[] = "course_type = ?";
    $params[] = $course_type;
    $types .= 's';
}
if ($al_id !== 'all') {
    $conditions[] = "al_id = ?";
    $params[] = $al_id;
    $types .= 'i';
}
if ($special_case !== 'all') {
    $conditions[] = "special_case = ?";
    $params[] = $special_case;
    $types .= 's';
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

$rates = [];
while ($row = $result->fetch_assoc()) {
    $rates[] = $row;
}

echo json_encode($rates);

$stmt->close();
$conn->close();
?>