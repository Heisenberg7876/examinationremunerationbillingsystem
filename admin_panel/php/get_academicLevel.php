<?php
include 'db.php';

$result = $conn->query("SELECT id, level_name FROM academic_level");
$academicLevel = [];
while ($row = $result->fetch_assoc()) {
    $academicLevel[] = $row;
}
echo json_encode($academicLevel);

$conn->close();
?>