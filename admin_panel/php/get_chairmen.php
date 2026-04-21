<?php
include 'db.php';
$result = $conn->query("SELECT c.id, c.name, c.department, c.email, c.phone, c.bank_account_number, c.ifsc_code, c.college_name, cl.class_name, y.year_name, al.level_name
                        FROM chairmen c
                        JOIN classes cl ON c.class_id = cl.id
                        JOIN years y ON c.year_id = y.id
                        JOIN academic_level al ON c.al_id = al.id");
$chairmen = [];
while ($row = $result->fetch_assoc()) {
    $chairmen[] = $row;
}
echo json_encode($chairmen);
$conn->close();
?>