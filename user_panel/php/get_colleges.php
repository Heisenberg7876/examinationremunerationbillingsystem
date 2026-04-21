<?php
include 'db.php';

$result = $conn->query("SELECT id, college_name FROM colleges");
$colleges = [];
while ($row = $result->fetch_assoc()) {
    $colleges[] = $row;
}
echo json_encode($colleges);

$conn->close();
?>