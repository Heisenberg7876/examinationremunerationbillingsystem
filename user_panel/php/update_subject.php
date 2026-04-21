<?php
include 'db.php';

$stmt = $conn->prepare("UPDATE subjects SET paper_set = ?, exam_duration = ?, base_remuneration = ? WHERE id = ?");
$stmt->bind_param("sidi", $_POST['paper_set'], $_POST['exam_duration'], $_POST['base_remuneration'], $_POST['subject_id']);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conn->close();
?>