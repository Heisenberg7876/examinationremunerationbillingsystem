<?php
include 'db.php';

$examiner_id = isset($_POST['examiner_id']) ? (int) $_POST['examiner_id'] : '';
$subject_id = isset($_POST['subject_id']) ? (int) $_POST['subject_id'] : '';
$academic_level_id = isset($_POST['level_name']) ? $_POST['level_name'] : '';
$year = isset($_POST['year']) ? $_POST['year'] : '';
$exam_period = isset($_POST['exam_period']) ? $_POST['exam_period'] : '';
$duration = isset($_POST['exam_duration']) ? $_POST['exam_duration'] : '';
$paper_sets = isset($_POST['paper_sets']) && is_array($_POST['paper_sets']) ? $_POST['paper_sets'] : [];
$paper_types = isset($_POST['paper_type']) && is_array($_POST['paper_type']) ? $_POST['paper_type'] : [];

if (empty($examiner_id) || empty($subject_id) || empty($academic_level_id) || empty($year) || empty($exam_period) || empty($duration) || empty($paper_sets) || empty($paper_types)) {
    echo json_encode(['success' => false, 'error' => 'Missing required form data']);
    die();
}

if (!in_array($exam_period, ['winter', 'summer'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid exam period']);
    die();
}

if (!in_array($duration, ['1.5 hrs', '2 hrs', '3 hrs'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid exam duration']);
    die();
}

foreach ($paper_sets as $set) {
    if (!in_array($set, ['A', 'B', 'C'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid paper set: ' . htmlspecialchars($set)]);
        die();
    }
}

foreach ($paper_types as $type) {
    if (!in_array($type, ['theory', 'model', 'translation'])) {
        echo json_encode(['success' => false, 'error' => 'Invalid paper type: ' . htmlspecialchars($type)]);
        die();
    }
}

// Fetch level_name from academic_level
$query = "SELECT level_name FROM academic_level WHERE id = '$academic_level_id'";
$result = mysqli_query($conn, $query);

if (!$result || mysqli_num_rows($result) == 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid academic level ID']);
    die();
}

$row = mysqli_fetch_assoc($result);
$level_name = $row['level_name'];

$success_count = 0;
$total_records = count($paper_types) * count($paper_sets);
$errors = [];

foreach ($paper_types as $paper_type) {
    foreach ($paper_sets as $paper_set) {
        $paper_type_esc = $paper_type;
        $paper_set_esc = $paper_set;

        //IF paper type =="TRANSLATIOIN"
        if ($paper_type_esc == 'translation') {
            // Fetch ratE
            $query = "SELECT id, amount FROM remuneration_rates WHERE paper_type = '$paper_type_esc' AND al_id = '$academic_level_id'";
            $result = mysqli_query($conn, $query);
            if (!$result) {
                $errors[] = "Query failed for paper_type: $paper_type_esc" . mysqli_error($conn);
                continue;
            }

            if (mysqli_num_rows($result) == 0) {
                $errors[] = "No rate found for paper_type: $paper_type_esc, level_name: $level_name";
                continue;
            }

            $rate = mysqli_fetch_assoc($result);
            $rem_rates_id = $rate['id'];
            $remuneration = $rate['amount'];

            // Check duplicates
            $query = "SELECT id FROM remunerations WHERE subject_id = '$subject_id' AND paper_set = '$paper_set_esc' AND exam_year = '$year' AND exam_season = '$exam_period' AND rem_rates_id = '$rem_rates_id'";
            $result = mysqli_query($conn, $query);

            if (!$result) {
                $errors[] = "Duplicate check failed: " . mysqli_error($conn);
                continue;
            }

            if (mysqli_num_rows($result) > 0) {
                $errors[] = "Duplicate assignment for paper_type: $paper_type_esc, paper_set: $paper_set_esc";
                continue;
            }

            // Insert into remunerations
            $query = "INSERT INTO remunerations (examiner_id, subject_id, rem_rates_id, paper_set, exam_year, exam_season, remuneration) VALUES ('$examiner_id', '$subject_id', '$rem_rates_id', '$paper_set_esc', '$year', '$exam_period', '$remuneration')";
            $result = mysqli_query($conn, $query);

        }//else paper type =="THEORY OR MODEL"
        //Fetch rate
        $query = "SELECT id, amount FROM remuneration_rates WHERE paper_type = '$paper_type_esc' AND al_id = '$academic_level_id' AND duration = '$duration'";
        $result = mysqli_query($conn, $query);

        if (!$result) {
            $errors[] = "Query failed for paper_type: $paper_type_esc, duration: $duration: " . mysqli_error($conn);
            continue;
        }

        if (mysqli_num_rows($result) == 0) {
            $errors[] = "No rate found for paper_type: $paper_type_esc, level_name: $level_name, duration: $duration";
            continue;
        }

        $rate = mysqli_fetch_assoc($result);
        $rem_rates_id = $rate['id'];
        $remuneration = $rate['amount'];

        // Check duplicates
        $query = "SELECT id FROM remunerations WHERE subject_id = '$subject_id' AND paper_set = '$paper_set_esc' AND exam_year = '$year' AND exam_season = '$exam_period' AND rem_rates_id = '$rem_rates_id'";
        $result = mysqli_query($conn, $query);

        if (!$result) {
            $errors[] = "Duplicate check failed: " . mysqli_error($conn);
            continue;
        }

        if (mysqli_num_rows($result) > 0) {
            $errors[] = "Duplicate assignment for paper_type: $paper_type_esc, paper_set: $paper_set_esc";
            continue;
        }

        // Insert into remunerations
        $query = "INSERT INTO remunerations (examiner_id, subject_id, rem_rates_id, paper_set, exam_year, exam_season, remuneration) VALUES ('$examiner_id', '$subject_id', '$rem_rates_id', '$paper_set_esc', '$year', '$exam_period', '$remuneration')";
        $result = mysqli_query($conn, $query);

        if ($result) {
            $success_count++;
        } else {
            $errors[] = "Insert failed for paper_type: $paper_type_esc, paper_set: $paper_set_esc: " . mysqli_error($conn);
        }
    }
}

$chairman_allowance_added = false;
$allowance_amount = 0;

// First, get the paper setter's details (name, class_id, year_id, al_id)
$get_ps_stmt = $conn->prepare("SELECT paper_setter, class_id, year_id, al_id FROM paper_setters WHERE id = ?");
$get_ps_stmt->bind_param("i", $examiner_id);
$get_ps_stmt->execute();
$ps_result = $get_ps_stmt->get_result();

if ($ps_result->num_rows === 0) {
    // Paper setter not found — shouldn't happen, but safe exit
    $get_ps_stmt->close();
} else {
    $ps_row = $ps_result->fetch_assoc();
    $ps_name = $ps_row['paper_setter'];
    $ps_class_id = $ps_row['class_id'];
    $ps_year_id = $ps_row['year_id'];
    $ps_al_id = $ps_row['al_id'];

    // Now check if this exact person is also a chairman
    $chairman_stmt = $conn->prepare("SELECT id FROM chairmen 
                                    WHERE name = ? 
                                      AND class_id = ? 
                                      AND year_id = ? 
                                      AND al_id = ?");
    $chairman_stmt->bind_param("siii", $ps_name, $ps_class_id, $ps_year_id, $ps_al_id);
    $chairman_stmt->execute();
    $chairman_result = $chairman_stmt->get_result();

    if ($chairman_result->num_rows > 0) {
        // Count how many paper setters work under this chairman
        $count_stmt = $conn->prepare("SELECT COUNT(*) as count FROM paper_setters WHERE chairman_id = ?");
        $count_stmt->bind_param("i", $examiner_id);
        $count_stmt->execute();
        $count_result = $count_stmt->get_result();
        $count_row = $count_result->fetch_assoc();
        $under_count = $count_row['count'];
        $count_stmt->close();

        // Determine duration category
        $duration_category = '10 and above';
        if ($under_count <= 5) {
            $duration_category = '1-5';
        } elseif ($under_count <= 10) {
            $duration_category = '6-10';
        }

        // Get chairman allowance rate
        $allowance_stmt = $conn->prepare("SELECT id, amount FROM remuneration_rates 
                                      WHERE paper_type = 'chairman' 
                                      AND al_id = ? 
                                      AND duration = ?");
        $allowance_stmt->bind_param("is", $academic_level_id, $duration_category);
        $allowance_stmt->execute();
        $allowance_result = $allowance_stmt->get_result();

        if ($allowance_result->num_rows > 0) {
            $allowance_row = $allowance_result->fetch_assoc();
            $allowance_amount = $allowance_row['amount'];
            $ch_rem_id = $allowance_row['id'];
            $Nullsubject_id = 0;

            // Insert chairman allowance as a separate record
            $allowance_insert = $conn->prepare("INSERT INTO remunerations 
            (examiner_id, subject_id, rem_rates_id, paper_set, exam_year, exam_season, remuneration) 
            VALUES (?, ?, ?, '-', ?, ?, ?)");
            $allowance_insert->bind_param("iiissd", $examiner_id, $Nullsubject_id, $ch_rem_id, $year, $exam_period, $allowance_amount);
            if ($allowance_insert->execute()) {
                $success_count++;
                $chairman_allowance_added = true;
            }
            $allowance_insert->close();
        }
        $allowance_stmt->close();
    }
    $chairman_stmt->close();
}
$get_ps_stmt->close();

if ($success_count > 0) {
    $msg = "Successfully inserted $success_count record(s).";
    if ($chairman_allowance_added) {
        $msg .= " Chairman allowance of ₹$allowance_amount added.";
    }
    if (!empty($errors)) {
        $msg .= " Warnings: " . implode('; ', $errors);
    }
    echo json_encode(['success' => true, 'message' => $msg]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'No records inserted. Errors: ' . (count($errors) > 0 ? implode(', ', $errors) : 'Unknown error')
    ]);
}

mysqli_close($conn);
?>