# 💼 Examination Remuneration Billing System

## 📌 Overview

The **Examination Remuneration Billing System** is a web-based application designed to automate and manage the remuneration process for examiners in academic institutions.

This system reduces manual workload, minimizes errors, and provides a structured way to calculate and generate remuneration reports.

---

## 🎯 Key Objectives

* Automate examiner payment calculations
* Maintain centralized academic data
* Improve accuracy and efficiency
* Provide easy-to-use admin and user interfaces

---

## 🚀 Features

### 👨‍💼 Admin Panel

* Add and manage:

  * Chairman
  * Paper setters
  * Subjects
  * Classes & semesters
* Set remuneration rates
* Manage academic structure

### 👨‍🏫 User Panel

* Add examiner details
* Assign subjects
* Calculate remuneration
* Export data (CSV format)
* View generated reports

---

## 🛠️ Tech Stack

| Category     | Technology                 |
| ------------ | -------------------------- |
| Frontend     | HTML, CSS, JavaScript      |
| Backend      | PHP                        |
| Database     | MySQL                      |
| Architecture | Multi-panel (Admin + User) |

---

## 📂 Project Structure

```
examinationremunerationbillingsystem/
│
├── admin_panel/
│   ├── assets/
│   ├── dashboard.html
│   ├── index.html
│   └── php/
│
├── user_panel/
│   ├── assets/
│   ├── index.html
│   └── php/
│
└── README.md
```

---

## ⚙️ Installation & Setup

### 🔹 Step 1: Clone Repository

```
git clone https://github.com/Heisenberg7876/examinationremunerationbillingsystem.git
```

### 🔹 Step 2: Move to XAMPP / WAMP

* Copy project folder to:

  ```
  htdocs/   (for XAMPP)
  ```

### 🔹 Step 3: Setup Database

1. Open phpMyAdmin
2. Create a new database
3. Import `.sql` file (if available)
4. Update DB credentials in:

   ```
   admin_panel/php/db.php
   user_panel/php/db.php
   ```

---

### 🔹 Step 4: Run Project

Open in browser:

```
http://localhost/examinationremunerationbillingsystem/admin_panel/
http://localhost/examinationremunerationbillingsystem/user_panel/
```

---

## 📸 Screenshots

(Add screenshots here)

-dashboard
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/e8e0e0a4-1d93-4ce2-ba90-c7a2cb3041e6" />

-admin-panel
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/6202ce8b-45c5-498a-89e6-6518cd3c9565" />

-user-panel
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/b3fdb6ad-a7d8-478e-945b-4a2433febb87" />

---

## 📊 System Workflow

1. Admin sets:

   * Subjects
   * Rates
   * Academic structure

2. User:

   * Adds examiner
   * Assigns work
   * System calculates remuneration

3. Output:

   * Reports
   * Export (CSV)

---

## 🔐 Security Notes

* Database credentials should not be exposed
* Use `.env` in production
* Sanitize inputs to prevent SQL injection

---

## 📈 Future Enhancements

* 🔐 Login Authentication System
* 📄 PDF Bill Generation
* 📊 Dashboard Analytics
* 🌐 Online Deployment
* 📱 Responsive UI

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork and improve the system.

---

## 📜 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Author

**Abhijeet Kulkarni**
GitHub: https://github.com/Heisenberg7876

---
