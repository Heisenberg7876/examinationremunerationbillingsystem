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
        document.getElementById('academicLevel').addEventListener('change', () => this.updateYears());
        document.getElementById('academicLevel').addEventListener('change', () => this.updateClasses());
        document.getElementById('years').addEventListener('change', () => this.updateSemesters());
        document.getElementById('class').addEventListener('change', () => this.updateMajorSubjects());
        document.getElementById('majorSubject').addEventListener('change', () => this.updateSubjects());
        document.getElementById('sem').addEventListener('change', () => this.updateSubjects());
        document.getElementById('class').addEventListener('change', () => this.loadExaminers());

        // Forms
        document.getElementById('examinationForm').addEventListener('submit', (e) => this.addExaminer(e));

        document.getElementById('exportCSV').addEventListener('click', () => this.exportCSV());
        document.getElementById('exportPDF').addEventListener('click', () => this.exportPDF());
        //document.getElementById('remunerationForm').addEventListener('submit', (e) => this.saveRemuneration(e));
        // document.getElementById('examinerSelect').addEventListener('change', () => this.loadAssignedSubjects());

        // Total remuneration updates
        // document.querySelectorAll('input[name="paperType"], input[name="examDuration"], input[name="paperSet"], #academicLevel').forEach(el => {
        //     el.addEventListener('change', () => this.updateTotalRemuneration());
        // });

        document.querySelectorAll('#paperSetterFilter, #examPeriodFilter, #examYearFilter').forEach(filter => {
            filter.addEventListener('change', () => {
                clearTimeout(this.filterDebounceTimeout);
                this.filterDebounceTimeout = setTimeout(() => {
                    this.updateRemunerationDisplay();
                }, 300);
            })
        })

        document.getElementById('refresh-remunerations').addEventListener('click', () => {
            this.updateRemunerationDisplay();
            this.showToast('Data refreshed successfully', 'success');
        })
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.querySelector(`.nav-btn[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');

        const assignCalcContainer = document.getElementById('assign-calculate');
        const viewReportContainer = document.getElementById('view-reports');
        const dashboardContainer = document.getElementById('dashboard');

        if (tabName === 'dashboard') {
            dashboardContainer.style.display = 'block';
            assignCalcContainer.style.display = 'none';
            viewReportContainer.style.display = 'none';
        } else if (tabName === 'assign-calculate') {
            assignCalcContainer.style.display = 'block';
            dashboardContainer.style.display = 'none';
            viewReportContainer.style.display = 'none';
            // this.loadExaminers();
            // this.loadAssignedSubjects();
            // this.updateCalculationsList();
            //this.loadColleges();
            //this.loadPatterns();
            this.loadFaculties();
            this.loadAcademicLevel();
            this.updateClasses();
            // this.loadMajorSubjects();
            this.loadSemesters();
            this.loadSubjects();
            this.loadExaminers();
            //this.updateTotalRemuneration();
        } else if (tabName === 'view-reports') {
            this.loadPaperSetters();
            this.loadExamYears();
            this.updateRemunerationDisplay();
            assignCalcContainer.style.display = 'none';
            dashboardContainer.style.display = 'none';
            viewReportContainer.style.display = 'block';
        }
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

    async loadAcademicLevel() {
        try {
            const response = await fetch('php/get_academicLevel.php');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const academicLevel = await response.json();
            const select = document.getElementById('academicLevel');
            select.innerHTML = '<option value="">Select Academic Level</option>';

            academicLevel.forEach(aclev => {
                const opt = document.createElement('option');
                opt.value = aclev.id;
                opt.textContent = `${aclev.level_name}`;
                select.appendChild(opt);
            });
            //this.updateTotalRemuneration();
        } catch (error) {
            console.error('Error loading academic levels:', error);
            this.showToast('Error loading academic levels: ' + error.message, 'error');
        }
    }

    async updateClasses() {
        try {
            const facultyId = document.getElementById('faculty').value;
            const levelId = document.getElementById('academicLevel').value; // Academic Level dropdown ID

            // If either is not selected, clear the class dropdown
            if (!facultyId || !levelId) {
                const select = document.getElementById('class');
                select.innerHTML = '<option value="">Select class</option>';
                this.updateMajorSubjects(); // Clear dependent dropdowns
                return;
            }

            const response = await fetch(`php/get_classes.php?faculty_id=${facultyId}&academicLevel=${levelId}`);
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

            this.updateMajorSubjects(); // Refresh major subjects after class change
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
            select.innerHTML = '<option value="">Select Principle Subject</option>';
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

    updateYears() {
        const level = document.getElementById('academicLevel')?.value || '';
        const yearSelect = document.getElementById('years');

        yearSelect.innerHTML = '<option value="">Select year</option>';
        if (level) {
            fetch(`php/get_years.php?level_id=${encodeURIComponent(level)}`)
                .then(response => response.json())
                .then(years => {
                    years.forEach(year => {
                        const option = document.createElement('option');
                        option.value = year.id;
                        option.textContent = year.year_name;
                        yearSelect.appendChild(option);
                    });
                });
        }
    }

    updateSemesters() {
        const yearId = document.getElementById('years')?.value || '';
        const semesterSelect = document.getElementById('sem');

        semesterSelect.innerHTML = '<option value="">Select semester</option>';
        if (yearId) {
            fetch(`php/get_semesters.php?year=${yearId}`)
                .then(response => response.json())
                .then(semesters => {
                    semesters.forEach(sem => {
                        const option = document.createElement('option');
                        option.value = sem.id;
                        option.textContent = sem.semester_number;
                        semesterSelect.appendChild(option);
                    });
                });
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
            // this.updateTotalRemuneration();
        } catch (error) {
            console.error('Error loading subjects:', error);
            this.showToast('Error loading subjects: ' + error.message, 'error');
        }
    }

    async loadExaminers() {
        const classId = document.getElementById('class').value;
        const al_id = document.getElementById('academicLevel').value;
        const year = document.getElementById('years').value;

        const examinerSelect = document.getElementById('examiner');
        if (!examinerSelect) return;

        examinerSelect.innerHTML = '<option value="">Select examiner</option>';

        fetch(`php/get_examiners.php?class_id=${classId}&al_id=${al_id}&year=${year}`)
            .then(response => response.json())
            .then(examiners => {
                if (examiners.length === 0) {
                    this.showToast('No examiners found for this subject', 'info');
                    return;
                }
                examiners.forEach(examiner => {
                    const option = document.createElement('option');
                    option.value = examiner.id;
                    option.textContent = examiner.paper_setter;
                    examinerSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error fetching examiners:', error);
                this.showToast('Failed to load examiners', 'error');
            });
    }


    // async loadAssignedSubjects() {
    //     try {
    //         const examinerId = document.getElementById('examinerSelect').value;
    //         const select = document.getElementById('assignedSubject');
    //         select.innerHTML = '<option value="">Select assigned subject</option>';
    //         if (!examinerId) return;
    //         const response = await fetch(`php/get_assigned_subjects.php?examiner_id=${examinerId}`);
    //         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    //         const subjects = await response.json();
    //         subjects.forEach(s => {
    //             const opt = document.createElement('option');
    //             opt.value = s.subject_id;
    //             opt.textContent = `${s.subject_code} - ${s.subject_name}`;
    //             select.appendChild(opt);
    //         });
    //     } catch (error) {
    //         console.error('Error loading assigned subjects:', error);
    //         this.showToast('Error loading assigned subjects: ' + error.message, 'error');
    //     }
    // }

    async loadSubjects() {
        try {
            const select = document.querySelector('select[name="subject_id"]');
            const response = await fetch('php/get_subjects.php');
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const subjects = await response.json();
            select.innerHTML = '<option value="">Select Subject</option>';
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
            // this.updateTotalRemuneration();
        } catch (error) {
            console.error('Error loading subjects:', error);
            this.showToast('Error loading subjects: ' + error.message, 'error');
        }
    }

    // updateTotalRemuneration() {
    //     const alId = document.getElementById('academicLevel')?.value;
    //     const duration = document.querySelector('input[name="examDuration"]:checked')?.value;
    //     const selectedTypes = Array.from(document.querySelectorAll('input[name="paperType"]:checked')).map(cb => cb.value);
    //     const selectedSets = Array.from(document.querySelectorAll('input[name="paperSet"]:checked')).map(cb => cb.value);
    //     const totalEl = document.getElementById('totalRemuneration');

    //     if (!alId || !duration || selectedTypes.length === 0 || selectedSets.length === 0) {
    //         if (totalEl) totalEl.textContent = '₹0';
    //         return;
    //     }

    //     fetch(`php/get_rates.php?al_id=${alId}&duration=${duration}`)
    //         .then(response => {
    //             if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    //             return response.json();
    //         })
    //         .then(data => {
    //             if (!data.success) throw new Error(data.error || 'Failed to fetch rates');
    //             let total = 0;
    //             selectedTypes.forEach(type => {
    //                 const rate = data.rates.find(r => r.paper_type === type);
    //                 if (rate) {
    //                     total += parseFloat(rate.amount) * selectedSets.length;
    //                 }
    //             });
    //             if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
    //         })
    //         .catch(error => {
    //             console.error('Error updating total remuneration:', error);
    //             this.showToast('Error updating total: ' + error.message, 'error');
    //             if (totalEl) totalEl.textContent = '₹0';
    //         });
    // }

    async addExaminer(e) {
        e.preventDefault();
        const form = e.target;
        const selectedSets = Array.from(document.querySelectorAll('input[name="paper_sets"]:checked')).map(cb => cb.value);
        const selectedTypes = Array.from(document.querySelectorAll('input[name="paper_type"]:checked')).map(cb => cb.value);

        if (selectedSets.length === 0 || selectedTypes.length === 0) {
            this.showToast('Please select at least one paper set and one paper type.', 'error');
            return;
        }

        try {
            const formData = new FormData(form);
            selectedSets.forEach(set => formData.append('paper_sets[]', set));
            selectedTypes.forEach(type => formData.append('paper_type[]', type));

            const response = await fetch('php/add_examiner_for_calculation.php', { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const result = await response.json();
            if (result.success) {
                this.showToast('Paper setter assigned and remuneration calculated successfully!', 'success');
                form.reset();
                this.loadExaminers();
                this.updateSubjects();
                // this.updateTotalRemuneration();
                // this.updateReport();
            } else {
                this.showToast('Error: ' + (result.error || 'Unknown error'), 'error');
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

    // async updateCalculationsList() {
    //     try {
    //         const examinerId = document.getElementById('examinerSelect').value;
    //         const calculationsList = document.getElementById('calculationsList');
    //         const calculationsContainer = document.getElementById('calculationsContainer');
    //         if (!examinerId) {
    //             calculationsList.style.display = 'none';
    //             return;
    //         }
    //         const response = await fetch(`php/get_calculations.php?examiner_id=${examinerId}&limit=5`);
    //         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    //         const calculations = await response.json();
    //         if (calculations.length === 0) {
    //             calculationsList.style.display = 'none';
    //             return;
    //         }
    //         calculationsList.style.display = 'block';
    //         const calculationsHTML = calculations.map(calc => `
    //             <div class="calculation-item">
    //                 <div class="calculation-info">
    //                     <h4>Remuneration: ₹${calc.remuneration.toFixed(2)}</h4>
    //                     <p>Subject: ${calc.subject_code} - ${calc.subject_name} • Set: ${calc.paper_set} • Duration: ${calc.exam_duration} hours</p>
    //                 </div>
    //             </div>
    //         `).join('');
    //         calculationsContainer.innerHTML = calculationsHTML;
    //     } catch (error) {
    //         console.error('Error loading calculations:', error);
    //         this.showToast('Error loading calculations: ' + error.message, 'error');
    //     }
    // }

    // async updateReport() {
    //     try {
    //         const response = await fetch('php/get_calculations.php');
    //         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    //         const calculations = await response.json();
    //         const reportContent = document.getElementById('reportContent');
    //         if (calculations.length === 0) {
    //             reportContent.innerHTML = `
    //                 <div class="no-data">
    //                     <i class="fas fa-file-text"></i>
    //                     <p>No examiner data available. Please assign paper setters first.</p>
    //                 </div>
    //             `;
    //             return;
    //         }
    //         const groupedByExaminer = calculations.reduce((acc, calc) => {
    //             if (!acc[calc.examiner_id]) {
    //                 acc[calc.examiner_id] = {
    //                     paper_setter: calc.paper_setter,
    //                     college_name: calc.college_name || 'N/A',
    //                     faculty_name: calc.faculty_name || 'N/A',
    //                     class_name: calc.class_name || 'N/A',
    //                     calculations: []
    //                 };
    //             }
    //             acc[calc.examiner_id].calculations.push(calc);
    //             return acc;
    //         }, {});
    //         const reportsHTML = Object.values(groupedByExaminer).map(examiner => {
    //             const totalRemuneration = examiner.calculations.reduce((sum, calc) => sum + parseFloat(calc.remuneration), 0);
    //             return `
    //                 <div class="examiner-card">
    //                     <div class="examiner-header">
    //                         <div class="examiner-info">
    //                             <h3>${examiner.paper_setter}</h3>
    //                         </div>
    //                     </div>
    //                     <div class="examiner-details">
    //                         <div class="detail-item">
    //                             <span class="detail-label">College</span>
    //                             <span class="detail-value">${examiner.college_name}</span>
    //                         </div>
    //                         <div class="detail-item">
    //                             <span class="detail-label">Faculty</span>
    //                             <span class="detail-value">${examiner.faculty_name}</span>
    //                         </div>
    //                         <div class="detail-item">
    //                             <span class="detail-label">Class</span>
    //                             <span class="detail-value">${examiner.class_name}</span>
    //                         </div>
    //                         <div class="detail-item">
    //                             <span class="detail-label">Subjects</span>
    //                             <span class="detail-value">${examiner.calculations.map(c => `${c.subject_name} (Set ${c.paper_set}, ${c.exam_duration} hours)`).join(', ')}</span>
    //                         </div>
    //                     </div>
    //                     ${totalRemuneration > 0 ? `
    //                     <div class="remuneration-summary">
    //                         <h4>Total Remuneration</h4>
    //                         <div class="amount">₹${totalRemuneration.toFixed(2)}</div>
    //                     </div>
    //                     ` : ''}
    //                 </div>
    //             `;
    //         }).join('');
    //         reportContent.innerHTML = reportsHTML;
    //     } catch (error) {
    //         console.error('Error loading report:', error);
    //         this.showToast('Error loading report: ' + error.message, 'error');
    //     }
    // }
    async loadPaperSetters() {
        const select = document.getElementById('paperSetterFilter');
        select.innerHTML = '<option value="">All Paper Setters</option>';
        const response = await fetch('php/get_remunerations.php?paper_setter=1');
        if (!response.ok) {
            this.showToast('Error loading paper setters: HTTP ' + response.status, 'error');
            return;
        }
        const examiners = await response.json();
        examiners.forEach(ex => {
            const opt = document.createElement('option');
            // opt.value = ex.examiner_id;
            opt.value = ex.paper_setter || ex.email;

            let label = ex.paper_setter;
            if(ex.num_ass>1) label += ` (${ex.num_ass} assignments)`;
            opt.textContent = label;
            select.appendChild(opt);
        });
    }

    async loadExamYears() {
        const select = document.getElementById('examYearFilter');
        select.innerHTML = '<option value="">All Years</option>';
        const response = await fetch('php/get_remuneration_years.php');
        if (!response.ok) {
            this.showToast('Error loading exam years: HTTP ' + response.status, 'error');
            return;
        }
        const years = await response.json();
        years.forEach(year => {
            const opt = document.createElement('option');
            opt.value = year.exam_year;
            opt.textContent = year.exam_year;
            select.appendChild(opt);
        });
    }

    async updateRemunerationDisplay() {
        const paperSetter = document.getElementById('paperSetterFilter')?.value || 'all';
        const examPeriod = document.getElementById('examPeriodFilter')?.value || 'all';
        const examYear = document.getElementById('examYearFilter')?.value || 'all';
        const tableCard = document.getElementById('recordsTableCard');
        const tableBody = document.getElementById('recordsTableBody');
        const totalAmount = document.getElementById('totalAmount');

        // const params = new URLSearchParams();
        // if (paperSetter) params.append('examiner_id', paperSetter);
        // if (examPeriod) params.append('exam_season', examPeriod);
        // if (examYear) params.append('exam_year', examYear);

        // const response = await fetch(`php/get_remunerations.php?${params.toString()}`);

        const url = paperSetter === 'all'
            ? 'php/get_remunerations.php'
            : `php/get_remunerations.php?examiner_id=${paperSetter}&exam_season=${examPeriod}&exam_year=${examYear}`;
        const response = await fetch(url);
        if (!response.ok) {
            this.showToast('Error loading remunerations: HTTP ' + response.status, 'error');
            tableCard.style.display = 'none';
            return;
        }

        const records = await response.json();
        if (records.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="10" class="no-data">No records found for the selected filters.</td></tr>';
            totalAmount.innerHTML = '<strong>₹0</strong>';
            tableCard.style.display = 'block';
            return;
        }

        let total = 0;
        tableBody.innerHTML = records.map(r => {
            total += parseFloat(r.remuneration);
            return `
                <tr>
                    <td>${r.paper_setter}</td>
                    <td>${r.faculty_name || 'N/A'}</td>
                    <td>${r.exam_year}</td>
                    <td>${r.level_name}</td>
                    <td>${r.major_subject_name || 'N/A'}</td>
                    <td>${r.subject_code}</td>
                    <td>${r.subject_name}</td>
                    <td>${r.paper_set}</td>
                    <td>${r.paper_type}</td>
                    <td>${r.exam_season}</td>
                    <td>₹${parseFloat(r.remuneration).toFixed(2)}</td>
                </tr>
            `;
        }).join('');
        totalAmount.innerHTML = `<strong>₹${total.toFixed(2)}</strong>`;
        tableCard.style.display = 'block';
    }

    async exportCSV() {
        const paperSetter = document.getElementById('paperSetterFilter')?.value || '';
        const examYear = document.getElementById('examYearFilter')?.value || '';
        const examPeriod = document.getElementById('examPeriodFilter')?.value || '';

        const url = paperSetter === ''
            ? 'php/export_csv.php'
            : `php/export_csv.php?paper_setter=${paperSetter}&exam_season=${examPeriod}&exam_year=${examYear}`

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.showToast(`CSV exported successfully as ${data.file}`, 'success');
                } else {
                    this.showToast(data.error || 'Failed to export CSV', 'error');
                }
            })
            .catch(error => {
                this.showToast('Error exporting CSV', 'error');
            });
    }

    async exportPDF() {
        const paperSetterFilter = document.getElementById('paperSetterFilter');
        const examYearFilter = document.getElementById('examYearFilter');
        const examPeriodFilter = document.getElementById('examPeriodFilter');

        const selectedSetter = paperSetterFilter?.options[paperSetterFilter.selectedIndex]?.text || 'All Paper Setters';
        const selectedYear = examYearFilter?.value || 'All Years';
        const selectedPeriod = examPeriodFilter?.value || 'All Periods';

        // Re-use the same logic to fetch current filtered records
        const paperSetter = paperSetterFilter?.value || 'all';
        const examPeriod = examPeriodFilter?.value || 'all';
        const examYear = examYearFilter?.value || 'all';

        const url = paperSetter === 'all'
            ? 'php/get_remunerations.php'
            : `php/get_remunerations.php?examiner_id=${paperSetter}&exam_season=${examPeriod}&exam_year=${examYear}`;

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Network error');
                return response.json();
            })
            .then(records => {
                if (records.length === 0) {
                    alert('No data to export.');
                    return;
                }

                let total = 0;
                const tableRows = records.map(r => {
                    total += parseFloat(r.remuneration || 0);
                    return `
                    <tr>
                        <td>${r.paper_setter || 'N/A'}</td>
                        <td>${r.class_name || 'N/A'}</td>
                        <td>${r.level_name || 'N/A'}</td>
                        <td>${r.year_name || 'N/A'}</td>
                        <td>${r.major_subject_name || 'N/A'}</td>
                        <td>${r.semester_number || 'N/A'}</td>
                        <td>${r.subject_code || 'N/A'}</td>
                        <td>${r.subject_name || 'N/A'}</td>
                        <td>${r.paper_set || 'N/A'}</td>
                        <td>${r.paper_type || 'N/A'}</td>
                        <td style="text-align:right;">₹${parseFloat(r.remuneration || 0).toFixed(2)}</td>
                    </tr>
                `;
                }).join('');

                const printContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Remuneration Bill</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.5; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .college { font-size: 24px; font-weight: bold; }
                        .subtitle { font-size: 18px; margin-top: 8px; color: #555; }
                        .info { margin: 20px 0; font-size: 12px; }
                        .date { text-align: right; font-size: 12px; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
                        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                        th { background-color: #f0f0f0; font-weight: bold; }
                        .amount { text-align: right; }
                        .total { text-align: right; font-size: 16px; font-weight: bold; margin-top: 20px; }
                        .signature { margin-top: 60px; text-align: right; }
                        .signature-line { border-top: 1px solid #000; width: 300px; margin-left: auto; padding-top: 5px; }
                        .signature-text { margin-top: 10px; font-size: 13px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="college">K.C.E.S's Moolji Jaitha College, Jalgaon</div>
                        <div class="subtitle">Remuneration Bill Report</div>
                        </div>
                        <hr>

                    <div class="info">
                        <strong>Paper Setter:</strong> ${selectedSetter}<br>
                        <strong>Exam Year:</strong> ${selectedYear}<br>
                        <strong>Exam Period:</strong> ${selectedPeriod}<br>                        
                    </div>

                    <div class="date">Date: ${new Date().toLocaleDateString('en-GB')}</div>

                    <table>
                        <thead>
                            <tr>
                                <th>Paper Setter</th>
                                <th>Class</th>
                                <th>Level</th>
                                <th>Year</th>
                                <th>Major Subject</th>
                                <th>Semester</th>
                                <th>Subject Code</th>
                                <th>Subject Name</th>
                                <th>Paper Set</th>
                                <th>Paper Type</th>
                                <th class="amount">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>

                    <div class="total">Total Amount: ₹${total.toFixed(2)}</div>

                    <div class="signature">
                        <div class="signature-line"></div>
                        <div class="signature-text">Authorized Signatory<br>(Chairman / Principal)</div>
                    </div>
                </body>
                </html>
            `;

                const printWindow = window.open('', '_blank');
                printWindow.document.write(printContent);
                printWindow.document.close();
                printWindow.focus();

                printWindow.onload = function () {
                    printWindow.print();
                    // Optional: close after printing
                    // printWindow.close();
                };
            })
            .catch(error => {
                console.error('Export failed:', error);
                alert('Failed to generate PDF bill. Please try again.');
            });
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