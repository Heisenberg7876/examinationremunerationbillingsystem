<?php
include 'config.php';

$al_id = isset($_GET['al_id']) ? mysqli_real_escape_string($conn, $_GET['al_id']) : '';
$duration = isset($_GET['duration']) ? mysqli_real_escape_string($conn, $_GET['duration']) : '';

if (empty($al_id) || empty($duration)) {
    echo json_encode(['success' => false, 'error' => 'Missing required parameters: al_id and duration']);
    die();
}

// Fetch course_type from academic_level
$query = "SELECT course_type FROM academic_level WHERE id = '$al_id'";
$result = mysqli_query($conn, $query);

if (!$result || mysqli_num_rows($result) == 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid academic level ID']);
    die();
}

$row = mysqli_fetch_assoc($result);
$course_type = $row['course_type'];

// Fetch rates
$query = "SELECT paper_type, amount FROM remuneration_rates WHERE al_id = '$al_id' AND duration = '$duration' AND course_type = '$course_type'";
$result = mysqli_query($conn, $query);

if (!$result) {
    echo json_encode(['success' => false, 'error' => 'Failed to fetch rates: ' . mysqli_error($conn)]);
    die();
}

$rates = [];
while ($row = mysqli_fetch_assoc($result)) {
    $rates[] = $row;
}

echo json_encode(['success' => true, 'rates' => $rates]);

mysqli_close($conn);
?>