
<?php
include 'db.php';

$class_id = isset($_GET['class_id']) ? intval($_GET['class_id']) : 0;
if (!$class_id) {
    echo json_encode([]);
    exit;
}
$stmt = $conn->prepare("SELECT id, major_subject_name FROM major_subjects WHERE class_id = ?");
$stmt->bind_param("i", $class_id);
$stmt->execute();
$result = $stmt->get_result();
$major_subjects = [];
while ($row = $result->fetch_assoc()) {
    $major_subjects[] = $row;
}
echo json_encode($major_subjects);

$stmt->close();
$conn->close();
?>
