<?php
include 'db.php';

$faculty_name = $_POST['faculty'];
$level_id = (int) $_POST['level'];
$year_id = (int) $_POST['year_id'];
$class_name = $_POST['class'];
$major_subject_name = $_POST['subject'];
$semester_id = (int) $_POST['semester'];
$subject_code = strtoupper($_POST['subjectCode']);
$subject_title = $_POST['subjectTitle'];

$check_stmt = $conn->prepare("SELECT subject_code FROM subjects WHERE subject_code = ?");
$check_stmt->bind_param('s', $subject_code);
$check_stmt->execute();
$check_result = $check_stmt->get_result();
if ($check_result->num_rows > 0) {
    echo json_encode(['success' => false, 'error' => 'Subject already exists!']);
    $check_stmt->close();
    $conn->close();
    exit;
} else {
     $check_stmt->close();
    // Validate level_id
    $level_stmt = $conn->prepare("SELECT level_name FROM academic_level WHERE id = ?");
    $level_stmt->bind_param("i", $level_id);
    $level_stmt->execute();
    $level_result = $level_stmt->get_result();
    if ($level_result->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid academic level']);
        $level_stmt->close();
        $conn->close();
        exit;
    }
    $level_name = $level_result->fetch_assoc()['level_name'];
    $level_stmt->close();

    // Validate year_id
    $stmt = $conn->prepare("SELECT id FROM years WHERE id = ?");
    $stmt->bind_param("i", $year_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid year']);
        $stmt->close();
        $conn->close();
        exit;
    }
    $stmt->close();

    // Get or insert faculty
    $faculty_stmt = $conn->prepare("SELECT id FROM faculties WHERE faculty_name = ?");
    $faculty_stmt->bind_param("s", $faculty_name);
    $faculty_stmt->execute();
    $faculty_result = $faculty_stmt->get_result();
    if ($faculty_result->num_rows > 0) {
        $faculty_id = $faculty_result->fetch_assoc()['id'];
    } else {
        $insert_faculty = $conn->prepare("INSERT INTO faculties (faculty_name) VALUES (?)");
        $insert_faculty->bind_param("s", $faculty_name);
        $insert_faculty->execute();
        $faculty_id = $conn->insert_id;
        $insert_faculty->close();
    }
    $faculty_stmt->close();

    // Get or insert class
    $class_stmt = $conn->prepare("SELECT id FROM classes WHERE class_name = ? AND faculty_id = ?");
    $class_stmt->bind_param("si", $class_name, $faculty_id);
    $class_stmt->execute();
    $class_result = $class_stmt->get_result();
    if ($class_result->num_rows > 0) {
        $class_id = $class_result->fetch_assoc()['id'];
    } else {
        // Ensure class_name includes UG/PG based on level_name
        $full_class_name = $class_name;
        $insert_class = $conn->prepare("INSERT INTO classes (class_name, faculty_id) VALUES (?, ?)");
        $insert_class->bind_param("si", $full_class_name, $faculty_id);
        $insert_class->execute();
        $class_id = $conn->insert_id;
        $insert_class->close();
    }
    $class_stmt->close();

    // Get or insert major subject
    $major_stmt = $conn->prepare("SELECT id FROM major_subjects WHERE major_subject_name = ? AND class_id = ?");
    $major_stmt->bind_param("si", $major_subject_name, $class_id);
    $major_stmt->execute();
    $major_result = $major_stmt->get_result();
    if ($major_result->num_rows > 0) {
        $major_subject_id = $major_result->fetch_assoc()['id'];
    } else {
        $insert_major = $conn->prepare("INSERT INTO major_subjects (major_subject_name, class_id) VALUES (?, ?)");
        $insert_major->bind_param("si", $major_subject_name, $class_id);
        $insert_major->execute();
        $major_subject_id = $conn->insert_id;
        $insert_major->close();
    }
    $major_stmt->close();

    // Insert subject
    $subject_stmt = $conn->prepare("INSERT INTO subjects (subject_code, subject_name, major_subject_id, semester_id, class_id, faculty_id, year_id, al_id) VALUES (?, ?, ?, ?, ?, ?, ?,?)");
    $subject_stmt->bind_param("ssiiiiii", $subject_code, $subject_title, $major_subject_id, $semester_id, $class_id, $faculty_id, $year_id, $level_id);
    if ($subject_stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to add subject']);
    }
    $subject_stmt->close();
    $conn->close();
}
?>