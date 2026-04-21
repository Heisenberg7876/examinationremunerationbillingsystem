<?php
include 'db.php';

$name = $_POST['name'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$bank_account_number = $_POST['bank_account_number'];
$ifsc_code = $_POST['ifsc_code'];
$department = $_POST['department'];
$college_name = $_POST['college_name'];
$class_name = $_POST['class'];
$al_id = (int) $_POST['al_id'];
$year_id = (int) $_POST['year_id'];

$available_chairman = $conn->prepare('SELECT department, year_id, al_id FROM chairmen WHERE department=? AND year_id=? AND al_id=?');
$available_chairman->bind_param('sii', $department, $year_id, $al_id);
$available_chairman->execute();
$available_cm_result = $available_chairman->get_result();
if ($available_cm_result->num_rows > 0) {
    echo json_encode(['success' => false, 'error' => 'Chairman already exists']);
    $available_chairman->close();
    $conn->close();
    exit;
} else {
    $available_chairman->close();
    // Validate class_name and get class_id
    $stmt = $conn->prepare("SELECT id FROM classes WHERE class_name = ?");
    $stmt->bind_param("s", $class_name);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid class name']);
        $stmt->close();
        $conn->close();
        exit;
    }
    $class_id = $result->fetch_assoc()['id'];
    $stmt->close();

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

    // Insert chairman
    $stmt = $conn->prepare("INSERT INTO chairmen (name, email, phone, bank_account_number, ifsc_code, department, college_name, class_id, year_id, al_id, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Chairman')");
    $stmt->bind_param("sssssssiii", $name, $email, $phone, $bank_account_number, $ifsc_code, $department, $college_name, $class_id, $year_id, $al_id);
    if ($stmt->execute()) {
        $chairman_id = $conn->insert_id;

        $chairM_asPS_stmt = $conn->prepare("INSERT INTO paper_setters (paper_setter, email, phone, bank_account_number, ifsc_code, chairman_id, college_name, class_id, year_id, al_id, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Paper Setter')");
        $chairM_asPS_stmt->bind_param("sssssisiii", $name, $email, $phone, $bank_account_number, $ifsc_code, $chairman_id, $college_name, $class_id, $year_id, $al_id);
        if ($chairM_asPS_stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to add chairman as paper setter']);
        }
        $chairM_asPS_stmt->close();

    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to add chairman']);
    }
    $stmt->close();
    $conn->close();
}
?>