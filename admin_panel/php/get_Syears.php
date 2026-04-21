<?php
include 'db.php';

$level = isset($_GET['level']) ? (int)$_GET['level'] : '';

$query = "SELECT id, year_name FROM years";
if ($level === 2) {
    $query .= " WHERE year_name IN ('FY', 'SY')";
}

$result = $conn->query($query);
$years = [];
while ($row = $result->fetch_assoc()) {
    $years[] = $row;
}

echo json_encode($years);

$conn->close();
?>