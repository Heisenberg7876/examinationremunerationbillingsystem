<?php
include 'db.php';

$faculty = isset($_GET['faculty']) ? $_GET['faculty'] : 'all';
$level = isset($_GET['level']) ? $_GET['level'] : 'all';
$year = isset($_GET['year']) ? $_GET['year'] : 'all';
$class = isset($_GET['class']) ? $_GET['class'] : 'all';
$subject = isset($_GET['subject']) ? $_GET['subject'] : 'all';
$semester = isset($_GET['semester']) ? $_GET['semester'] : 'all';

$query = "SELECT s.id, s.subject_code, s.subject_name, y.year_name, f.faculty_name, c.class_name, m.major_subject_name, sm.semester_number, al.level_name
          FROM subjects s
          JOIN faculties f ON s.faculty_id = f.id
          JOIN classes c ON s.class_id = c.id
          JOIN major_subjects m ON s.major_subject_id = m.id
          JOIN semesters sm ON s.semester_id = sm.id
          JOIN years y ON s.year_id = y.id
          JOIN academic_level al ON s.al_id = al.id";
$conditions = [];
$params = [];
$types = '';

if ($faculty !== 'all') {
    $conditions[] = "f.faculty_name = ?";
    $params[] = $faculty;
    $types .= 's';
}
if ($level !== 'all') {
    $conditions[] = "al.level_name = ?";
    $params[] = $level;
    $types .= 's';
}
if ($year !== 'all') {
    $conditions[] = "y.year_name = ?";
    $params[] = $year;
    $types .= 's';
}
if ($class !== 'all') {
    $conditions[] = "c.class_name = ?";
    $params[] = $class;
    $types .= 's';
}
if ($subject !== 'all') {
    $conditions[] = "m.major_subject_name = ?";
    $params[] = $subject;
    $types .= 's';
}
if ($semester !== 'all') {
    $conditions[] = "sm.semester_number = ?";
    $params[] = $semester;
    $types .= 'i';
}

if (!empty($conditions)) {
    $query .= " WHERE " . implode(" AND ", $conditions);
}

$stmt = $conn->prepare($query);
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$result = $stmt->get_result();

$subjects = [];
while ($row = $result->fetch_assoc()) {
    $subjects[] = $row;
}

echo json_encode($subjects);

$stmt->close();
$conn->close();
?>