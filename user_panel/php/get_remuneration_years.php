<?php
include 'db.php';

$query = "SELECT DISTINCT exam_year FROM remunerations ORDER BY exam_year DESC";
$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode(['success' => false, 'error' => 'Query failed: ' . mysqli_error($conn)]);
    die();
}

$years = [];
while ($row = mysqli_fetch_assoc($result)) {
    $years[] = $row;
}

echo json_encode($years);

mysqli_close($conn);
?>