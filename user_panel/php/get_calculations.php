
<?php
include 'db.php';

$examiner_id = isset($_GET['examiner_id']) ? intval($_GET['examiner_id']) : 0;
$limit = isset($_GET['limit']) ? " LIMIT " . intval($_GET['limit']) : "";
$query = "SELECT r.id, r.examiner_id, r.subject_id, r.remuneration, r.paper_set, r.exam_duration, 
                 e.paper_setter, s.subject_code, s.subject_name, 
                 c.college_name, f.faculty_name, cl.class_name
          FROM remunerations r
          JOIN examiners e ON r.examiner_id = e.id
          JOIN subjects s ON r.subject_id = s.id
          JOIN colleges c ON r.college_id = c.id
          JOIN faculties f ON r.faculty_id = f.id
          JOIN classes cl ON r.class_id = cl.id
          WHERE r.remuneration IS NOT NULL";
if ($examiner_id) {
    $query .= " AND r.examiner_id = ?";
}
$query .= " ORDER BY r.created_at DESC" . $limit;

if ($examiner_id) {
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $examiner_id);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query($query);
}
$calculations = [];
while ($row = $result->fetch_assoc()) {
    $calculations[] = $row;
}
echo json_encode($calculations);

$conn->close();
?>
