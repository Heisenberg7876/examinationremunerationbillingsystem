<?php
include 'db.php';

$level_id = isset($_GET['level_id']) ? (int)$_GET['level_id'] : 0;

$query = "SELECT id, year_name FROM years";
if ($level_id) {
    $level_stmt = $conn->prepare("SELECT level_name FROM academic_level WHERE id = ?");
    $level_stmt->bind_param("i", $level_id);
    $level_stmt->execute();
    $level_result = $level_stmt->get_result();
    if ($level_result->num_rows > 0 && $level_result->fetch_assoc()['level_name'] === 'PG') {
        $query .= " WHERE year_name IN ('FY', 'SY')";
    }
    $level_stmt->close();
}

$result = $conn->query($query);
$years = [];
while ($row = $result->fetch_assoc()) {
    $years[] = $row;
}

echo json_encode($years);

$conn->close();
?>