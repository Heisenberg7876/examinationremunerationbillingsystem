class ExaminationSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn, .dashboard-card').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.target.closest('.nav-btn, .dashboard-card').dataset.tab;
                this.switchTab(tab);
            });
        });

        // Cascading dropdowns
        //document.getElementById('pattern').addEventListener('change', () => this.loadFaculties());
        document.getElementById('faculty').addEventListener('change', () => this.updateClasses());
        document.getElementById('class').addEventListener('change', () => this.updateMajorSubjects());
        document.getElementById('majorSubject').addEventListener('change', () => this.updateSubjects());
        document.getElementById('sem').addEventListener('change', () => this.updateSubjects());

        // Forms
        document.getElementById('examinationForm').addEventListener('submit', (e) => this.addExaminer(e));
        //document.getElementById('remunerationForm').addEventListener('submit', (e) => this.saveRemuneration(e));
        // document.getElementById('examinerSelect').addEventListener('change', () => this.loadAssignedSubjects());
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector(`.nav-btn[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');

        // if (tabName === 'add-examiner') {
            //this.loadColleges();
            //this.loadPatterns();
            this.loadFaculties();
            this.loadAcademicLevel();
            this.updateClasses(); 
            // this.loadMajorSubjects();
            this.loadSemesters();
            this.loadSubjects();
            this.loadExaminers();
        // } else if (tabName === 'calculate-remuneration') {
            // this.loadExaminers();
            // this.loadAssignedSubjects();
            // this.updateCalculationsList();
        // } else if (tabName === 'view-reports') {
            // this.updateReport();
        // }
    }

    // async loadColleges() {
    //     try {
    //         const response = await fetch('php/get_colleges.php');
    //         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    //         const colleges = await response.json();
    //         const select = document.getElementById('collegeName');
    //         select.innerHTML = '<option value="">Select college</option>';
    //         colleges.forEach(c => {
    //             const opt = document.createElement('option');
    //             opt.value = c.id;
    //             opt.textContent = c.college_name;
    //             select.appendChild(opt);
    //         });
    //     } catch (error) {
    //         console.error('Error loading colleges:', error);
    //         this.showToast('Error loading colleges: ' + error.message, 'error');
    //     }
    // }

    // async loadPatterns() {
    //     try {
    //         const response = await fetch('php/get_patterns.php');
    //         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    //         const patterns = await response.json();
    //         const select = document.getElementById('pattern');
    //         select.innerHTML = '<option value="">Select pattern</option>';
    //         patterns.forEach(p => {
    //             const opt = document.createElement('option');
    //             opt.value = p.id;
    //             opt.textContent = p.pattern_name;
    //             select.appendChild(opt);
    //         });
    //         this.loadFaculties();
    //     } catch (error) {
    //         console.error('Error loading patterns:', error);
    //         this.showToast('Error loading patterns: ' + error.message, 'error');
    //     }
    // }

    async loadFaculties() {
        try {
            const response = await fetch('php/get_faculties.php');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const faculties = await response.json();
            const select = document.getElementById('faculty');
            select.innerHTML = '<option value="">Select faculty</option>';
            faculties.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.id;
                opt.textContent = f.faculty_name;
                select.appendChild(opt);
            });
            this.updateClasses();
        } catch (error) {
            console.error('Error loading faculties:', error);
            this.showToast('Error loading faculties: ' + error.message, 'error');
        }
    }

    async  loadAcademicLevel() {
        const response = await fetch('php/get_academicLevel.php');
        const academicLevel = await response.json();
        const select = document.getElementById('academicLevel');
        select.innerHTML = '<option value="">Select Subject</option>';

        academicLevel.forEach(aclev => {
            const opt = document.createElement('option');
            opt.value = aclev.id;
            opt.textContent = `${aclev.level_name}`;
            select.appendChild(opt);
        });
}

    async updateClasses() {
        try {
            const facultyId = document.getElementById('faculty').value;
            const response = await fetch(`php/get_classes.php?faculty_id=${facultyId || ''}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const classes = await response.json();
            const select = document.getElementById('class');
            select.innerHTML = '<option value="">Select class</option>';
            classes.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.class_name;
                select.appendChild(opt);
            });
            this.updateMajorSubjects();
        } catch (error) {
            console.error('Error loading classes:', error);
            this.showToast('Error loading classes: ' + error.message, 'error');
        }
    }

    async updateMajorSubjects() {
        try {
            const classId = document.getElementById('class').value;
            const response = await fetch(`php/get_major_subjects.php?class_id=${classId || ''}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const majorSubjects = await response.json();
            const select = document.getElementById('majorSubject');
            select.innerHTML = '<option value="">Select major subject</option>';
            majorSubjects.forEach(ms => {
                const opt = document.createElement('option');
                opt.value = ms.id;
                opt.textContent = ms.major_subject_name;
                select.appendChild(opt);
            });
            this.updateSubjects();
        } catch (error) {
            console.error('Error loading major subjects:', error);
            this.showToast('Error loading major subjects: ' + error.message, 'error');
        }
    }

    async loadSemesters() {
        try {
            const response = await fetch('php/get_semesters.php');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (!result.success && result.error) {
                throw new Error(result.error);
            }
            const semesters = result;
            if (!semesters || semesters.length === 0) {
                throw new Error('No semesters found in the database');
            }
            const select = document.getElementById('sem');
            select.innerHTML = '<option value="">Select semester</option>';
            semesters.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = `Semester ${s.semester_number}`;
                select.appendChild(opt);
            });
            this.updateSubjects();
        } catch (error) {
            console.error('Error loading semesters:', error);
            this.showToast('Error loading semesters: ' + error.message, 'error');
        }
    }

    async updateSubjects() {
        try {
            const majorSubjectId = document.getElementById('majorSubject').value;
            const semesterId = document.getElementById('sem').value;
            const classId = document.getElementById('class').value;
            const facultyId = document.getElementById('faculty').value;
            const response = await fetch(`php/get_subjects.php?major_subject_id=${majorSubjectId || ''}&semester_id=${semesterId || ''}&class_id=${classId || ''}&faculty_id=${facultyId || ''}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const subjects = await response.json();
            const select = document.getElementById('subject');
            select.innerHTML = '<option value="">Select subject</option>';
            subjects.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = `${s.subject_code} - ${s.subject_name}`;
                select.appendChild(opt);
            });
        } catch (error) {
            console.error('Error loading subjects:', error);
            this.showToast('Error loading subjects: ' + error.message, 'error');
        }
    }

    async loadExaminers() {
        const response = await fetch('php/get_examiners.php');
        const examiners = await response.json();
        const select1 = document.querySelector('select[name="examiner_id"]');
        // const select2 = document.getElementById('examinerSelect');
        select1.innerHTML = '<option value="">Select Examiner</option>';
        // select2.innerHTML = '<option value="">Select Examiner</option>';
        examiners.forEach(ex => {
            const opt1 = document.createElement('option');
            opt1.value = ex.id;
            opt1.textContent = ex.paper_setter;
            select1.appendChild(opt1);
            // const opt2 = opt1.cloneNode(true);
            // select2.appendChild(opt2);
        });
    }


    async loadAssignedSubjects() {
        try {
            const examinerId = document.getElementById('examinerSelect').value;
            const select = document.getElementById('assignedSubject');
            select.innerHTML = '<option value="">Select assigned subject</option>';
            if (!examinerId) return;
            const response = await fetch(`php/get_assigned_subjects.php?examiner_id=${examinerId}`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const subjects = await response.json();
            subjects.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.subject_id;
                opt.textContent = `${s.subject_code} - ${s.subject_name}`;
                select.appendChild(opt);
            });
        } catch (error) {
            console.error('Error loading assigned subjects:', error);
            this.showToast('Error loading assigned subjects: ' + error.message, 'error');
        }
    }

    async  loadSubjects() {
        const select = document.querySelector('select[name="subject_id"]');
        const response = await fetch('php/get_subjects.php');
        const subjects = await response.json();
        select.innerHTML = '<option value="">Select Subject</option>';
        const container = document.getElementById('added-subjects');
        container.innerHTML = '';
        subjects.forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub.id;
            opt.textContent = `${sub.subject_code} - ${sub.subject_title}`;
            select.appendChild(opt);
            
            // const div = document.createElement('div');
            // div.textContent = `${sub.subject_code} - ${sub.subject_title} `;
            // const btn = document.createElement('button');
            // btn.textContent = 'Calculate';
            // btn.addEventListener('click', () => calculateRemuneration(sub.id));
            // div.appendChild(btn);
            // container.appendChild(div);
        });
}

    async addExaminer(e) {
        e.preventDefault();
        try {
            const form = e.target;
            const formData = new FormData(form);
            const response = await fetch('php/add_examiner_for_calculation.php', { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                this.showToast('Paper setter assigned successfully!', 'success');
                form.reset();
                this.loadExaminers();
                this.updateSubjects();
            } else {
                this.showToast('Error: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error assigning paper setter:', error);
            this.showToast('Error assigning paper setter: ' + error.message, 'error');
        }
    }

    async saveRemuneration(e) {
        e.preventDefault();
        try {
            const form = e.target;
            const formData = new FormData(form);
            const response = await fetch('php/calculate_remuneration.php', { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                this.showToast('Remuneration saved successfully!', 'success');
                form.reset();
                this.loadAssignedSubjects();
                this.updateCalculationsList();
                this.updateReport();
            } else {
                this.showToast('Error: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error saving remuneration:', error);
            this.showToast('Error saving remuneration: ' + error.message, 'error');
        }
    }

    async updateCalculationsList() {
        try {
            const examinerId = document.getElementById('examinerSelect').value;
            const calculationsList = document.getElementById('calculationsList');
            const calculationsContainer = document.getElementById('calculationsContainer');
            if (!examinerId) {
                calculationsList.style.display = 'none';
                return;
            }
            const response = await fetch(`php/get_calculations.php?examiner_id=${examinerId}&limit=5`);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const calculations = await response.json();
            if (calculations.length === 0) {
                calculationsList.style.display = 'none';
                return;
            }
            calculationsList.style.display = 'block';
            const calculationsHTML = calculations.map(calc => `
                <div class="calculation-item">
                    <div class="calculation-info">
                        <h4>Remuneration: ₹${calc.remuneration.toFixed(2)}</h4>
                        <p>Subject: ${calc.subject_code} - ${calc.subject_name} • Set: ${calc.paper_set} • Duration: ${calc.exam_duration} hours</p>
                    </div>
                </div>
            `).join('');
            calculationsContainer.innerHTML = calculationsHTML;
        } catch (error) {
            console.error('Error loading calculations:', error);
            this.showToast('Error loading calculations: ' + error.message, 'error');
        }
    }

    async updateReport() {
        try {
            const response = await fetch('php/get_calculations.php');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const calculations = await response.json();
            const reportContent = document.getElementById('reportContent');
            if (calculations.length === 0) {
                reportContent.innerHTML = `
                    <div class="no-data">
                        <i class="fas fa-file-text"></i>
                        <p>No examiner data available. Please assign paper setters first.</p>
                    </div>
                `;
                return;
            }
            const groupedByExaminer = calculations.reduce((acc, calc) => {
                if (!acc[calc.examiner_id]) {
                    acc[calc.examiner_id] = {
                        paper_setter: calc.paper_setter,
                        college_name: calc.college_name,
                        faculty_name: calc.faculty_name,
                        class_name: calc.class_name,
                        calculations: []
                    };
                }
                acc[calc.examiner_id].calculations.push(calc);
                return acc;
            }, {});
            const reportsHTML = Object.values(groupedByExaminer).map(examiner => {
                const totalRemuneration = examiner.calculations.reduce((sum, calc) => sum + parseFloat(calc.remuneration), 0);
                return `
                    <div class="examiner-card">
                        <div class="examiner-header">
                            <div class="examiner-info">
                                <h3>${examiner.paper_setter}</h3>
                            </div>
                        </div>
                        <div class="examiner-details">
                            <div class="detail-item">
                                <span class="detail-label">College</span>
                                <span class="detail-value">${examiner.college_name}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Faculty</span>
                                <span class="detail-value">${examiner.faculty_name}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Class</span>
                                <span class="detail-value">${examiner.class_name}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Subjects</span>
                                <span class="detail-value">${examiner.calculations.map(c => `${c.subject_name} (Set ${c.paper_set}, ${c.exam_duration} hours)`).join(', ')}</span>
                            </div>
                        </div>
                        ${totalRemuneration > 0 ? `
                        <div class="remuneration-summary">
                            <h4>Total Remuneration</h4>
                            <div class="amount">₹${totalRemuneration.toFixed(2)}</div>
                        </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
            reportContent.innerHTML = reportsHTML;
        } catch (error) {
            console.error('Error loading report:', error);
            this.showToast('Error loading report: ' + error.message, 'error');
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Global instance
const system = new ExaminationSystem();
