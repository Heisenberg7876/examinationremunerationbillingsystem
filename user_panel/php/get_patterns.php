<?php
include 'db.php';

$result = $conn->query("SELECT id, pattern_name FROM patterns");
$patterns = [];
while ($row = $result->fetch_assoc()) {
    $patterns[] = $row;
}
echo json_encode($patterns);

$conn->close();
?>