<?php
include 'db.php';

$year_id = isset($_GET['year']) ? (int)$_GET['year'] : 0;

$semesters = [];
if ($year_id) {
    $year_stmt = $conn->prepare("SELECT year_name FROM years WHERE id = ?");
    $year_stmt->bind_param("i", $year_id);
    $year_stmt->execute();
    $year = $year_stmt->get_result()->fetch_assoc()['year_name'];
    $year_stmt->close();

    $semester_numbers = [];
    if ($year === 'FY') {
        $semester_numbers = [1, 2];
    } elseif ($year === 'SY') {
        $semester_numbers = [3, 4];
    } elseif ($year === 'TY') {
        $semester_numbers = [5, 6];
    }

    $stmt = $conn->prepare("SELECT id, semester_number FROM semesters WHERE semester_number IN (" . implode(',', array_fill(0, count($semester_numbers), '?')) . ")");
    $stmt->bind_param(str_repeat('i', count($semester_numbers)), ...$semester_numbers);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {
        $semesters[] = $row;
    }
    $stmt->close();
}

echo json_encode($semesters);

$conn->close();
?>