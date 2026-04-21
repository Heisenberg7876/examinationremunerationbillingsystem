<?php
include 'db.php';

// Get filter parameters
$paper_setter = isset($_GET['paper_setter']) && $_GET['paper_setter'] === '1' ? true : false;
// $paper_setter_id = isset($_GET['examiner_id']) ? (int)$_GET['examiner_id'] : 'all';
$paper_setter_id = isset($_GET['examiner_id']) ? $_GET['examiner_id'] : 'all';
$exam_season = isset($_GET['exam_season']) ? $_GET['exam_season'] : 'all';
$exam_year = isset($_GET['exam_year']) ? $_GET['exam_year'] : 'all';

// Handle paper setter dropdown population
if ($paper_setter) {
    $stmt = $conn->prepare("SELECT MIN(ps.id) AS examiner_id, ps.paper_setter , ps.email, COUNT(DISTINCT ps.id) AS num_ass
                            FROM remunerations r
                            JOIN paper_setters ps ON ps.id = r.examiner_id 
                            GROUP BY ps.paper_setter, ps.email
                            ORDER BY ps.paper_setter");
    if (!$stmt) {
        echo json_encode(['success' => false, 'error' => 'Query preparation failed']);
        $conn->close();
        exit;
    }
    $stmt->execute();
    $result = $stmt->get_result();

    $paper_setters = [];
    while ($row = $result->fetch_assoc()) {
        $paper_setters[] = $row;
    }

    echo json_encode($paper_setters);
    $stmt->close();
    $conn->close();
    exit;
}

// Handle report data with filters
$query = "SELECT ps.paper_setter, r.exam_year, r.exam_season, r.paper_set, r.remuneration,
                 f.faculty_name, al.level_name, ms.major_subject_name,
                 s.subject_code, s.subject_name, rr.paper_type, y.year_name, sm.semester_number, c.class_name
          FROM remunerations r
          JOIN paper_setters ps ON r.examiner_id = ps.id
          JOIN remuneration_rates rr ON r.rem_rates_id = rr.id
          LEFT JOIN subjects s ON r.subject_id = s.id
          LEFT JOIN academic_level al ON rr.al_id = al.id
          LEFT JOIN years y ON s.year_id = y.id
          LEFT JOIN semesters sm ON s.semester_id = sm.id
          LEFT JOIN major_subjects ms ON s.major_subject_id = ms.id
          LEFT JOIN classes c ON s.class_id = c.id
          LEFT JOIN faculties f ON s.faculty_id = f.id"; //three lines from this left join
$conditions = [];
$params = [];
$types = '';

// if ($paper_setter_id !== 'all') {
//     $conditions[] = "r.examiner_id = ?";
//     $params[] = $paper_setter_id;
//     $types .= 'i';
// }

if ($paper_setter_id !== 'all') {
    $conditions[] = "ps.paper_setter = ? OR ps.email = ?";
    $params[] = $paper_setter_id;
    $params[] = $paper_setter_id;
    $types .= 'ss';
}


if ($exam_season !== 'all') {
    $conditions[] = "r.exam_season = ?";
    $params[] = $exam_season;
    $types .= 's';
}
if ($exam_year !== 'all') {
    $conditions[] = "r.exam_year = ?";
    $params[] = $exam_year;
    $types .= 's';
}

if (!empty($conditions)) {
    $query .= " WHERE " . implode(" AND ", $conditions);
}
$query .= " ORDER BY r.exam_year DESC, r.exam_season, s.subject_code";

$stmt = $conn->prepare($query);
if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Query preparation failed']);
    $conn->close();
    exit;
}

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$records = [];
while ($row = $result->fetch_assoc()) {
    $records[] = [
        'paper_setter' => $row['paper_setter'],
        'exam_year' => $row['exam_year'],
        'exam_season' => $row['exam_season'],
        'paper_set' => $row['paper_set'],
        'remuneration' => $row['remuneration'],
        'faculty_name' => $row['faculty_name'],
        'level_name' => $row['level_name'],
        'major_subject_name' => $row['major_subject_name'],
        'subject_code' => $row['subject_code'],
        'subject_name' => $row['subject_name'],
        'paper_type' => $row['paper_type'],
        'year_name' => $row['year_name'],
        'semester_number' => $row['semester_number'],
        'class_name' => $row['class_name']
    ];
}

echo json_encode($records);

$stmt->close();
$conn->close();
?>