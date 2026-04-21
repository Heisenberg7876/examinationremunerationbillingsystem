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
//from this
$dup_query = "SELECT id FROM paper_setters WHERE paper_setter = '$name' AND email = '$email' AND chairman_id = '$chairman_id'";
$dup_result = mysqli_query($conn, $dup_query);

if (!$dup_result) {
    echo json_encode(['success' => false, 'error' => 'Duplicate check failed']);
    exit;
}

if (mysqli_num_rows($dup_result) > 0) {
    echo json_encode(['success' => false, 'error' => 'Duplicate assignment']);
    exit;
}
//to this -> new code

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