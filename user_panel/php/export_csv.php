<?php
include 'db.php';

$paper_setter_id = isset($_GET['paper_setter_id']) ? (int) $_GET['paper_setter_id'] : 'all';
$exam_year = isset($_GET['exam_year']) ? $_GET['exam_year'] : 'all';
$exam_season = isset($_GET['exam_season']) ? $_GET['exam_season'] : 'all';
$timeStamp = time();

//query
$query = "SELECT 'PAPER SETTER', 'SUBJECT CODE', 'SUBJECT NAME', 'FACULTY', 'ACADEMIC LEVEL', 'YEAR', 'CLASS', 'PRINCIPAL SUBJECT', 'SEM', 'PAPER SET', 'EXAM YEAR', 'SEASON', 'PAPER TYPE', 'EXAM DURATION', 'AMOUNT' UNION ALL
            SELECT ps.paper_setter, s.subject_code, s.subject_name, f.faculty_name, al.level_name, y.year_name, cl.class_name, m.major_subject_name, s.semester_id, r.paper_set, r.exam_year, r.exam_season, rr.paper_type, rr.duration, rr.amount FROM remunerations r
            JOIN paper_setters ps ON r.examiner_id = ps.id
            JOIN subjects s ON r.subject_id = s.id
            JOIN major_subjects m ON s.major_subject_id = m.id
            JOIN classes cl ON s.class_id = cl.id
            JOIN faculties f ON s.faculty_id = f.id
            JOIN years y ON s.year_id = y.id
            JOIN remuneration_rates rr ON r.rem_rates_id = rr.id
            JOIN academic_level al ON rr.al_id = al.id";

//where conditions
$conditions = [];
$params = [];
$types = '';

if ($paper_setter_id !== 'all') {
    $conditions[] = "r.examiner_id = ?";
    $params[] = $paper_setter_id;
    $types .= 'i';
}
if ($exam_year !== 'all') {
    $conditions[] = "r.exam_year = ?";
    $params[] = $exam_year;
    $types .= 's';
}
if ($exam_season !== 'all') {
    $conditions[] = "r.exam_season = ?";
    $params[] = $exam_season;
    $types .= 's';
}

if (!empty($conditions)) {
    $query .= " WHERE " . implode(" AND ", $conditions);
}

// output path
$output_file = 'exam_db/tmp/rem'.$timeStamp.'.csv';
$query .= " INTO OUTFILE '$output_file' 
            FIELDS TERMINATED BY ',' ESCAPED BY ''
            OPTIONALLY ENCLOSED BY '\"' 
            LINES TERMINATED BY '\r\n'";

// Prep and exec query
$stmt = $conn->prepare($query);
if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Query preparation failed: ' . $conn->error]);
    $conn->close();
    exit;
}

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'file' => $output_file]);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to export CSV: ' . $stmt->error]);
}


$stmt->close();
$conn->close();
?>