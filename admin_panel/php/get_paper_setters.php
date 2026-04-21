<?php
include 'db.php';
$chairman_id = isset($_GET['chairman_id']) ? $_GET['chairman_id'] : null;
$query = "SELECT ps.id, ps.paper_setter, ps.email, ps.phone, ps.bank_account_number, ps.ifsc_code, ps.chairman_id, c.name AS chairman_name, ps.college_name, cl.class_name, y.year_name 
          FROM paper_setters ps 
          LEFT JOIN chairmen c ON ps.chairman_id = c.id
          JOIN years y ON ps.year_id = y.id
          JOIN classes cl ON ps.class_id = cl.id";
if ($chairman_id) {
    $query .= " WHERE ps.chairman_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $chairman_id);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query($query);
}
$setters = [];
while ($row = $result->fetch_assoc()) {
    $setters[] = $row;
}
echo json_encode($setters);
if ($chairman_id) $stmt->close();
$conn->close();
?>