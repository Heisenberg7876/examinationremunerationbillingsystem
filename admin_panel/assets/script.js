// Combined Admin Panel JavaScript

class AdminPanel {
    constructor() {
        this.chairmen = [];
        this.paperSetters = [];
        this.subjects = [];
        this.costs = [];
        this.currentView = 'chairmen';
        this.selectedChairmanFilter = 'all';
        this.currentSection = 'add-chairman';
        this.filterDebounceTimeout = null;
        this.pendingDelete = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadChairmenDropdown();
        this.renderChairmenTable();
        this.renderPaperSettersTable();
        this.updateCounts();
        this.populateChairmanForm();
        this.populateSubjectForm();
        this.setupFormDependencies();
        this.setupRemunerationFormDependencies();
        this.updateSubjectDisplay();
        this.updateCostDisplay();
        this.populateSubjectFilters();
        //this.populateCostFilters();
        // Only call remuneration calculation if section is active
        // if (this.currentSection === 'display-remuneration' && this.areRemunerationElementsPresent()) {
        //     this.calculateAndDisplayRemunerations();
        // }
        this.setupHamburgerMenu();
    }

    // Check if remuneration elements are present in DOM
    areRemunerationElementsPresent() {
        const tbody = document.getElementById('remunerations-tbody');
        const noRemunerations = document.getElementById('no-remunerations');
        const totalRemunerationAmount = document.getElementById('total-remuneration-amount');
        const remunerationTableContainer = document.getElementById('remuneration-table-container');
        return tbody && noRemunerations && totalRemunerationAmount && remunerationTableContainer;
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.currentTarget.dataset.section);
            });
        });

        // Form submissions
        document.getElementById('chairman-form').addEventListener('submit', (e) => {
            this.handleChairmanSubmit(e);
        });

        document.getElementById('paper-setter-form').addEventListener('submit', (e) => {
            this.handlePaperSetterSubmit(e);
        });

        document.getElementById('subject-form').addEventListener('submit', (e) => {
            this.handleSubjectSubmit(e);
        });

        document.getElementById('remuneration-form').addEventListener('submit', (e) => {
            this.handleRemunerationSubmit(e);
        });

        // Display toggles
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.currentTarget.dataset.view);
            });
        });

        // Chairman filter
        document.getElementById('chairman-filter').addEventListener('change', (e) => {
            this.selectedChairmanFilter = e.target.value;
            this.renderPaperSettersTable();
        });

        // Refresh button for personnel
        document.querySelector('#refresh-personnel').addEventListener('click', () => {
            this.refreshData();
        });

        // Subject filter events
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearSubjectFilters();
        });

        document.getElementById('refresh-subject-data').addEventListener('click', () => {
            this.refreshSubjectData();
        });

        // Cost filter events
        document.getElementById('clear-cost-filters').addEventListener('click', () => {
            this.clearCostFilters();
        });

        document.getElementById('refresh-cost-data').addEventListener('click', () => {
            this.refreshCostData();
        });

        // Filter change events for subjects
        document.querySelectorAll('#filter-faculty, #filter-level, #filter-year, #filter-class, #filter-subject, #filter-semester').forEach(filter => {
            filter.addEventListener('change', () => {
                clearTimeout(this.filterDebounceTimeout);
                this.filterDebounceTimeout = setTimeout(() => {
                    this.updateSubjectDisplay();
                    // if (this.currentSection === 'display-remuneration' && this.areRemunerationElementsPresent()) {
                    //     this.calculateAndDisplayRemunerations();
                    // }
                }, 300);
            });
        });

        // Filter change events for costs
        document.querySelectorAll('#filter-paperType, #filter-courseType, #filter-remuLevel, #filter-specialCase').forEach(filter => {
            filter.addEventListener('change', () => {
                clearTimeout(this.filterDebounceTimeout);
                this.filterDebounceTimeout = setTimeout(() => {
                    this.updateCostDisplay();
                    // if (this.currentSection === 'display-remuneration' && this.areRemunerationElementsPresent()) {
                    //     this.calculateAndDisplayRemunerations();
                    // }
                }, 300);
            });
        });

        // Edit form submissions
        document.getElementById('edit-chairman-form')?.addEventListener('submit', (e) => {
            this.handleEditChairman(e);
        });

        document.getElementById('edit-paper-setter-form')?.addEventListener('submit', (e) => {
            this.handleEditPaperSetter(e);
        });

        document.getElementById('edit-subject-form')?.addEventListener('submit', (e) => {
            this.handleEditSubject(e);
        });

        document.getElementById('edit-remuneration-form')?.addEventListener('submit', (e) => {
            this.handleEditCost(e);
        });

        // Modal close listeners (delegation)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close')) {
                e.target.closest('.modal').style.display = 'none';
            }
        });

        // Confirm delete
        document.getElementById('confirm-delete')?.addEventListener('click', () => {
            if (this.pendingDelete) {
                this.handleDelete(this.pendingDelete.type, this.pendingDelete.id);
                this.closeModal('confirmDeleteModal');
                this.pendingDelete = null;
            }
        });

        document.getElementById('cancel-delete')?.addEventListener('click', () => {
            this.closeModal('confirmDeleteModal');
            this.pendingDelete = null;
        });

        // Table action listeners (delegation)
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            if (target.classList.contains('edit-btn')) {
                const type = target.dataset.type;
                const id = parseInt(target.dataset.id);
                if (type && !isNaN(id)) {
                    this.openEditModal(type, id);
                } else {
                    this.showToast('Invalid edit action', 'error');
                }
            } else if (target.classList.contains('delete-btn')) {
                const type = target.dataset.type;
                const id = parseInt(target.dataset.id);
                if (type && !isNaN(id)) {
                    this.openConfirmDelete(type, id);
                } else {
                    this.showToast('Invalid delete action', 'error');
                }
            }
        });

    }

    // Setup Form Dependencies
    setupFormDependencies() {
        // const levelSelect = document.getElementById('level');
        // const yearSelect = document.getElementById('year');
        // const semesterSelect = document.getElementById('semester');

        // levelSelect.addEventListener('change', () => {
        //     this.updateYearOptions();
        //     yearSelect.value = '';
        //     semesterSelect.value = '';
        //     semesterSelect.disabled = true;
        //     this.updateSemesterOptions();
        // });

        // yearSelect.addEventListener('change', () => {
        //     this.updateSemesterOptions();
        //     semesterSelect.value = '';
        // });

        // Subject code auto-uppercase
        document.getElementById('subjectCode').addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    // Setup Remuneration Form Dependencies
    setupRemunerationFormDependencies() {
        const paperTypeSelect = document.getElementById('paperType');
        // const courseTypeSelect = document.getElementById('courseType');
        // const levelSelect = document.getElementById('al_id');
        // const specialCaseSelect = document.getElementById('specialCase');
        // const durationSelect = document.getElementById('duration');

        fetch('php/get_academicLevel.php')
            .then(response => response.json())
            .then(levels => {
                const levelSelect = document.getElementById('al_id');
                levelSelect.innerHTML = '<option value="">Select level</option>';
                levels.forEach(level => {
                    const option = document.createElement('option');
                    option.value = level.id;
                    option.textContent = level.level_name;
                    levelSelect.appendChild(option);
                });
            });


        paperTypeSelect.addEventListener('change', () => {
            this.updateRemunerationFormFields();
        });

        // courseTypeSelect.addEventListener('change', () => {
        //     this.updateSpecialCaseOptions();
        // });

        // levelSelect.addEventListener('change', () => {
        //     this.updateSpecialCaseOptions();
        // });
    }

    // setupRemunerationFormDependencies() {
    //     const paperTypeSelect = document.getElementById('paperType');
    //     const courseTypeGroup = document.querySelector('.course-type-group');
    //     const levelGroup = document.querySelector('.level-group');
    //     const specialCaseGroup = document.querySelector('.special-case-group');
    //     const durationGroup = document.querySelector('.duration-group');

    //     Populate academic level dropdown
    //     fetch('php/get_academicLevel.php')
    //         .then(response => response.json())
    //         .then(levels => {
    //             const levelSelect = document.getElementById('al_id');
    //             levelSelect.innerHTML = '<option value="">Select level</option>';
    //             levels.forEach(level => {
    //                 const option = document.createElement('option');
    //                 option.value = level.id;
    //                 option.textContent = level.level_name;
    //                 levelSelect.appendChild(option);
    //             });
    //         });

    //     Dynamic field visibility based on paper type
    //     paperTypeSelect?.addEventListener('change', () => {
    //         const paperType = paperTypeSelect.value;
    //         courseTypeGroup.style.display = (paperType === 'theory' || paperType === 'model') ? 'block' : 'none';
    //         levelGroup.style.display = (paperType === 'theory' || paperType === 'model' || paperType === 'translation') ? 'block' : 'none';
    //         specialCaseGroup.style.display = (paperType === 'theory') ? 'block' : 'none';
    //         durationGroup.style.display = (paperType === 'theory' || paperType === 'model' || paperType === 'chairman') ? 'block' : 'none';

    //         // Update duration options for chairman
    //         const durationSelect = document.getElementById('duration');
    //         if (paperType === 'chairman') {
    //             durationSelect.innerHTML = `
    //                 <option value="">Select number of members</option>
    //                 <option value="4">4 Members</option>
    //                 <option value="6">6 Members</option>
    //             `;
    //         } else if (paperType === 'theory' || paperType === 'model') {
    //             durationSelect.innerHTML = `
    //                 <option value="">Select duration</option>
    //                 <option value="2">2 Hours</option>
    //                 <option value="3">3 Hours</option>
    //             `;
    //         } else {
    //             durationSelect.innerHTML = '<option value="">Select duration/members</option>';
    //         }
    //     });
    // }

    // Setup Hamburger Menu
    setupHamburgerMenu() {
        const hamburger = document.getElementById('hamburger');
        const sidebar = document.querySelector('.sidebar');

        if (hamburger && sidebar) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                sidebar.classList.toggle('mobile-open');
            });
        }
    }

    // Update Year Options
    // updateYearOptions() {
    //     const level = document.getElementById('level').value;
    //     const yearSelect = document.getElementById('year');

    //     yearSelect.innerHTML = '<option value="">Select year</option>';

    //     if (level === 'UG') {
    //         yearSelect.disabled = false;
    //         const options = [
    //             { value: 'FY', label: 'First Year' },
    //             { value: 'SY', label: 'Second Year' },
    //             { value: 'TY', label: 'Third Year' }
    //         ];
    //         options.forEach(opt => {
    //             const option = document.createElement('option');
    //             option.value = opt.value;
    //             option.textContent = opt.label;
    //             yearSelect.appendChild(option);
    //         });
    //     } else if (level === 'PG') {
    //         yearSelect.disabled = false;
    //         const options = [
    //             { value: 'FY', label: 'First Year' },
    //             { value: 'SY', label: 'Second Year' }
    //         ];
    //         options.forEach(opt => {
    //             const option = document.createElement('option');
    //             option.value = opt.value;
    //             option.textContent = opt.label;
    //             yearSelect.appendChild(option);
    //         });
    //     } else {
    //         yearSelect.disabled = true;
    //     }
    // }
    // // Update Semester Options
    // updateSemesterOptions() {
    //     const year = document.getElementById('year').value;
    //     const semesterSelect = document.getElementById('semester');

    //     semesterSelect.innerHTML = '<option value="">Select semester</option>';
    //     semesterSelect.disabled = true;

    //     if (year) {
    //         fetch(`php/get_semesters.php?year=${year}`)
    //             .then(response => response.json())
    //             .then(semesters => {
    //                 console.log('Fetched semesters:', semesters); // Debug: Log semesters
    //                 if (semesters.length > 0) {
    //                     semesterSelect.disabled = false;
    //                     semesters.forEach(sem => {
    //                         const option = document.createElement('option');
    //                         option.value = sem.id; // Use semester_id
    //                         option.textContent = `Semester ${sem.semester_number}`;
    //                         semesterSelect.appendChild(option);
    //                     });
    //                 }
    //             });
    //     }
    // }

    // Update Remuneration Form Fields
    updateRemunerationFormFields() {
        const paperTypeSelect = document.getElementById('paperType');
        if (!paperTypeSelect) return;

        const paperType = paperTypeSelect.value;
        const courseTypeGroup = document.getElementById('courseTypeGroup');
        const levelGroup = document.getElementById('levelGroup');
        const specialCaseGroup = document.getElementById('specialCaseGroup');
        const durationGroup = document.getElementById('durationGroup');
        const amountGroup = document.getElementById('amountGroup');
        const remuFormActions = document.getElementById('remuFormActions');
        const durationSelect = document.getElementById('duration');
        const durationLabel = document.getElementById('durationLabel');

        if (!courseTypeGroup || !levelGroup || !specialCaseGroup || !durationGroup || !amountGroup || !remuFormActions || !durationSelect || !durationLabel) return;

        // Reset visibility
        courseTypeGroup.style.display = 'none';
        levelGroup.style.display = 'none';
        specialCaseGroup.style.display = 'none';
        durationGroup.style.display = 'none';
        amountGroup.style.display = 'none';
        remuFormActions.style.display = 'none';

        // Reset required attributes
        document.getElementById('courseType').required = false;
        document.getElementById('al_id').required = false;
        document.getElementById('duration').required = false;
        document.getElementById('amount').required = false;

        if (!paperType) return;

        amountGroup.style.display = 'block';
        remuFormActions.style.display = 'flex';
        document.getElementById('amount').required = true;

        if (paperType === 'theory' || paperType === 'model') {
            courseTypeGroup.style.display = 'block';
            levelGroup.style.display = 'block';
            durationGroup.style.display = 'block';
            document.getElementById('courseType').required = true;
            document.getElementById('al_id').required = true;
            document.getElementById('duration').required = true;

            durationLabel.textContent = 'Duration';
            durationSelect.innerHTML = '<option value="">Select duration</option>';
            const durations = ['1.5 hrs', '2 hrs', '3 hrs'];
            durations.forEach(dur => {
                const option = document.createElement('option');
                option.value = dur;
                option.textContent = dur;
                durationSelect.appendChild(option);
            });

            if (paperType === 'theory') {
                specialCaseGroup.style.display = 'block';
            }
        } else if (paperType === 'translation') {
            levelGroup.style.display = 'block';
            document.getElementById('al_id').required = true;
        } else if (paperType === 'chairman') {
            durationGroup.style.display = 'block';
            levelGroup.style.display = 'block';
            document.getElementById('duration').required = true;
            durationLabel.textContent = 'Number of Members';
            durationSelect.innerHTML = '<option value="">Select number of members</option>';

            // Populate duration with member ranges
            const memberOptions = [
                { value: '1-5', label: '1 - 5 members' },
                { value: '6-10', label: '6 - 10 members' },
                { value: '10 and above', label: '10 and above' }
            ];
            memberOptions.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.label;
                durationSelect.appendChild(option);
            });
        }
    }

    // Switch Section
    switchSection(section) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const navBtn = document.querySelector(`[data-section="${section}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }

        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        const sectionElement = document.getElementById(section);
        if (sectionElement) {
            sectionElement.classList.add('active');
        }

        // Close mobile sidebar on section change
        const sidebar = document.querySelector('.sidebar');
        const hamburger = document.getElementById('hamburger');
        if (sidebar && hamburger) {
            sidebar.classList.remove('mobile-open');
            hamburger.classList.remove('active');
        }

        if (section === 'add-paper-setter') {
            this.checkChairmenAvailability();
            this.loadChairmenDropdown();
        } else if (section === 'display-personnel') {
            this.refreshData();
        } else if (section === 'display-subject') {
            this.refreshSubjectData();
        } else if (section === 'display-remuneration' && this.areRemunerationElementsPresent()) {
            this.refreshCostData();
            // this.calculateAndDisplayRemunerations();
        }

        this.currentSection = section;
    }

    populateChairmanForm() {
        // const yearSelect = document.getElementById('year');
        // yearSelect.innerHTML = '<option value="">Select year</option>';
        // fetch('php/get_years.php')
        //     .then(response => response.json())
        //     .then(years => {
        //         years.forEach(year => {
        //             const option = document.createElement('option');
        //             option.value = year.id;
        //             option.textContent = year.year_name;
        //             yearSelect.appendChild(option);
        //         });
        //     });

        const levelSelect = document.getElementById('chairman-level');
        const yearSelect = document.getElementById('year');
        //yearSelect.innerHTML = '<option value="">Select year</option>';

        // Level change: Update years and classes
        levelSelect?.addEventListener('change', () => {
            yearSelect.innerHTML = '<option value="">Select year</option>';
            const al_id = levelSelect.value;
            if (al_id) {
                fetch(`php/get_Syears.php?level=${al_id}`)
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
        });
    }

    // Handle Chairman Submit
    handleChairmanSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        fetch('php/add_chairman.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.showToast('Chairman added successfully!', 'success');
                    e.target.reset();
                    this.loadChairmenDropdown();
                } else {
                    this.showToast(data.error || 'Failed to add Chairman', 'error');
                }
            })
            .catch(error => {
                this.showToast('Error submitting form', 'error');
                console.error('Submission error:', error);
            });
    }

    // Handle Paper Setter Submit
    handlePaperSetterSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        fetch('php/add_paper_setter.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.showToast('Paper Setter added successfully!', 'success');
                    e.target.reset();
                } else {
                    this.showToast(data.error || 'Failed to add Paper Setter', 'error');
                }
            })
            .catch(error => {
                this.showToast('Error submitting form', 'error');
                console.error('Submission error:', error);
            });
    }

    populateSubjectForm() {
        const facultySelect = document.getElementById('faculty');
        const levelSelect = document.getElementById('level');
        const yearSelect = document.getElementById('Syear');
        const classInput = document.getElementById('class');
        const subjectSelect = document.getElementById('subject');
        const semesterSelect = document.getElementById('semester');

        // Populate faculties
        fetch('php/get_faculties.php')
            .then(response => response.json())
            .then(faculties => {
                facultySelect.innerHTML = '<option value="">Select faculty</option>';
                faculties.forEach(f => {
                    const option = document.createElement('option');
                    option.value = f.faculty_name;
                    option.textContent = f.faculty_name;
                    facultySelect.appendChild(option);
                });
            });

        // Populate academic levels
        fetch('php/get_academicLevel.php')
            .then(response => response.json())
            .then(levels => {
                levelSelect.innerHTML = '<option value="">Select level</option>';
                levels.forEach(level => {
                    const option = document.createElement('option');
                    option.value = level.id;
                    option.textContent = level.level_name;
                    levelSelect.appendChild(option);
                });
            });

        // Faculty change: Update classes
        facultySelect?.addEventListener('change', () => {
            classInput.value = '';
            yearSelect.innerHTML = '<option value="">Select year</option>';
            semesterSelect.innerHTML = '<option value="">Select semester</option>';
            subjectSelect.innerHTML = '<option value="">Select subject</option>';
            this.updateClasses();
        });

        // Level change: Update years and classes
        levelSelect?.addEventListener('change', () => {
            yearSelect.innerHTML = '<option value="">Select year</option>';
            semesterSelect.innerHTML = '<option value="">Select semester</option>';
            subjectSelect.innerHTML = '<option value="">Select subject</option>';
            classInput.value = '';
            this.updateYears();
            this.updateClasses();
        });

        // Year change: Update semesters
        yearSelect?.addEventListener('change', () => {
            semesterSelect.innerHTML = '<option value="">Select semester</option>';
            subjectSelect.innerHTML = '<option value="">Select subject</option>';
            this.updateSemesters();
        });

        // Class change: Update subjects
        classInput?.addEventListener('input', () => {
            subjectSelect.innerHTML = '<option value="">Select subject</option>';
            this.updateSubjects();
        });
    }

    updateClasses() {
        const facultyName = document.getElementById('faculty')?.value || '';
        const level = document.getElementById('level')?.value || '';
        const classInput = document.getElementById('class');

        if (facultyName && level) {
            classInput.disabled = false;
        } else {
            classInput.disabled = true;
        }
    }

    updateYears() {
        const level = document.getElementById('level')?.value || '';
        const yearSelect = document.getElementById('Syear');

        yearSelect.innerHTML = '<option value="">Select year</option>';
        if (level) {
            fetch(`php/get_Syears.php?level=${encodeURIComponent(level)}`)
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
        const yearId = document.getElementById('Syear')?.value || '';
        const semesterSelect = document.getElementById('semester');

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

    updateSubjects() {
        const className = document.getElementById('class')?.value || '';
        const level = document.getElementById('level')?.value || '';
        const subjectSelect = document.getElementById('subject');

        subjectSelect.innerHTML = '<option value="">Select subject</option>';
        if (className && level) {
            fetch(`php/get_subjects_by_class.php?class=${encodeURIComponent(className)}&level=${encodeURIComponent(level)}`)
                .then(response => response.json())
                .then(subjects => {
                    subjects.forEach(sub => {
                        const option = document.createElement('option');
                        option.value = sub.major_subject_name;
                        option.textContent = sub.major_subject_name;
                        subjectSelect.appendChild(option);
                    });
                });
        }
    }

    // Handle Subject Submit
    handleSubjectSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        fetch('php/add_subject.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.showToast('Subject added successfully!', 'success');
                    e.target.reset();
                } else {
                    this.showToast(data.error || 'Failed to add Subject', 'error');
                }
            })
            .catch(error => {
                this.showToast('Error submitting form', 'error');
                console.error('Submission error:', error);
            });
    }
    // Handle Remuneration Submit
    async handleRemunerationSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);

        fetch('php/add_remuneration_rate.php', {
            method: 'POST',
            body: formData
        }).then(response => response.text()).then(data => {
            if (data === "success") {
                this.showToast('Remuneration cost added successfully!', 'success');
                e.target.reset();
                this.updateCostDisplay();
                // this.populateCostFilters();
            } else {
                this.showToast('Failed to add remuneration cost', 'error');
            }
        });
    }


    // Check Chairmen Availability
    checkChairmenAvailability() {
        fetch('php/get_chairmen.php')
            .then(response => response.json())
            .then(chairmen => {
                const noChairmenMessage = document.getElementById('no-chairmen-message');
                const paperSetterForm = document.getElementById('paper-setter-form');
                if (chairmen.length === 0) {
                    noChairmenMessage.style.display = 'block';
                    paperSetterForm.style.display = 'none';
                } else {
                    noChairmenMessage.style.display = 'none';
                    paperSetterForm.style.display = 'grid';
                }
            });
    }

    // Load Chairmen Dropdown
    loadChairmenDropdown() {
        const chairmanSelect = document.getElementById('setter-chairman');
        const chairmanFilter = document.getElementById('chairman-filter');
        chairmanSelect.innerHTML = '<option value="">Select a Panel Chairman</option>';
        chairmanFilter.innerHTML = '<option value="all">All Chairmen</option>';
        fetch('php/get_chairmen.php')
            .then(response => response.json())
            .then(chairmen => {
                chairmen.forEach(chairman => {
                    const option = document.createElement('option');
                    option.value = chairman.id;
                    option.textContent = `${chairman.name} - ${chairman.department}`;
                    chairmanSelect.appendChild(option);
                    const filterOption = document.createElement('option');
                    filterOption.value = chairman.id;
                    filterOption.textContent = chairman.name;
                    chairmanFilter.appendChild(filterOption);
                });
            });
    }

    // Switch View
    switchView(view) {
        this.currentView = view;

        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const toggleBtn = document.querySelector(`[data-view="${view}"]`);
        if (toggleBtn) {
            toggleBtn.classList.add('active');
        }

        const chairmenContainer = document.getElementById('chairmen-table-container');
        const settersContainer = document.getElementById('paper-setters-table-container');
        const chairmanFilter = document.getElementById('chairman-filter');

        if (!chairmenContainer || !settersContainer || !chairmanFilter) return;

        if (view === 'chairmen') {
            chairmenContainer.style.display = 'block';
            settersContainer.style.display = 'none';
            chairmanFilter.style.display = 'none';
        } else {
            chairmenContainer.style.display = 'none';
            settersContainer.style.display = 'block';
            chairmanFilter.style.display = 'block';
        }

        this.renderPaperSettersTable();
    }

    // Render Chairmen Table
    renderChairmenTable() {
        const tbody = document.getElementById('chairmen-tbody');
        const emptyState = document.getElementById('no-chairmen');
        const tableWrapper = document.querySelector('#chairmen-table-container .table-wrapper');
        tbody.innerHTML = '';
        fetch('php/get_chairmen.php')
            .then(response => response.json())
            .then(chairmen => {
                if (chairmen.length === 0) {
                    tableWrapper.style.display = 'none';
                    emptyState.style.display = 'block';
                } else {
                    tableWrapper.style.display = 'block';
                    emptyState.style.display = 'none';
                    chairmen.forEach(chairman => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td class="font-medium">${chairman.name}</td>
                            <td><span class="badge badge-primary">${chairman.department}</span></td>
                            <td class="text-muted">${chairman.email}</td>
                            <td class="text-muted">${chairman.phone}</td>
                            <td class="text-muted">${chairman.bank_account_number}</td>
                            <td class="text-muted">${chairman.ifsc_code}</td>
                            <td class="text-muted">${chairman.college_name}</td>
                            <td class="text-muted"><span class="badge badge-secondary">${chairman.level_name}</span></td>
                            <td class="text-muted">${chairman.class_name}</td>
                            <td class="text-muted">${chairman.year_name}</td>
                            <td class="actions">
                                <button class="edit-btn" data-type="chairman" data-id="${chairman.id}"><i class="fas fa-edit"></i></button>
                                <button class="delete-btn" data-type="chairman" data-id="${chairman.id}"><i class="fas fa-trash"></i></button>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });
                }
                document.getElementById('chairmen-count').textContent = chairmen.length;
            });

    }

    // Render Paper Setters Table
    renderPaperSettersTable() {
        const tbody = document.getElementById('setters-tbody');
        const emptyState = document.getElementById('no-setters');
        const emptyMessage = document.getElementById('no-setters-message');
        const tableWrapper = document.querySelector('#paper-setters-table-container .table-wrapper');
        tbody.innerHTML = '';
        const url = this.selectedChairmanFilter === 'all'
            ? 'php/get_paper_setters.php'
            : `php/get_paper_setters.php?chairman_id=${this.selectedChairmanFilter}`;
        fetch(url)
            .then(response => response.json())
            .then(setters => {
                if (setters.length === 0) {
                    tableWrapper.style.display = 'none';
                    emptyState.style.display = 'block';
                    emptyMessage.textContent = this.selectedChairmanFilter === 'all'
                        ? 'Add some Paper Setters to see them here.'
                        : 'No Paper Setters found for the selected Chairman.';
                } else {
                    tableWrapper.style.display = 'block';
                    emptyState.style.display = 'none';
                    setters.forEach(setter => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td class="font-medium">${setter.paper_setter}</td>
                            <td class="text-muted">${setter.phone}</td>
                            <td class="text-muted">${setter.email}</td>
                            <td class="font-medium">${setter.bank_account_number}</td>
                            <td class="font-medium">${setter.ifsc_code}</td>
                            <td>${setter.chairman_name}</td>
                            <td class="text-muted">${setter.college_name}</td>
                            <td class="text-muted">${setter.class_name}</td>
                            <td class="text-muted">${setter.year_name}</td>
                            <td class="actions">
                                <button class="edit-btn" data-type="setter" data-id="${setter.id}"><i class="fas fa-edit"></i></button>
                                <button class="delete-btn" data-type="setter" data-id="${setter.id}"><i class="fas fa-trash"></i></button>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });
                }
                document.getElementById('setters-count').textContent = setters.length;
            });
    }

    // Update Counts
    updateCounts() {
        fetch('php/get_chairmen.php')
            .then(response => response.json())
            .then(chairmen => {
                document.getElementById('chairmen-count').textContent = chairmen.length;
            });
        const url = this.selectedChairmanFilter === 'all'
            ? 'php/get_paper_setters.php'
            : `php/get_paper_setters.php?chairman_id=${this.selectedChairmanFilter}`;
        fetch(url)
            .then(response => response.json())
            .then(setters => {
                document.getElementById('setters-count').textContent = setters.length;
            });
    }

    // Update Subject Display
    updateSubjectDisplay() {
        const faculty = document.getElementById('filter-faculty').value || 'all';
        const level = document.getElementById('filter-level').value || 'all';
        const year = document.getElementById('filter-year').value || 'all';
        const classFilter = document.getElementById('filter-class').value || 'all';
        const subject = document.getElementById('filter-subject').value || 'all';
        const semester = document.getElementById('filter-semester').value || 'all';

        fetch(`php/get_subjects.php?faculty=${faculty}&level=${level}&year=${year}&class=${classFilter}&subject=${subject}&semester=${semester}`)
            .then(response => response.json())
            .then(subjects => {
                //console.log('Fetched subjects:', subjects); // Debug: Log the response

                this.subjects = subjects;
                const tableContainer = document.getElementById('subject-table-container');
                const noSubjects = document.getElementById('no-subjects');
                const noFiltered = document.getElementById('no-filtered-subjects');
                const tbody = document.getElementById('subjects-tbody');
                const totalCount = document.getElementById('total-subject-count');
                const filteredCount = document.getElementById('filtered-subject-count');
                const tableCount = document.getElementById('subject-table-count');

                // Check if DOM elements exist
                if (!tableContainer || !tbody || !totalCount || !filteredCount || !tableCount || !noSubjects || !noFiltered) {
                    console.log('Subject table elements missing:', {
                        tableContainer: !!tableContainer,
                        tbody: !!tbody,
                        totalCount: !!totalCount,
                        filteredCount: !!filteredCount,
                        tableCount: !!tableCount,
                        noSubjects: !!noSubjects,
                        noFiltered: !!noFiltered
                    });
                    return;
                }

                // Update counts
                totalCount.textContent = subjects.length;
                filteredCount.textContent = subjects.length;
                tableCount.textContent = subjects.length;

                // Handle display logic
                if (subjects.length === 0) {
                    tableContainer.style.display = 'none';
                    noFiltered.style.display = (faculty !== 'all' || level !== 'all' || year !== 'all' || classFilter !== 'all' || subject !== 'all' || semester !== 'all') ? 'block' : 'none';
                    noSubjects.style.display = (faculty === 'all' && level === 'all' && year === 'all' && classFilter === 'all' && subject === 'all' && semester === 'all') ? 'block' : 'none';
                } else {
                    noSubjects.style.display = 'none';
                    noFiltered.style.display = 'none';
                    tableContainer.style.display = 'block';

                    tbody.innerHTML = ''; // Clear table
                    subjects.forEach(subject => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                    <td><span class="badge badge-default">${subject.subject_code || '-'}</span></td>
                        <td>${subject.subject_name || '-'}</td>
                        <td><span class="badge badge-primary">${subject.faculty_name || '-'}</span></td>
                        <td>${subject.year_name}</td>
                        <td>${subject.class_name || '-'}</td>
                        <td><span class="badge badge-accent">${subject.major_subject_name || '-'}</span></td>
                        <td>${subject.semester_number || '-'}</td>
                        <td class="actions">
                            <button class="edit-btn" data-type="subject" data-id="${subject.id}"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" data-type="subject" data-id="${subject.id}"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                        tbody.appendChild(row);
                    });
                }
            });
    }

    // Populate Subject Filters
    populateSubjectFilters() {
        fetch('php/get_subjects.php?faculty=all&level=all&year=all&class=all&subject=all&semester=all')
            .then(response => response.json())
            .then(subjects => {
                const facultyFilter = document.getElementById('filter-faculty');
                const levelFilter = document.getElementById('filter-level');
                const yearFilter = document.getElementById('filter-year');
                const classFilter = document.getElementById('filter-class');
                const subjectFilter = document.getElementById('filter-subject');
                const semesterFilter = document.getElementById('filter-semester');

                //Extract unique values
                const faculties = ['all', ...new Set(subjects.map(s => s.faculty_name))];
                const levels = ['all', ...new Set(subjects.map(s => s.level_name))];
                const years = ["all", "FY", "SY", "TY"];
                // const years = ["all", ...new Set(subjects.map(s => s.year_name))];
                const classes = ['all', ...new Set(subjects.map(s => s.class_name))];
                const m_subjects = ['all', ...new Set(subjects.map(s => s.major_subject_name))];
                const semesters = ['all', ...new Set(subjects.map(s => s.semester_number))];

                //Populate dropdowns
                facultyFilter.innerHTML = faculties.map(f => `<option value="${f}">${f === 'all' ? 'All Faculties' : f}</option>`).join('');
                levelFilter.innerHTML = levels.map(l => `<option value="${l}">${l === 'all' ? 'All Levels' : l}</option>`).join('');
                yearFilter.innerHTML = years.map(y => `<option value="${y}">${y === 'all' ? 'All Years' : y}</option>`).join('');
                classFilter.innerHTML = classes.map(c => `<option value="${c}">${c === 'all' ? 'All Classes' : c}</option>`).join('');
                subjectFilter.innerHTML = m_subjects.map(s => `<option value="${s}">${s === 'all' ? 'All Subjects' : s}</option>`).join('');
                semesterFilter.innerHTML = semesters.map(s => `<option value="${s}">${s === 'all' ? 'All Semesters' : s}</option>`).join('');

                //console.log('Subject filters populated:', { faculties, levels, years, classes, subjects, semesters });  //fOr Debug
            });
    }

    // populateSubjectFilters() {
    //     const facultyFilter = document.getElementById('filter-faculty');
    //     const levelFilter = document.getElementById('filter-level');
    //     const yearFilter = document.getElementById('filter-year');
    //     const classFilter = document.getElementById('filter-class');
    //     const subjectFilter = document.getElementById('filter-subject');
    //     const semesterFilter = document.getElementById('filter-semester');

    //     facultyFilter.innerHTML = '<option value="all">All Faculties</option>';
    //     levelFilter.innerHTML = '<option value="all">All Levels</option><option value="Undergraduate">Undergraduate</option><option value="Postgraduate">Postgraduate</option>';
    //     yearFilter.innerHTML = '<option value="all">All Years</option>';
    //     classFilter.innerHTML = '<option value="all">All Classes</option>';
    //     subjectFilter.innerHTML = '<option value="all">All Subjects</option>';
    //     semesterFilter.innerHTML = '<option value="all">All Semesters</option>';

    //     fetch('php/get_faculties.php')
    //         .then(response => response.json())
    //         .then(faculties => {
    //             faculties.forEach(f => {
    //                 const option = document.createElement('option');
    //                 option.value = f.id;
    //                 option.textContent = f.faculty_name;
    //                 facultyFilter.appendChild(option);
    //             });
    //         });

    //     facultyFilter.addEventListener('change', () => {
    //         classFilter.innerHTML = '<option value="all">All Classes</option>';
    //         yearFilter.innerHTML = '<option value="all">All Years</option>';
    //         semesterFilter.innerHTML = '<option value="all">All Semesters</option>';
    //         subjectFilter.innerHTML = '<option value="all">All Subjects</option>';
    //         if (facultyFilter.value !== 'all') {
    //             fetch(`php/get_classes.php?faculty=${facultyFilter.value}`)
    //                 .then(response => response.json())
    //                 .then(classes => {
    //                     classes.forEach(cls => {
    //                         const option = document.createElement('option');
    //                         option.value = cls.id;
    //                         option.textContent = cls.class_name;
    //                         classFilter.appendChild(option);
    //                     });
    //                 });
    //         }
    //         this.updateSubjectDisplay();
    //     });

    //     levelFilter.addEventListener('change', () => {
    //         yearFilter.innerHTML = '<option value="all">All Years</option>';
    //         semesterFilter.innerHTML = '<option value="all">All Semesters</option>';
    //         subjectFilter.innerHTML = '<option value="all">All Subjects</option>';
    //         fetch('php/get_years.php?level=' + encodeURIComponent(levelFilter.value))
    //             .then(response => response.json())
    //             .then(years => {
    //                 years.forEach(year => {
    //                     const option = document.createElement('option');
    //                     option.value = year.id;
    //                     option.textContent = year.year_name;
    //                     yearFilter.appendChild(option);
    //                 });
    //             });
    //         this.updateClasses();
    //         this.updateSubjectDisplay();
    //     });

    //     yearFilter.addEventListener('change', () => {
    //         semesterFilter.innerHTML = '<option value="all">All Semesters</option>';
    //         subjectFilter.innerHTML = '<option value="all">All Subjects</option>';
    //         if (yearFilter.value !== 'all') {
    //             fetch('php/get_semesters.php?year=' + yearFilter.value)
    //                 .then(response => response.json())
    //                 .then(semesters => {
    //                     semesters.forEach(sem => {
    //                         const option = document.createElement('option');
    //                         option.value = sem.id;
    //                         option.textContent = sem.semester_number;
    //                         semesterFilter.appendChild(option);
    //                     });
    //                 });
    //         }
    //         this.updateSubjectDisplay();
    //     });

    //     classFilter.addEventListener('change', () => {
    //         subjectFilter.innerHTML = '<option value="all">All Subjects</option>';
    //         if (classFilter.value !== 'all') {
    //             fetch('php/get_subjects_by_class.php?class=' + classFilter.value)
    //                 .then(response => response.json())
    //                 .then(subjects => {
    //                     subjects.forEach(sub => {
    //                         const option = document.createElement('option');
    //                         option.value = sub.id;
    //                         option.textContent = sub.major_subject_name;
    //                         subjectFilter.appendChild(option);
    //                     });
    //                 });
    //         }
    //         this.updateSubjectDisplay();
    //     });

    //     semesterFilter.addEventListener('change', () => {
    //         this.updateSubjectDisplay();
    //     });
    // }

    // Refresh Subject Data
    async refreshSubjectData() {
        this.showLoading();
        try {
            await this.delay(1000);
            this.updateSubjectDisplay();
            this.populateSubjectFilters();
            // if (this.currentSection === 'display-remuneration' && this.areRemunerationElementsPresent()) {
            //     this.calculateAndDisplayRemunerations();
            // }
            this.showToast('Subject data refreshed successfully!', 'success');
        } catch (error) {
            console.error('Error refreshing subject data:', error);
            this.showToast('Failed to refresh subject data', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Clear Subject Filters
    clearSubjectFilters() {
        const filters = ['filter-faculty', 'filter-level', 'filter-year', 'filter-class', 'filter-subject', 'filter-semester'];
        filters.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = 'all';
        });
        this.updateSubjectDisplay();
        // if (this.currentSection === 'display-remuneration' && this.areRemunerationElementsPresent()) {
        //     this.calculateAndDisplayRemunerations();
        // }
        this.showToast('Filters cleared', 'success');
    }

    // Update Cost Display
    updateCostDisplay() {
        const paperType = document.getElementById('filter-paperType').value;
        const courseType = document.getElementById('filter-courseType').value;
        const level = document.getElementById('filter-remuLevel').value;
        const specialCase = document.getElementById('filter-specialCase').value;

        fetch(`php/get_remuneration_rates.php?paperType=${paperType}&courseType=${courseType}&al_id=${level}&specialCase=${specialCase}`)
            .then(response => response.json())
            .then(costs => {
                this.costs = costs;
                const tableContainer = document.getElementById('cost-table-container');
                const noCosts = document.getElementById('no-costs');
                const noFiltered = document.getElementById('no-filtered-costs');
                const tbody = document.getElementById('costs-tbody');
                const totalCount = document.getElementById('total-cost-count');
                const filteredCount = document.getElementById('filtered-cost-count');
                const tableCount = document.getElementById('cost-table-count');

                totalCount.textContent = costs.length;
                filteredCount.textContent = costs.length;
                tableCount.textContent = costs.length;

                if (costs.length === 0) {
                    tableContainer.style.display = 'none';
                    noFiltered.style.display = 'none';
                    noCosts.style.display = 'block';
                } else {
                    noCosts.style.display = 'none';
                    noFiltered.style.display = 'none';
                    tableContainer.style.display = 'block';

                    tbody.innerHTML = '';
                    costs.forEach(cost => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td><span class="badge badge-default">${this.formatPaperType(cost.paper_type)}</span></td>
                            <td>${cost.course_type ? this.formatCourseType(cost.course_type) : '-'}</td>
                            <td><span class="badge badge-secondary">${cost.alevel_name || '-'}</span></td>
                            <td>${this.formatSpecialCase(cost.special_case)}</td>
                            <td>${this.formatDuration(cost.duration, cost.paper_type)}</td>
                            <td><strong>₹${parseFloat(cost.amount).toFixed(2)}</strong></td>
                            <td class="actions">
                                <button class="edit-btn" data-type="cost" data-id="${cost.id}"><i class="fas fa-edit"></i></button>
                                <button class="delete-btn" data-type="cost" data-id="${cost.id}"><i class="fas fa-trash"></i></button>
                            </td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            });
    }

    // Calculate and Display Remunerations
    // calculateAndDisplayRemunerations() {
    //     const tbody = document.getElementById('remunerations-tbody');
    //     const noRemunerations = document.getElementById('no-remunerations');
    //     const totalRemunerationAmount = document.getElementById('total-remuneration-amount');
    //     const remunerationTableContainer = document.getElementById('remuneration-table-container');

    //     if (!tbody || !noRemunerations || !totalRemunerationAmount || !remunerationTableContainer) {
    //         console.error('Remuneration table elements not found in DOM');
    //         this.showToast('Remuneration table not properly set up in HTML', 'error');
    //         return;
    //     }

    //     const levelFilter = document.getElementById('filter-level')?.value || 'all';
    //     const facultyFilter = document.getElementById('filter-faculty')?.value || 'all';

    //     const remunerations = this.subjects.map(subject => {
    //         const paperSetter = this.paperSetters.find(setter => setter.subject === subject.subject && setter.faculty === subject.faculty);
    //         const cost = this.findMatchingCost(subject);

    //         return {
    //             subjectCode: subject.subjectCode,
    //             subjectTitle: subject.subjectTitle,
    //             faculty: subject.faculty,
    //             level: subject.level,
    //             paperSetter: paperSetter ? paperSetter.name : 'Unassigned',
    //             amount: cost ? cost.amount : 0,
    //             costId: cost ? cost.id : null
    //         };
    //     });

    //     let filteredRemunerations = remunerations;

    //     if (levelFilter !== 'all') {
    //         filteredRemunerations = filteredRemunerations.filter(r => r.level === levelFilter);
    //     }
    //     if (facultyFilter !== 'all') {
    //         filteredRemunerations = filteredRemunerations.filter(r => r.faculty === facultyFilter);
    //     }

    //     tbody.innerHTML = '';

    //     if (remunerations.length === 0) {
    //         noRemunerations.style.display = 'block';
    //         remunerationTableContainer.style.display = 'none';
    //     } else {
    //         noRemunerations.style.display = 'none';
    //         remunerationTableContainer.style.display = 'block';

    //         filteredRemunerations.forEach(rem => {
    //             const row = document.createElement('tr');
    //             row.innerHTML = `
    //                 <td class="font-medium" style="font-family: monospace;">${rem.subjectCode}</td>
    //                 <td>${rem.subjectTitle}</td>
    //                 <td><span class="badge badge-primary">${rem.faculty}</span></td>
    //                 <td><span class="badge badge-accent">${rem.level}</span></td>
    //                 <td>${rem.paperSetter}</td>
    //                 <td class="font-medium">₹${rem.amount.toFixed(2)}</td>
    //             `;
    //             tbody.appendChild(row);
    //         });
    //     }

    //     const totalAmount = filteredRemunerations.reduce((sum, rem) => sum + rem.amount, 0);
    //     totalRemunerationAmount.textContent = `₹${totalAmount.toFixed(2)}`;

    //     this.renderRemunerationChart(filteredRemunerations);
    // }

    // Find Matching Cost for a Subject
    // findMatchingCost(subject) {
    //     // Prioritize exact matches (level and faculty-based course type)
    //     let matchingCost = this.costs.find(cost =>
    //         cost.level === subject.level &&
    //         cost.paperType === 'theory' &&
    //         (cost.courseType === (subject.faculty === 'Engineering' ? 'technical' : 'non-technical'))
    //     );

    //     // Fallback to any cost with matching level
    //     if (!matchingCost) {
    //         matchingCost = this.costs.find(cost =>
    //             cost.level === subject.level &&
    //             cost.paperType === 'theory'
    //         );
    //     }

    //     // Fallback to lowest amount for the level
    //     if (!matchingCost) {
    //         const levelCosts = this.costs.filter(cost => cost.level === subject.level);
    //         if (levelCosts.length > 0) {
    //             matchingCost = levelCosts.reduce((min, cost) =>
    //                 cost.amount < min.amount ? cost : min, levelCosts[0]);
    //         }
    //     }

    //     return matchingCost;
    // }

    // Render Remuneration Chart
    renderRemunerationChart(remunerations) {
        const canvas = document.getElementById('remuneration-chart');
        if (!canvas) {
            console.error('Chart canvas not found in DOM');
            return;
        }

        // Aggregate remuneration by faculty
        const facultyTotals = remunerations.reduce((acc, rem) => {
            acc[rem.faculty] = (acc[rem.faculty] || 0) + rem.amount;
            return acc;
        }, {});

        const labels = Object.keys(facultyTotals);
        const data = Object.values(facultyTotals);

        if (labels.length === 0) {
            canvas.style.display = 'none';
            return;
        }

        canvas.style.display = 'block';

        ```chartjs
        {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(labels)},
                datasets: [{
                    label: 'Total Remuneration by Faculty (₹)',
                    data: ${JSON.stringify(data)},
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                    borderColor: ['#1e40af', '#047857', '#b45309', '#b91c1c'],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (₹)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Faculty'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        }
        ```
    }

    // Populate Cost Filters
    // populateCostFilters() {
    //     fetch('php/get_remuneration_rates.php?paperType=all&courseType=all&level=all&specialCase=all')
    //         .then(response => response.json())
    //         .then(costs => {
    //             const paperTypeFilter = document.getElementById('filter-paperType');
    //             const courseTypeFilter = document.getElementById('filter-courseType');
    //             const levelFilter = document.getElementById('filter-remuLevel');
    //             const specialCaseFilter = document.getElementById('filter-specialCase');

    //             // Extract unique values
    //             const paperTypes = ['all', ...new Set(costs.map(c => c.paper_type))];
    //             const courseTypes = ['all', ...new Set(costs.map(c => c.course_type).filter(ct => ct))];
    //             // const levels = ['all', ...new Set(costs.map(c => c.level).filter(l => l))];
    //             const specialCases = ['all', ...new Set(costs.map(c => c.special_case).filter(sc => sc))];

    //             // Populate dropdowns
    //             paperTypeFilter.innerHTML = paperTypes.map(pt => `<option value="${pt}">${pt === 'all' ? 'All Types' : this.formatPaperType(pt)}</option>`).join('');
    //             courseTypeFilter.innerHTML = courseTypes.map(ct => `<option value="${ct}">${ct === 'all' ? 'All Course Types' : this.formatCourseType(ct)}</option>`).join('');
    //             // levelFilter.innerHTML = levels.map(l => `<option value="${l}">${l === 'all' ? 'All Levels' : l}</option>`).join('');
    //             specialCaseFilter.innerHTML = specialCases.map(sc => `<option value="${sc}">${sc === 'all' ? 'All Cases' : this.formatSpecialCase(sc)}</option>`).join('');

    //             console.log('Cost filters populated:', { paperTypes, courseTypes, levels, specialCases }); // Debug
    //         });
    // }

    // Refresh Cost Data
    async refreshCostData() {
        this.showLoading();
        try {
            await this.delay(1000);
            this.updateCostDisplay();
            // this.populateCostFilters();
            // if (this.currentSection === 'display-remuneration' && this.areRemunerationElementsPresent()) {
            //     this.calculateAndDisplayRemunerations();
            // }
            this.showToast('Cost data refreshed successfully!', 'success');
        } catch (error) {
            console.error('Error refreshing cost data:', error);
            this.showToast('Failed to refresh cost data', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Clear Cost Filters
    clearCostFilters() {
        const filters = ['filter-paperType', 'filter-courseType', 'filter-remuLevel', 'filter-specialCase'];
        filters.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = 'all';
        });
        this.updateCostDisplay();
        // if (this.currentSection === 'display-remuneration' && this.areRemunerationElementsPresent()) {
        //     this.calculateAndDisplayRemunerations();
        // }
        this.showToast('Cost filters cleared', 'success');
    }

    // Refresh Data
    async refreshData() {
        this.showLoading();
        try {
            await this.delay(1000);
            this.loadChairmenDropdown();
            this.renderChairmenTable();
            this.renderPaperSettersTable();
            this.updateCounts();
            this.checkChairmenAvailability();
            this.showToast('Data refreshed successfully!', 'success');
        } catch (error) {
            console.error('Error refreshing data:', error);
            this.showToast('Failed to refresh data', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Utility Methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const MobNo = /^(?:\+91|91)?[6-9]\d{9}$/;
        const cleanedPhone = phone.replace(/[\s-]/g, '');
        return MobNo.test(cleanedPhone);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Toast Notifications
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.querySelector('.toast-message');
        const toastIcon = document.querySelector('.toast-icon i');

        if (!toast || !toastMessage || !toastIcon) {
            console.error('Toast elements not found in DOM');
            return;
        }

        toastMessage.textContent = message;

        toast.className = `toast ${type}`;

        switch (type) {
            case 'success':
                toastIcon.className = 'fas fa-check-circle';
                break;
            case 'error':
                toastIcon.className = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                toastIcon.className = 'fas fa-exclamation-triangle';
                break;
            default:
                toastIcon.className = 'fas fa-info-circle';
        }

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // Loading Overlay
    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    formatPaperType(type) {
        const types = {
            'theory': 'Theory Paper',
            'model': 'Model Answer',
            'translation': 'Translation',
            'chairman': 'Chairman Allowance'
        };
        return types[type] || type;
    }

    formatCourseType(type) {
        return type === 'professional' ? 'Professional' : 'Non-Professional';
    }

    formatSpecialCase(specialCase) {
        if (!specialCase || specialCase === 'standard') return 'Standard';
        if (specialCase === 'accounting_costing') return 'Accounting & Costing';
        return specialCase;
    }

    formatDuration(duration, paperType) {
        if (!duration) return '-';
        if (paperType === 'chairman') {
            return duration.replace('-', ' to ') + ' Members';
        }
        return `${duration} hours`;
    }

    // Server Data Fetching Methods
    async fetchChairmen() {
        try {
            const response = await fetch('php/get_chairmen.php');
            if (!response.ok) throw new Error('Failed to fetch chairmen');
            return await response.json();
        } catch (error) {
            this.showToast('Error fetching chairmen', 'error');
            console.error(error);
            return [];
        }
    }

    async fetchPaperSetters() {
        try {
            const response = await fetch('php/get_paper_setters.php');
            if (!response.ok) throw new Error('Failed to fetch paper setters');
            return await response.json();
        } catch (error) {
            this.showToast('Error fetching paper setters', 'error');
            console.error(error);
            return [];
        }
    }

    async fetchSubjects() {
        try {
            const response = await fetch('php/get_subjects.php');
            if (!response.ok) throw new Error('Failed to fetch subjects');
            return await response.json();
        } catch (error) {
            this.showToast('Error fetching subjects', 'error');
            console.error(error);
            return [];
        }
    }

    async fetchCosts() {
        try {
            const response = await fetch('php/get_costs.php');
            if (!response.ok) throw new Error('Failed to fetch costs');
            return await response.json();
        } catch (error) {
            this.showToast('Error fetching costs', 'error');
            console.error(error);
            return [];
        }
    }

    async loadDataFromServer() {
        this.chairmen = await this.fetchChairmen() || [];
        this.paperSetters = await this.fetchPaperSetters() || [];
        this.subjects = await this.fetchSubjects() || [];
        this.costs = await this.fetchCosts() || [];
    }

    // Update Edit Year Options
    updateEditYearOptions() {
        const levelSelect = document.getElementById('edit-level');
        const yearSelect = document.getElementById('edit-year');
        const semesterSelect = document.getElementById('edit-semester');

        if (!levelSelect || !yearSelect || !semesterSelect) return;

        yearSelect.innerHTML = '<option value="">Select year</option>';
        semesterSelect.innerHTML = '<option value="">Select semester</option>';

        const level = levelSelect.value;
        let years = [];

        if (level === 'UG') {
            years = ['First Year', 'Second Year', 'Third Year'];
        } else if (level === 'PG') {
            years = ['First Year', 'Second Year'];
        }

        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }

    // Update Edit Semester Options
    updateEditSemesterOptions() {
        const yearSelect = document.getElementById('edit-year');
        const semesterSelect = document.getElementById('edit-semester');

        if (!yearSelect || !semesterSelect) return;

        semesterSelect.innerHTML = '<option value="">Select semester</option>';

        const year = yearSelect.value;
        let semesters = [];

        if (year) {
            semesters = ['Semester 1', 'Semester 2'];
            if (year === 'First Year' || year === 'Second Year') {
                semesters.push('Semester 3', 'Semester 4');
            }
            if (year === 'Third Year') {
                semesters.push('Semester 5', 'Semester 6');
            }
        }

        semesters.forEach(sem => {
            const option = document.createElement('option');
            option.value = sem;
            option.textContent = sem;
            semesterSelect.appendChild(option);
        });
    }

    // Update Edit Remuneration Form Fields
    updateEditRemunerationFormFields() {
        const paperTypeSelect = document.getElementById('edit-paperType');
        if (!paperTypeSelect) return;

        const paperType = paperTypeSelect.value;
        const courseTypeGroup = document.getElementById('edit-courseTypeGroup');
        const levelGroup = document.getElementById('edit-levelGroup');
        const specialCaseGroup = document.getElementById('edit-specialCaseGroup');
        const durationGroup = document.getElementById('edit-durationGroup');
        const amountGroup = document.getElementById('edit-amountGroup');
        const remuFormActions = document.getElementById('edit-remuFormActions');
        const durationSelect = document.getElementById('edit-duration');
        const durationLabel = document.getElementById('edit-durationLabel');

        if (!courseTypeGroup || !levelGroup || !specialCaseGroup || !durationGroup || !amountGroup || !remuFormActions || !durationSelect || !durationLabel) return;

        // Reset visibility
        courseTypeGroup.style.display = 'none';
        levelGroup.style.display = 'none';
        specialCaseGroup.style.display = 'none';
        durationGroup.style.display = 'none';
        amountGroup.style.display = 'none';
        remuFormActions.style.display = 'none';

        if (!paperType) return;

        amountGroup.style.display = 'block';
        remuFormActions.style.display = 'flex';

        if (paperType === 'theory' || paperType === 'model') {
            courseTypeGroup.style.display = 'block';
            levelGroup.style.display = 'block';
            durationGroup.style.display = 'block';

            durationLabel.textContent = 'Duration';
            durationSelect.innerHTML = '<option value="">Select duration</option>';
            const durations = ['1 hr', '2 hrs', '3 hrs'];
            durations.forEach(dur => {
                const option = document.createElement('option');
                option.value = dur;
                option.textContent = dur;
                durationSelect.appendChild(option);
            });

            if (paperType === 'theory') {
                specialCaseGroup.style.display = 'block';
            }
        } else if (paperType === 'translation') {
            levelGroup.style.display = 'block';
        } else if (paperType === 'chairman') {
            durationGroup.style.display = 'block';
            durationLabel.textContent = 'Number of Members';
            durationSelect.innerHTML = '<option value="">Select number of members</option>';
            for (let i = 1; i <= 10; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                durationSelect.appendChild(option);
            }
        }
    }

    // Open Edit Modal
    openEditModal(type, id) {
        const arrayMap = {
            'chairman': { array: this.chairmen, modal: 'editChairmanModal' },
            'setter': { array: this.paperSetters, modal: 'editSetterModal' },
            'subject': { array: this.subjects, modal: 'editSubjectModal' },
            'cost': { array: this.costs, modal: 'editCostModal' }
        };

        const { array, modal } = arrayMap[type] || {};
        if (!array || !modal) {
            this.showToast('Invalid record type', 'error');
            return;
        }

        const modalElement = document.getElementById(modal);
        if (!modalElement) {
            this.showToast('Modal not found', 'error');
            return;
        }

        modalElement.style.display = 'block';

        const data = array.find(item => item && item.id === id);
        if (!data) {
            this.showToast('Record not found', 'error');
            return;
        }

        const form = modalElement.querySelector('form');
        if (!form) return;

        // Pre-fill form fields
        Object.keys(data).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = data[key] || '';
            }
        });

        if (type === 'setter') {
            this.loadChairmenDropdown();
        } else if (type === 'subject') {
            this.updateEditYearOptions();
            this.updateEditSemesterOptions();
        } else if (type === 'cost') {
            this.updateEditRemunerationFormFields();
        }
    }

    // Open Confirm Delete
    openConfirmDelete(type, id) {
        this.pendingDelete = { type, id };
        const modal = document.getElementById('confirmDeleteModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // Handle Delete
    async handleDelete(type, id) {
        const deleteMap = {
            'chairman': { array: this.chairmen, endpoint: 'php/delete_chairman.php', render: this.renderChairmenTable.bind(this) },
            'setter': { array: this.paperSetters, endpoint: 'php/delete_paper_setter.php', render: this.renderPaperSettersTable.bind(this) },
            'subject': { array: this.subjects, endpoint: 'php/delete_subject.php', render: this.updateSubjectDisplay.bind(this) },
            'cost': { array: this.costs, endpoint: 'php/delete_cost.php', render: this.updateCostDisplay.bind(this) }
        };

        const { array, endpoint, render } = deleteMap[type] || {};
        if (!array || !endpoint) {
            this.showToast('Invalid delete type', 'error');
            return;
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (!response.ok) throw new Error(`Failed to delete ${type}`);

            const index = array.findIndex(item => item && item.id === id);
            if (index === -1) {
                this.showToast('Record not found', 'error');
                return;
            }

            array.splice(index, 1);
            render();
            if (type === 'chairman') {
                this.loadChairmenDropdown();
                this.updateCounts();
            } else if (type === 'setter') {
                this.updateCounts();
            } else if (type === 'subject') {
                this.populateSubjectFilters();
            } else if (type === 'cost') {
                this.populateCostFilters();
            }
            this.showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`, 'success');
        } catch (error) {
            this.showToast(`Error deleting ${type}`, 'error');
            console.error(error);
        }
    }

    // Handle Edit Chairman
    async handleEditChairman(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const chairman = {
            id: parseInt(formData.get('id')),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            department: formData.get('department'),
            qualification: formData.get('qualification') || '',
            experience: formData.get('experience') || '',
            createdAt: formData.get('createdAt') || new Date().toISOString()
        };

        if (!chairman.name || !chairman.email || !chairman.phone || !chairman.department) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (!this.isValidEmail(chairman.email)) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }

        if (!this.isValidPhone(chairman.phone)) {
            this.showToast('Please enter a valid Phone No.', 'error');
            return;
        }

        try {
            const response = await fetch('php/update_chairman.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(chairman)
            });

            if (!response.ok) throw new Error('Failed to update chairman');

            const index = this.chairmen.findIndex(c => c && c.id === chairman.id);
            if (index === -1) {
                this.showToast('Chairman not found', 'error');
                return;
            }

            this.chairmen[index] = chairman;
            this.renderChairmenTable();
            this.loadChairmenDropdown();
            this.updateCounts();
            this.closeModal('editChairmanModal');
            this.showToast('Chairman updated successfully!', 'success');
        } catch (error) {
            this.showToast('Error updating chairman', 'error');
            console.error(error);
        }
    }

    // Handle Edit Paper Setter
    async handleEditPaperSetter(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const id = parseInt(formData.get('id'));
        const chairmanId = parseInt(formData.get('chairmanId'));
        const selectedChairman = this.chairmen.find(c => c && c.id === chairmanId);

        const setter = {
            id: id,
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            faculty: formData.get('faculty'),
            qualification: formData.get('qualification') || '',
            chairmanId: chairmanId,
            chairmanName: selectedChairman ? selectedChairman.name : '',
            createdAt: formData.get('createdAt') || new Date().toISOString()
        };

        if (!setter.name || !setter.email || !setter.phone || !setter.subject || !setter.faculty || !setter.chairmanId) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (!this.isValidEmail(setter.email)) {
            this.showToast('Please enter a valid email address', 'error');
            return;
        }

        if (!this.isValidPhone(setter.phone)) {
            this.showToast('Please enter a valid Phone No.', 'error');
            return;
        }

        try {
            const response = await fetch('php/update_paper_setter.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(setter)
            });

            if (!response.ok) throw new Error('Failed to update paper setter');

            const index = this.paperSetters.findIndex(s => s && s.id === id);
            if (index === -1) {
                this.showToast('Paper Setter not found', 'error');
                return;
            }

            this.paperSetters[index] = setter;
            this.renderPaperSettersTable();
            this.updateCounts();
            this.closeModal('editSetterModal');
            this.showToast('Paper Setter updated successfully!', 'success');
        } catch (error) {
            this.showToast('Error updating paper setter', 'error');
            console.error(error);
        }
    }

    // Handle Edit Subject
    async handleEditSubject(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const subject = {
            id: parseInt(formData.get('id')),
            faculty: formData.get('faculty'),
            level: formData.get('level'),
            year: formData.get('year'),
            class: formData.get('class'),
            subject: formData.get('subject'),
            semester: formData.get('semester'),
            subjectCode: formData.get('subjectCode'),
            subjectTitle: formData.get('subjectTitle'),
            createdAt: formData.get('createdAt') || new Date().toISOString()
        };

        if (!subject.faculty || !subject.level || !subject.year || !subject.class || !subject.subject || !subject.semester || !subject.subjectCode || !subject.subjectTitle) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            const response = await fetch('php/update_subject.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subject)
            });

            if (!response.ok) throw new Error('Failed to update subject');

            const index = this.subjects.findIndex(s => s && s.id === id);
            if (index === -1) {
                this.showToast('Subject not found', 'error');
                return;
            }

            this.subjects[index] = subject;
            this.updateSubjectDisplay();
            this.populateSubjectFilters();
            this.closeModal('editSubjectModal');
            this.showToast('Subject updated successfully!', 'success');
        } catch (error) {
            this.showToast('Error updating subject', 'error');
            console.error(error);
        }
    }

    // Handle Edit Cost
    async handleEditCost(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const id = parseInt(formData.get('id'));
        const amount = parseFloat(formData.get('amount'));
        if (isNaN(amount) || amount <= 0) {
            this.showToast('Please enter a valid positive amount', 'error');
            return;
        }

        const remuneration = {
            id: id,
            paperType: formData.get('paperType'),
            courseType: formData.get('courseType') || '',
            level: formData.get('level') || '',
            specialCase: formData.get('specialCase') || '',
            duration: formData.get('duration') || '',
            amount: amount,
            createdAt: formData.get('createdAt') || new Date().toISOString()
        };

        if (!remuneration.paperType || !remuneration.amount) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if ((remuneration.paperType === 'theory' || remuneration.paperType === 'model') && (!remuneration.courseType || !remuneration.level || !remuneration.duration)) {
            this.showToast('Please fill in all required fields for theory/model', 'error');
            return;
        }

        if (remuneration.paperType === 'translation' && !remuneration.level) {
            this.showToast('Please select an academic level for translation', 'error');
            return;
        }

        if (remuneration.paperType === 'chairman' && !remuneration.duration) {
            this.showToast('Please select number of members for chairman allowance', 'error');
            return;
        }

        try {
            const response = await fetch('php/update_cost.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(remuneration)
            });

            if (!response.ok) throw new Error('Failed to update cost');

            const index = this.costs.findIndex(c => c && c.id === id);
            if (index === -1) {
                this.showToast('Cost not found', 'error');
                return;
            }

            this.costs[index] = remuneration;
            this.updateCostDisplay();
            this.populateCostFilters();
            this.closeModal('editCostModal');
            this.showToast('Remuneration updated successfully!', 'success');
        } catch (error) {
            this.showToast('Error updating cost', 'error');
            console.error(error);
        }
    }

    // Close Modal
    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.style.display = 'none';
        }
    }
}


// Initialize the admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.adminPanel = new AdminPanel();
    } catch (error) {
        console.error('Failed to initialize AdminPanel:', error);
    }
});
    