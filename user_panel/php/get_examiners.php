<?php
include 'db.php';

$class_id = $_GET['class_id'] ?? '';
$al_id = $_GET['al_id'] ?? '';
$year = $_GET['year'] ?? '';

$stmt = $conn->prepare("SELECT DISTINCT id, paper_setter FROM paper_setters WHERE class_id = ? AND al_id = ? AND year_id = ?");
$stmt->bind_param('iii', $class_id, $al_id, $year);
$stmt->execute();
$result = $stmt->get_result();
$examiners = [];
while ($row = $result->fetch_assoc()) {
    $examiners[] = $row;
}
echo json_encode($examiners);

$conn->close();
?>