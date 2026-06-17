/**
 * NEXUS AI - Model Maker System
 * মডেল তৈরির সম্পূর্ণ সিস্টেম
 */

/**
 * ============================================
 * MODEL MAKER - কোড জেনারেটর
 * ============================================
 */

class ModelMaker {
    constructor() {
        this.models = new Map();
        this.currentModel = null;
        this.templates = new Map();
        this.history = [];
        
        this.initTemplates();
        this.init();
    }
    
    init() {
        console.log('[Model Maker] NEXUS AI Model System Initialized');
        console.log('[Model Maker] Available Models:', this.getModelList());
    }
    
    /**
     * Initialize all code templates
     */
    initTemplates() {
        // CSS Templates
        this.templates.set('css', {
            // Dark Theme
            darkTheme: {
                name: 'Dark Theme',
                description: 'সুন্দর ডার্ক থিম',
                code: `/* Dark Theme - NEXUS AI */
:root {
    --bg-primary: #0a0a0f;
    --bg-secondary: #1a1a2e;
    --text-primary: #e8e8f0;
    --accent: #00f0ff;
    --accent-secondary: #ff00ff;
}

body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Segoe UI', sans-serif;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.btn {
    background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    color: white;
    font-weight: bold;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
}`
            },
            
            // Glassmorphism
            glass: {
                name: 'Glass Effect',
                description: 'গ্লাস মর্ফিজম ইফেক্ট',
                code: `/* Glassmorphism - NEXUS AI */
.glass-panel {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.glass-card {
    background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.15) 0%,
        rgba(255, 255, 255, 0.05) 100%);
    backdrop-filter: blur(15px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 25px;
    transition: all 0.3s ease;
}

.glass-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 240, 255, 0.2);
}`
            },
            
            // Cyberpunk
            cyber: {
                name: 'Cyberpunk UI',
                description: 'সাইবারপাঙ্ক স্টাইল',
                code: `/* Cyberpunk UI - NEXUS AI */
:root {
    --cyan: #00f0ff;
    --magenta: #ff00ff;
    --gold: #ffa500;
    --neon-green: #00ff88;
}

.cyber-text {
    color: var(--cyan);
    text-shadow: 0 0 10px var(--cyan);
    font-family: 'Orbitron', sans-serif;
    letter-spacing: 2px;
}

.cyber-border {
    border: 2px solid var(--cyan);
    box-shadow: 
        0 0 10px var(--cyan),
        inset 0 0 10px rgba(0, 240, 255, 0.1);
    animation: borderPulse 2s ease-in-out infinite;
}

@keyframes borderPulse {
    0%, 100% { box-shadow: 0 0 10px var(--cyan); }
    50% { box-shadow: 0 0 25px var(--cyan), 0 0 50px var(--magenta); }
}

.cyber-btn {
    background: transparent;
    border: 2px solid var(--cyan);
    color: var(--cyan);
    padding: 15px 30px;
    font-family: 'Orbitron', sans-serif;
    text-transform: uppercase;
    position: relative;
    overflow: hidden;
    cursor: pointer;
}

.cyber-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, var(--cyan), transparent);
    transition: left 0.5s;
}

.cyber-btn:hover::before {
    left: 100%;
}`
            },
            
            // Responsive Grid
            responsive: {
                name: 'Responsive Grid',
                description: 'রেসপন্সিভ গ্রিড লেআউট',
                code: `/* Responsive Grid - NEXUS AI */
.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    padding: 20px;
}

.grid-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    transition: transform 0.3s ease;
}

.grid-item:hover {
    transform: scale(1.02);
}

@media (max-width: 768px) {
    .grid-container {
        grid-template-columns: 1fr;
    }
    
    .sidebar {
        display: none;
    }
}`
            },
            
            // Animation
            animations: {
                name: 'CSS Animations',
                description: 'সুন্দর অ্যানিমেশন',
                code: `/* CSS Animations - NEXUS AI */

/* Fade In */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-in {
    animation: fadeIn 0.5s ease forwards;
}

/* Pulse */
@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.pulse {
    animation: pulse 2s ease-in-out infinite;
}

/* Rotate */
@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

.rotate {
    animation: rotate 3s linear infinite;
}

/* Float */
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
}

.float {
    animation: float 3s ease-in-out infinite;
}`
            }
        });
        
        // HTML Templates
        this.templates.set('html', {
            // Basic Page
            basicPage: {
                name: 'Basic HTML Page',
                description: 'বেসিক HTML পেজ',
                code: `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="header">
        <nav class="navbar">
            <a href="#" class="logo">Logo</a>
            <ul class="nav-links">
                <li><a href="#home">হোম</a></li>
                <li><a href="#about">আমাদের সম্পর্কে</a></li>
                <li><a href="#services">সেবাসমূহ</a></li>
                <li><a href="#contact">যোগাযোগ</a></li>
            </ul>
        </nav>
    </header>
    
    <main class="main-content">
        <section id="home" class="hero">
            <h1>স্বাগতম!</h1>
            <p>আমাদের ওয়েবসাইটে আপনাকে স্বাগতম জানাই</p>
            <button class="btn">শুরু করুন</button>
        </section>
    </main>
    
    <footer class="footer">
        <p>&copy; 2024 সর্বস্বত্ব সংরক্ষিত</p>
    </footer>
</body>
</html>`
            },
            
            // Dashboard
            dashboard: {
                name: 'Dashboard Layout',
                description: 'ড্যাশবোর্ড লেআউট',
                code: `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="dashboard">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <h2>Menu</h2>
            </div>
            <nav class="sidebar-nav">
                <a href="#" class="nav-item active">Dashboard</a>
                <a href="#" class="nav-item">Users</a>
                <a href="#" class="nav-item">Settings</a>
                <a href="#" class="nav-item">Reports</a>
            </nav>
        </aside>
        
        <!-- Main Content -->
        <main class="content">
            <header class="content-header">
                <h1>Dashboard</h1>
                <button class="btn">+ Add New</button>
            </header>
            
            <div class="cards-grid">
                <div class="card">
                    <h3>Total Users</h3>
                    <p class="card-number">1,234</p>
                </div>
                <div class="card">
                    <h3>Revenue</h3>
                    <p class="card-number">$5,678</p>
                </div>
                <div class="card">
                    <h3>Orders</h3>
                    <p class="card-number">89</p>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`
            },
            
            // Portfolio
            portfolio: {
                name: 'Portfolio Website',
                description: 'পোর্টফোলিও ওয়েবসাইট',
                code: `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <h1>আমি একজন ডেভেলপার</h1>
            <p>আমি ওয়েব এবং মোবাইল অ্যাপ্লিকেশন তৈরি করি</p>
            <div class="hero-buttons">
                <a href="#projects" class="btn primary">প্রজেক্ট দেখুন</a>
                <a href="#contact" class="btn secondary">যোগাযোগ করুন</a>
            </div>
        </div>
    </section>
    
    <!-- Projects -->
    <section id="projects" class="projects">
        <h2>আমার প্রজেক্টসমূহ</h2>
        <div class="projects-grid">
            <div class="project-card">
                <img src="project1.jpg" alt="Project 1">
                <h3>E-Commerce Website</h3>
                <p>অনলাইন শপিং সাইট</p>
            </div>
            <div class="project-card">
                <img src="project2.jpg" alt="Project 2">
                <h3>Mobile App</h3>
                <p>ফুড ডেলিভারি অ্যাপ</p>
            </div>
            <div class="project-card">
                <img src="project3.jpg" alt="Project 3">
                <h3>Dashboard</h3>
                <p>অ্যাডমিন প্যানেল</p>
            </div>
        </div>
    </section>
    
    <!-- Contact -->
    <section id="contact" class="contact">
        <h2>যোগাযোগ করুন</h2>
        <form class="contact-form">
            <input type="text" placeholder="আপনার নাম">
            <input type="email" placeholder="ইমেইল">
            <textarea placeholder="আপনার বার্তা"></textarea>
            <button type="submit" class="btn primary">পাঠান</button>
        </form>
    </section>
</body>
</html>`
            }
        });
        
        // JavaScript Templates
        this.templates.set('js', {
            // Calculator
            calculator: {
                name: 'Calculator',
                description: 'ক্যালকুলেটর',
                code: `// Calculator - NEXUS AI
class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
    }
    
    inputDigit(digit) {
        if (this.waitingForOperand) {
            this.currentValue = digit;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
        }
        this.updateDisplay();
    }
    
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }
    
    clear() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForOperand = false;
        this.updateDisplay();
    }
    
    performOperation(nextOperator) {
        const inputValue = parseFloat(this.currentValue);
        
        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operator) {
            const result = this.calculate(this.previousValue, inputValue, this.operator);
            this.currentValue = String(result);
            this.previousValue = result;
        }
        
        this.waitingForOperand = true;
        this.operator = nextOperator;
    }
    
    calculate(firstOperand, secondOperand, operator) {
        switch (operator) {
            case '+': return firstOperand + secondOperand;
            case '-': return firstOperand - secondOperand;
            case '*': return firstOperand * secondOperand;
            case '/': return firstOperand / secondOperand;
            default: return secondOperand;
        }
    }
    
    updateDisplay() {
        this.display.value = this.currentValue;
    }
}

// Initialize
const calc = new Calculator();`
            },
            
            // Todo App
            todoApp: {
                name: 'Todo Application',
                description: 'টুডু অ্যাপ',
                code: `// Todo App - NEXUS AI
class TodoApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.taskInput = document.getElementById('taskInput');
        this.taskList = document.getElementById('taskList');
        this.render();
    }
    
    addTask(taskText) {
        if (!taskText.trim()) return;
        
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date()
        };
        
        this.tasks.push(task);
        this.save();
        this.render();
    }
    
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.save();
            this.render();
        }
    }
    
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
        this.render();
    }
    
    save() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
    
    render() {
        this.taskList.innerHTML = this.tasks.map(task => \`
            <li class="\${task.completed ? 'completed' : ''}">
                <input type="checkbox" 
                    \${task.completed ? 'checked' : ''} 
                    onchange="todo.toggleTask(\${task.id})">
                <span>\${task.text}</span>
                <button onclick="todo.deleteTask(\${task.id})">Delete</button>
            </li>
        \`).join('');
    }
}

const todo = new TodoApp();`
            },
            
            // API Request
            apiRequest: {
                name: 'API Request',
                description: 'API রিকোয়েস্ট',
                code: `// API Request - NEXUS AI
class APIRequest {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }
    
    async get(endpoint) {
        try {
            const response = await fetch(\`\${this.baseURL}\${endpoint}\`);
            if (!response.ok) throw new Error('Request failed');
            return await response.json();
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    }
    
    async post(endpoint, data) {
        try {
            const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Request failed');
            return await response.json();
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    }
    
    async put(endpoint, data) {
        try {
            const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Request failed');
            return await response.json();
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    }
    
    async delete(endpoint) {
        try {
            const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Request failed');
            return true;
        } catch (error) {
            console.error('DELETE Error:', error);
            throw error;
        }
    }
}

// Usage
const api = new APIRequest('https://api.example.com');

// Get request
api.get('/users').then(data => console.log(data));

// Post request
api.post('/users', { name: 'John', email: 'john@example.com' })
    .then(data => console.log(data));`
            },
            
            // Form Validation
            formValidation: {
                name: 'Form Validation',
                description: 'ফর্ম ভ্যালিডেশন',
                code: `// Form Validation - NEXUS AI
class FormValidator {
    constructor(form) {
        this.form = form;
        this.errors = {};
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    validateField(field) {
        const value = field.value.trim();
        const rules = field.dataset.rules?.split('|') || [];
        
        for (const rule of rules) {
            const [ruleName, ruleValue] = rule.split(':');
            
            switch (ruleName) {
                case 'required':
                    if (!value) return 'এই field আবশ্যক';
                    break;
                    
                case 'minlength':
                    if (value.length < parseInt(ruleValue)) {
                        return \`কমপক্ষে \${ruleValue} অক্ষর হতে হবে\`;
                    }
                    break;
                    
                case 'email':
                    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
                    if (!emailRegex.test(value)) {
                        return 'সঠিক ইমেইল দিন';
                    }
                    break;
                    
                case 'phone':
                    const phoneRegex = /^01[3-9]\\d{8}$/;
                    if (!phoneRegex.test(value)) {
                        return 'সঠিক মোবাইল নম্বর দিন';
                    }
                    break;
            }
        }
        
        return null;
    }
    
    validate() {
        this.errors = {};
        const fields = this.form.querySelectorAll('[data-rules]');
        
        fields.forEach(field => {
            const error = this.validateField(field);
            if (error) {
                this.errors[field.name] = error;
                this.showError(field, error);
            } else {
                this.clearError(field);
            }
        });
        
        return Object.keys(this.errors).length === 0;
    }
    
    showError(field, message) {
        field.classList.add('error');
        const errorEl = field.nextElementSibling;
        if (errorEl?.classList.contains('error-message')) {
            errorEl.textContent = message;
        }
    }
    
    clearError(field) {
        field.classList.remove('error');
    }
    
    handleSubmit(e) {
        e.preventDefault();
        if (this.validate()) {
            // Submit form
            console.log('Form submitted successfully');
        }
    }
}

// Usage
const validator = new FormValidator(document.getElementById('myForm'));`
            }
        });
        
        // C++ Templates
        this.templates.set('cpp', {
            // Basic Class
            basicClass: {
                name: 'C++ Basic Class',
                description: 'সাধারণ C++ ক্লাস',
                code: `// C++ Class - NEXUS AI
#include <iostream>
#include <string>
#include <vector>

class Student {
private:
    std::string name;
    int age;
    double gpa;

public:
    // Constructor
    Student(std::string n, int a, double g) 
        : name(n), age(a), gpa(g) {}
    
    // Getter methods
    std::string getName() const { return name; }
    int getAge() const { return age; }
    double getGPA() const { return gpa; }
    
    // Setter methods
    void setName(std::string n) { name = n; }
    void setAge(int a) { age = a; }
    void setGPA(double g) { gpa = g; }
    
    // Display function
    void display() const {
        std::cout << "Name: " << name << std::endl;
        std::cout << "Age: " << age << std::endl;
        std::cout << "GPA: " << gpa << std::endl;
    }
};

int main() {
    Student s("রহিম", 20, 3.75);
    s.display();
    return 0;
}`
            },
            
            // Data Structure
            dataStructure: {
                name: 'Data Structure',
                description: 'ডেটা স্ট্রাকচার',
                code: `// C++ Data Structures - NEXUS AI
#include <iostream>
#include <vector>
#include <stack>
#include <queue>
#include <map>

template<typename T>
class Stack {
private:
    std::vector<T> data;
    
public:
    void push(T item) {
        data.push_back(item);
    }
    
    T pop() {
        if (data.empty()) {
            throw std::out_of_range("Stack is empty");
        }
        T item = data.back();
        data.pop_back();
        return item;
    }
    
    T& top() {
        return data.back();
    }
    
    bool isEmpty() const {
        return data.empty();
    }
    
    size_t size() const {
        return data.size();
    }
};

int main() {
    Stack<int> s;
    s.push(10);
    s.push(20);
    s.push(30);
    
    while (!s.isEmpty()) {
        std::cout << s.top() << " ";
        s.pop();
    }
    
    return 0;
}`
            },
            
            // Algorithm
            algorithm: {
                name: 'Sorting Algorithm',
                description: 'সর্টিং অ্যালগরিদম',
                code: `// C++ Sorting Algorithms - NEXUS AI
#include <iostream>
#include <vector>
#include <algorithm>

// Bubble Sort
void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n-1; i++) {
        for (int j = 0; j < n-i-1; j++) {
            if (arr[j] > arr[j+1]) {
                std::swap(arr[j], arr[j+1]);
            }
        }
    }
}

// Quick Sort
int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i+1], arr[high]);
    return i+1;
}

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

// Print Array
void printArray(const std::vector<int>& arr) {
    for (int num : arr) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
}

int main() {
    std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    
    std::cout << "Original Array: ";
    printArray(arr);
    
    bubbleSort(arr);
    std::cout << "Bubble Sorted: ";
    printArray(arr);
    
    return 0;
}`
            },
            
            // File Handling
            fileHandling: {
                name: 'File Handling',
                description: 'ফাইল হ্যান্ডলিং',
                code: `// C++ File Handling - NEXUS AI
#include <iostream>
#include <fstream>
#include <string>
#include <vector>

class FileHandler {
private:
    std::string filename;
    
public:
    FileHandler(std::string name) : filename(name) {}
    
    // Write to file
    bool write(const std::string& content) {
        std::ofstream file(filename);
        if (file.is_open()) {
            file << content;
            file.close();
            return true;
        }
        return false;
    }
    
    // Read from file
    std::string read() {
        std::string content;
        std::ifstream file(filename);
        
        if (file.is_open()) {
            std::string line;
            while (getline(file, line)) {
                content += line + "\\n";
            }
            file.close();
        }
        return content;
    }
    
    // Append to file
    bool append(const std::string& content) {
        std::ofstream file(filename, std::ios::app);
        if (file.is_open()) {
            file << content;
            file.close();
            return true;
        }
        return false;
    }
    
    // Read lines into vector
    std::vector<std::string> readLines() {
        std::vector<std::string> lines;
        std::ifstream file(filename);
        
        if (file.is_open()) {
            std::string line;
            while (getline(file, line)) {
                lines.push_back(line);
            }
            file.close();
        }
        return lines;
    }
};

int main() {
    FileHandler file("data.txt");
    
    // Write
    file.write("Hello World\\n");
    file.append("This is a test\\n");
    
    // Read
    std::string content = file.read();
    std::cout << content;
    
    return 0;
}`
            },
            
            // OOP Example
            oop: {
                name: 'OOP Example',
                description: 'অবজেক্ট ওরিয়েন্টেড প্রোগ্রামিং',
                code: `// C++ OOP - NEXUS AI
#include <iostream>
#include <string>
#include <vector>

// Base Class
class Animal {
protected:
    std::string name;
    int age;

public:
    Animal(std::string n, int a) : name(n), age(a) {}
    
    virtual void speak() = 0;
    virtual ~Animal() {}
};

// Derived Class - Dog
class Dog : public Animal {
private:
    std::string breed;

public:
    Dog(std::string n, int a, std::string b) 
        : Animal(n, a), breed(b) {}
    
    void speak() override {
        std::cout << name << " says: Woof! Woof!" << std::endl;
    }
    
    void fetch() {
        std::cout << name << " is fetching the ball!" << std::endl;
    }
};

// Derived Class - Cat
class Cat : public Animal {
public:
    Cat(std::string n, int a) : Animal(n, a) {}
    
    void speak() override {
        std::cout << name << " says: Meow! Meow!" << std::endl;
    }
    
    void purr() {
        std::cout << name << " is purring..." << std::endl;
    }
};

int main() {
    std::vector<Animal*> animals;
    
    animals.push_back(new Dog("Buddy", 3, "Golden Retriever"));
    animals.push_back(new Cat("Whiskers", 2));
    animals.push_back(new Dog("Max", 5, "German Shepherd"));
    
    for (auto animal : animals) {
        animal->speak();
    }
    
    // Clean up
    for (auto animal : animals) {
        delete animal;
    }
    
    return 0;
}`
            }
        });
        
        console.log('[Model Maker] Templates loaded:', this.templates.size);
    }
    
    /**
     * Get model list
     */
    getModelList() {
        const models = [];
        for (const [category, templates] of this.templates) {
            for (const [key, template] of templates) {
                models.push({
                    category,
                    key,
                    name: template.name,
                    description: template.description
                });
            }
        }
        return models;
    }
    
    /**
     * Generate code
     */
    generate(category, templateKey) {
        const templates = this.templates.get(category);
        if (!templates) return null;
        
        const template = templates[templateKey];
        if (!template) return null;
        
        // Add to history
        this.history.push({
            category,
            template: templateKey,
            timestamp: Date.now()
        });
        
        return {
            name: template.name,
            description: template.description,
            code: template.code
        };
    }
    
    /**
     * Generate custom code
     */
    generateCustom(prompt) {
        // This will use AI to generate custom code
        return {
            name: 'Custom Code',
            description: 'AI Generated',
            code: \`// Custom code for: \${prompt}
// Generated by NEXUS AI Model Maker
\`
        };
    }
}

// Create global instance
window.modelMaker = new ModelMaker();

// Export
window.ModelMaker = ModelMaker;