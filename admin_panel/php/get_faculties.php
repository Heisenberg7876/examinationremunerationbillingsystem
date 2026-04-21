<?php
include 'db.php';

$result = $conn->query("SELECT id, faculty_name FROM faculties");
$faculties = [];
while ($row = $result->fetch_assoc()) {
    $faculties[] = $row;
}

echo json_encode($faculties);

$conn->close();
?>