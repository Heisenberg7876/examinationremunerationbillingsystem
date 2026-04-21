
<?php
include 'db.php';

$major_subject_id = isset($_GET['major_subject_id']) ? intval($_GET['major_subject_id']) : 0;
$semester_id = isset($_GET['semester_id']) ? intval($_GET['semester_id']) : 0;
$class_id = isset($_GET['class_id']) ? intval($_GET['class_id']) : 0;
$faculty_id = isset($_GET['faculty_id']) ? intval($_GET['faculty_id']) : 0;

if (!$major_subject_id || !$semester_id || !$class_id || !$faculty_id) {
    echo json_encode([]);
    exit;
}

$stmt = $conn->prepare("
    SELECT s.id, s.subject_code, s.subject_name 
    FROM subjects s
    JOIN major_subjects ms ON s.major_subject_id = ms.id
    JOIN classes c ON ms.class_id = c.id
    JOIN faculties f ON c.faculty_id = f.id
    WHERE s.major_subject_id = ? AND s.semester_id = ? AND ms.class_id = ? AND c.faculty_id = ?
");
$stmt->bind_param("iiii", $major_subject_id, $semester_id, $class_id, $faculty_id);
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
