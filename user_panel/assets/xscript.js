class ExaminationSystem {
    constructor() {
        this.savedData = JSON.parse(localStorage.getItem('examinationData')) || [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateSummary();
        this.updateReport();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn, .dashboard-card').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.target.closest('.nav-btn, .dashboard-card').dataset.tab;
                if (tab) {
                    this.switchTab(tab);
                }
            });
        });

        // Form submission
        document.getElementById('examinationForm').addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });

        // Reset form
        document.getElementById('resetForm').addEventListener('click', () => {
            this.resetForm();
        });

        // Checkbox change listeners for real-time updates
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSummary();
            });
        });

        // Year and exam period change listeners
        document.getElementById('year').addEventListener('input', () => {
            this.updateSummary();
        });

        document.getElementById('examPeriod').addEventListener('change', () => {
            this.updateSummary();
        });
    }

    switchTab(tabName) {
        // Remove active class from all nav buttons and tab contents
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked nav button and corresponding tab
        const navBtn = document.querySelector(`.nav-btn[data-tab="${tabName}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }
        
        const tabContent = document.getElementById(tabName);
        if (tabContent) {
            tabContent.classList.add('active');
        }

        // Update report if viewing reports tab
        if (tabName === 'view-reports') {
            this.updateReport();
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = this.extractFormData(formData);
        
        if (this.validateFormData(data)) {
            this.saveData(data);
            this.showToast('Assignment and remuneration saved successfully!', 'success');
            this.resetForm();
            this.updateReport();
        } else {
            this.showToast('Please fill in all required fields and select at least one option for sets, duration, and paper type.', 'error');
        }
    }

    extractFormData(formData) {
        const data = {};
        
        // Extract basic form data
        for (let [key, value] of formData.entries()) {
            if (!data[key]) {
                data[key] = value;
            }
        }

        // Extract checkbox arrays
        data.paper_sets = Array.from(document.querySelectorAll('input[name="paper_sets"]:checked')).map(cb => cb.value);
        data.exam_duration = Array.from(document.querySelectorAll('input[name="exam_duration"]:checked')).map(cb => cb.value);
        data.paper_type = Array.from(document.querySelectorAll('input[name="paper_type"]:checked')).map(cb => cb.value);

        // Add calculated remuneration
        data.total_remuneration = this.calculateRemuneration(data);
        data.created_at = new Date().toISOString();
        data.id = Date.now().toString();

        return data;
    }

    validateFormData(data) {
        const requiredFields = ['college_id', 'pattern_id', 'faculty_id', 'class_id', 'major_subject_id', 'semester_number', 'subject_id', 'examiner_id', 'year', 'exam_period'];
        
        // Check required fields
        for (let field of requiredFields) {
            if (!data[field]) {
                return false;
            }
        }

        // Check if at least one option is selected for each checkbox group
        if (data.paper_sets.length === 0 || data.exam_duration.length === 0 || data.paper_type.length === 0) {
            return false;
        }

        return true;
    }

    calculateRemuneration(data) {
        const baseRates = {
            theory: 500,
            model_answer: 300,
            translation: 200
        };

        const durationMultiplier = {
            '1.5': 1,
            '2': 1.2,
            '3': 1.5
        };

        let total = 0;

        // Calculate for each combination
        data.paper_sets.forEach(set => {
            data.exam_duration.forEach(duration => {
                data.paper_type.forEach(type => {
                    const baseRate = baseRates[type] || 500;
                    const multiplier = durationMultiplier[duration] || 1;
                    total += baseRate * multiplier;
                });
            });
        });

        return total;
    }

    updateSummary() {
        const selectedSets = Array.from(document.querySelectorAll('input[name="paper_sets"]:checked')).map(cb => cb.value);
        const selectedDuration = Array.from(document.querySelectorAll('input[name="exam_duration"]:checked')).map(cb => cb.value + ' hours');
        const selectedPaperTypes = Array.from(document.querySelectorAll('input[name="paper_type"]:checked')).map(cb => {
            const typeMap = {
                'theory': 'Theory Paper',
                'model_answer': 'Model Answer',
                'translation': 'Translation'
            };
            return typeMap[cb.value] || cb.value;
        });

        // Update summary display
        document.getElementById('selectedSets').textContent = selectedSets.length > 0 ? selectedSets.join(', ') : 'None';
        document.getElementById('selectedDuration').textContent = selectedDuration.length > 0 ? selectedDuration.join(', ') : 'None';
        document.getElementById('selectedPaperTypes').textContent = selectedPaperTypes.length > 0 ? selectedPaperTypes.join(', ') : 'None';

        // Calculate and display total remuneration
        const mockData = {
            paper_sets: selectedSets,
            exam_duration: selectedDuration.map(d => d.replace(' hours', '')),
            paper_type: Array.from(document.querySelectorAll('input[name="paper_type"]:checked')).map(cb => cb.value)
        };

        const totalRemuneration = this.calculateRemuneration(mockData);
        document.getElementById('totalRemuneration').textContent = `₹${totalRemuneration.toLocaleString()}`;
    }

    saveData(data) {
        this.savedData.push(data);
        localStorage.setItem('examinationData', JSON.stringify(this.savedData));
    }

    resetForm() {
        document.getElementById('examinationForm').reset();
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        this.updateSummary();
        this.showToast('Form reset successfully!', 'warning');
    }

    updateReport() {
        const reportContent = document.getElementById('reportContent');
        
        if (this.savedData.length === 0) {
            reportContent.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-file-text"></i>
                    <p>No examiner data available. Please assign paper setters first.</p>
                </div>
            `;
            return;
        }

        // Group data by examiner
        const groupedByExaminer = this.savedData.reduce((acc, record) => {
            const examinerId = record.examiner_id;
            if (!acc[examinerId]) {
                acc[examinerId] = {
                    examiner_name: this.getExaminerName(record.examiner_id),
                    college_name: this.getCollegeName(record.college_id),
                    faculty_name: this.getFacultyName(record.faculty_id),
                    class_name: this.getClassName(record.class_id),
                    records: []
                };
            }
            acc[examinerId].records.push(record);
            return acc;
        }, {});

        // Generate report HTML
        const reportsHTML = Object.values(groupedByExaminer).map(examiner => {
            const totalRemuneration = examiner.records.reduce((sum, record) => sum + record.total_remuneration, 0);
            
            return `
                <div class="examiner-card">
                    <div class="examiner-header">
                        <div class="examiner-info">
                            <h3>${examiner.examiner_name}</h3>
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
                            <span class="detail-label">Assignments</span>
                            <span class="detail-value">${examiner.records.length} assignments</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Subjects</span>
                            <span class="detail-value">${examiner.records.map(r => this.getSubjectName(r.subject_id)).join(', ')}</span>
                        </div>
                    </div>
                    <div class="remuneration-summary">
                        <h4>Total Remuneration</h4>
                        <div class="amount">₹${totalRemuneration.toLocaleString()}</div>
                    </div>
                </div>
            `;
        }).join('');

        reportContent.innerHTML = reportsHTML;
    }

    // Helper methods to get names (in a real app, these would fetch from a database)
    getExaminerName(id) {
        const examiners = {
            '1': 'Dr. Smith Johnson',
            '2': 'Prof. Sarah Davis',
            '3': 'Dr. Michael Brown',
            '4': 'Prof. Emily Wilson'
        };
        return examiners[id] || 'Unknown Examiner';
    }

    getCollegeName(id) {
        const colleges = {
            '1': 'Government College of Engineering',
            '2': 'Arts and Science College',
            '3': 'Commerce College'
        };
        return colleges[id] || 'Unknown College';
    }

    getFacultyName(id) {
        const faculties = {
            '1': 'Engineering',
            '2': 'Arts',
            '3': 'Science',
            '4': 'Commerce'
        };
        return faculties[id] || 'Unknown Faculty';
    }

    getClassName(id) {
        const classes = {
            '1': 'First Year',
            '2': 'Second Year',
            '3': 'Third Year',
            '4': 'Final Year'
        };
        return classes[id] || 'Unknown Class';
    }

    getSubjectName(id) {
        const subjects = {
            '1': 'Data Structures',
            '2': 'Algorithms',
            '3': 'Database Management',
            '4': 'Operating Systems'
        };
        return subjects[id] || 'Unknown Subject';
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

// Initialize the system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ExaminationSystem();
});