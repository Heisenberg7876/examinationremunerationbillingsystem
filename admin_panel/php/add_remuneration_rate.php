<?php
include 'db.php';

$paper_type = $_POST['paperType'];
$course_type = !empty($_POST['courseType']) ? $_POST['courseType'] : null;
$al_id = !empty($_POST['al_id']) ? $_POST['al_id'] : null;
$special_case = !empty($_POST['specialCase']) ? $_POST['specialCase'] : null;
$duration = !empty($_POST['duration']) ? $_POST['duration'] : null;
$amount = $_POST['amount'];

$stmt = $conn->prepare("INSERT INTO remuneration_rates (paper_type, course_type, al_id, special_case, duration, amount) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssissd", $paper_type, $course_type, $al_id, $special_case, $duration, $amount);
$stmt->execute();

echo "success";

$stmt->close();
$conn->close();
?>