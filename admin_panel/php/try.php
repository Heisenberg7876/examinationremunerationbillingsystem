<?php
include 'db.php';

$name = $_POST['name'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$bank_account_number = $_POST['bank_account_number'];
$ifsc_code = $_POST['ifsc_code'];
$chairman_id = (int) $_POST['chairman_id'];
$college_name = $_POST['college_name'];


// Fetch class_id and year_id from chairmen
$stmt = $conn->prepare("SELECT class_id, year_id, al_id FROM chairmen WHERE id = ?");
$stmt->bind_param("i", $chairman_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid chairman ID']);
    $stmt->close();
    $conn->close();
    exit;
}
$chairman = $result->fetch_assoc();
$class_id = $chairman['class_id'];
$year_id = $chairman['year_id'];
$al_id = $chairman['al_id'];
$stmt->close();

$chekc_stmt = $conn->prepare('SELECT email, chairman_id, class_id, year_id, al_id FROM paper_setters WHERE email=? AND chairman_id=? AND class_id=? AND year_id=? AND al_id=?');
$check_stmt->bind_param('siiii', $email, $chairman_id, $class_id, $year_id, $al_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();
if ($check_result->num_rows > 0) {
    echo json_encode(['success' => false, 'error' => 'Paper setter already exists!']);
    $check_stmt->close();
    $conn->close();
    exit;
}
$check_stmt->close();

// Insert paper setter
$stmt = $conn->prepare("INSERT INTO paper_setters (paper_setter, email, phone, bank_account_number, ifsc_code, chairman_id, college_name, class_id, year_id, al_id, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paper Setter')");
$stmt->bind_param("sssssisiii", $name, $email, $phone, $bank_account_number, $ifsc_code, $chairman_id, $college_name, $class_id, $year_id, $al_id);
if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Failed to add paper setter']);
}
$stmt->close();
$conn->close();
?>