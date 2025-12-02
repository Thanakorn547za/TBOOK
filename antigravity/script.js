// Student Management System with CRUD Operations
// Using LocalStorage for data persistence

class StudentManager {
    constructor() {
        this.students = this.loadStudents();
        this.editingId = null;
        this.init();
    }

    // Initialize the application
    init() {
        this.renderTable();
        this.attachEventListeners();
    }

    // Load students from localStorage
    loadStudents() {
        const data = localStorage.getItem('students');
        return data ? JSON.parse(data) : [];
    }

    // Save students to localStorage
    saveStudents() {
        localStorage.setItem('students', JSON.stringify(this.students));
    }

    // Attach event listeners
    attachEventListeners() {
        const form = document.getElementById('studentForm');
        const searchInput = document.getElementById('searchInput');

        form.addEventListener('submit', (e) => this.handleSubmit(e));
        searchInput.addEventListener('input', (e) => this.handleSearch(e));
    }

    // Handle form submission (Create & Update)
    handleSubmit(e) {
        e.preventDefault();

        const studentId = document.getElementById('studentId').value.trim();
        const fullName = document.getElementById('fullName').value.trim();
        const major = document.getElementById('major').value;
        const gpa = parseFloat(document.getElementById('gpa').value);

        // Validate GPA
        if (gpa < 0 || gpa > 4) {
            this.showToast('กรุณาระบุเกรดเฉลี่ยระหว่าง 0.00 - 4.00', 'error');
            return;
        }

        if (this.editingId !== null) {
            // Update existing student
            this.updateStudent(this.editingId, studentId, fullName, major, gpa);
        } else {
            // Check if student ID already exists
            if (this.students.some(s => s.id === studentId)) {
                this.showToast('รหัสนักศึกษานี้มีอยู่ในระบบแล้ว', 'error');
                return;
            }
            // Add new student
            this.addStudent(studentId, fullName, major, gpa);
        }
    }

    // Create - Add new student
    addStudent(id, name, major, gpa) {
        const student = {
            id: id,
            name: name,
            major: major,
            gpa: gpa,
            createdAt: new Date().toISOString()
        };

        this.students.push(student);
        this.saveStudents();
        this.renderTable();
        this.resetForm();
        this.showToast('เพิ่มข้อมูลนักศึกษาเรียบร้อยแล้ว', 'success');
    }

    // Read - Render table
    renderTable(filteredStudents = null) {
        const tbody = document.querySelector('#studentTable tbody');
        const noDataDiv = document.getElementById('noData');
        const studentsToRender = filteredStudents || this.students;

        // Clear table
        tbody.innerHTML = '';

        if (studentsToRender.length === 0) {
            noDataDiv.style.display = 'block';
            tbody.closest('table').style.display = 'none';
        } else {
            noDataDiv.style.display = 'none';
            tbody.closest('table').style.display = 'table';

            studentsToRender.forEach((student) => {
                const row = this.createTableRow(student);
                tbody.appendChild(row);
            });
        }
    }

    // Create table row
    createTableRow(student) {
        const tr = document.createElement('tr');
        tr.style.animation = 'fadeInUp 0.5s ease-out';

        tr.innerHTML = `
            <td><strong>${this.escapeHtml(student.id)}</strong></td>
            <td>${this.escapeHtml(student.name)}</td>
            <td>${this.escapeHtml(student.major)}</td>
            <td><span style="color: ${this.getGPAColor(student.gpa)}">${student.gpa.toFixed(2)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="studentManager.editStudent('${student.id}')" title="แก้ไข">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="studentManager.confirmDelete('${student.id}')" title="ลบ">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        return tr;
    }

    // Update - Edit student
    editStudent(id) {
        const student = this.students.find(s => s.id === id);
        if (!student) return;

        // Populate form with student data
        document.getElementById('studentId').value = student.id;
        document.getElementById('fullName').value = student.name;
        document.getElementById('major').value = student.major;
        document.getElementById('gpa').value = student.gpa;

        // Disable student ID field when editing
        document.getElementById('studentId').disabled = true;

        // Update button text
        const submitBtn = document.querySelector('.btn-primary');
        submitBtn.innerHTML = '<i class="fa-solid fa-save"></i> อัปเดตข้อมูล';
        submitBtn.style.background = 'linear-gradient(135deg, #f59e0b, #ef4444)';

        // Add cancel button if not exists
        if (!document.getElementById('cancelEdit')) {
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.id = 'cancelEdit';
            cancelBtn.className = 'btn-primary';
            cancelBtn.innerHTML = '<i class="fa-solid fa-times"></i> ยกเลิก';
            cancelBtn.style.background = '#6b7280';
            cancelBtn.style.marginTop = '0.5rem';
            cancelBtn.onclick = () => this.cancelEdit();
            submitBtn.parentElement.appendChild(cancelBtn);
        }

        this.editingId = id;

        // Scroll to form
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Update student data
    updateStudent(oldId, newId, name, major, gpa) {
        const index = this.students.findIndex(s => s.id === oldId);
        if (index === -1) return;

        this.students[index] = {
            ...this.students[index],
            name: name,
            major: major,
            gpa: gpa,
            updatedAt: new Date().toISOString()
        };

        this.saveStudents();
        this.renderTable();
        this.resetForm();
        this.showToast('อัปเดตข้อมูลนักศึกษาเรียบร้อยแล้ว', 'success');
    }

    // Delete - Remove student with confirmation
    confirmDelete(id) {
        const student = this.students.find(s => s.id === id);
        if (!student) return;

        if (confirm(`คุณต้องการลบข้อมูลของ ${student.name} (${student.id}) ใช่หรือไม่?`)) {
            this.deleteStudent(id);
        }
    }

    // Delete student
    deleteStudent(id) {
        this.students = this.students.filter(s => s.id !== id);
        this.saveStudents();
        this.renderTable();
        this.showToast('ลบข้อมูลนักศึกษาเรียบร้อยแล้ว', 'success');
    }

    // Cancel edit
    cancelEdit() {
        this.resetForm();
    }

    // Reset form
    resetForm() {
        document.getElementById('studentForm').reset();
        document.getElementById('studentId').disabled = false;

        const submitBtn = document.querySelector('.btn-primary');
        submitBtn.innerHTML = '<i class="fa-solid fa-save"></i> บันทึกข้อมูล';
        submitBtn.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';

        const cancelBtn = document.getElementById('cancelEdit');
        if (cancelBtn) {
            cancelBtn.remove();
        }

        this.editingId = null;
    }

    // Search functionality
    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (searchTerm === '') {
            this.renderTable();
        } else {
            const filtered = this.students.filter(student =>
                student.id.toLowerCase().includes(searchTerm) ||
                student.name.toLowerCase().includes(searchTerm) ||
                student.major.toLowerCase().includes(searchTerm)
            );
            this.renderTable(filtered);
        }
    }

    // Get GPA color based on value
    getGPAColor(gpa) {
        if (gpa >= 3.5) return '#10b981'; // Green
        if (gpa >= 3.0) return '#3b82f6'; // Blue
        if (gpa >= 2.5) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show toast notification
    showToast(message, type = 'success') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is ready
let studentManager;
document.addEventListener('DOMContentLoaded', () => {
    studentManager = new StudentManager();
});
