
<?php
include 'db.php';

$examiner_id = isset($_POST['examiner_id']) ? intval($_POST['examiner_id']) : 0;
$subject_id = isset($_POST['subject_id']) ? intval($_POST['subject_id']) : 0;
$paper_set = isset($_POST['paper_set']) ? $_POST['paper_set'] : '';
$exam_duration = isset($_POST['exam_duration']) ? intval($_POST['exam_duration']) : 0;
$remuneration = isset($_POST['remuneration']) ? floatval($_POST['remuneration']) : 0;

// Validatng inpts
if (!$examiner_id || !$subject_id || !$paper_set || $exam_duration <= 0 || $remuneration <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid or missing input data']);
    exit;
}

// Check if record exist
$stmt = $conn->prepare("
    SELECT id FROM remunerations 
    WHERE examiner_id = ? AND subject_id = ? AND remuneration IS NULL
");
$stmt->bind_param("ii", $examiner_id, $subject_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'error' => 'No matching uncalculated assignment found']);
    $stmt->close();
    $conn->close();
    exit;
}

// Update record
$stmt = $conn->prepare("
    UPDATE remunerations 
    SET paper_set = ?, exam_duration = ?, remuneration = ? 
    WHERE examiner_id = ? AND subject_id = ? AND remuneration IS NULL
");
$stmt->bind_param("sidi", $paper_set, $exam_duration, $remuneration, $examiner_id, $subject_id);
if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No rows updated. Record may already have remuneration or does not exist.']);
    }
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
