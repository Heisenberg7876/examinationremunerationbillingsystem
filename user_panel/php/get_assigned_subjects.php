
<?php
include 'db.php';

$examiner_id = isset($_GET['examiner_id']) ? intval($_GET['examiner_id']) : 0;
if (!$examiner_id) {
    echo json_encode([]);
    exit;
}
$stmt = $conn->prepare("
    SELECT s.id AS subject_id, s.subject_code, s.subject_name 
    FROM remunerations r 
    JOIN subjects s ON r.subject_id = s.id 
    WHERE r.examiner_id = ? AND r.remuneration IS NULL
");
$stmt->bind_param("i", $examiner_id);
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
