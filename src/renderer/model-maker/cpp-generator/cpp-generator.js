/**
 * NEXUS AI - C++ Code Generator
 * C++ কোড জেনারেটর
 */

class CPPGenerator {
    constructor() {
        this.templates = new Map();
        this.init();
    }
    
    init() {
        // Basic Class
        this.templates.set('class', {
            name: 'C++ Class',
            description: 'সাধারণ ক্লাস',
            code: `// C++ Class - NEXUS AI
#include <iostream>
#include <string>

class Student {
private:
    std::string name;
    int age;
    double gpa;

public:
    // Constructor
    Student(const std::string& n, int a, double g) 
        : name(n), age(a), gpa(g) {}
    
    // Getter methods
    std::string getName() const { return name; }
    int getAge() const { return age; }
    double getGPA() const { return gpa; }
    
    // Setter methods
    void setName(const std::string& n) { name = n; }
    void setAge(int a) { age = a; }
    void setGPA(double g) { gpa = g; }
    
    // Display
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
        });
        
        // Data Structures
        this.templates.set('datastructure', {
            name: 'Data Structures',
            description: 'লিংকড লিস্ট, স্ট্যাক, কিউ',
            code: `// Data Structures - NEXUS AI
#include <iostream>
#include <vector>
#include <stack>
#include <queue>
#include <list>

// Linked List
template<typename T>
class LinkedList {
private:
    struct Node {
        T data;
        Node* next;
        Node(const T& d) : data(d), next(nullptr) {}
    };
    Node* head;
    
public:
    LinkedList() : head(nullptr) {}
    
    void push_front(const T& value) {
        Node* newNode = new Node(value);
        newNode->next = head;
        head = newNode;
    }
    
    void push_back(const T& value) {
        Node* newNode = new Node(value);
        if (!head) {
            head = newNode;
            return;
        }
        Node* temp = head;
        while (temp->next) temp = temp->next;
        temp->next = newNode;
    }
    
    void display() {
        Node* temp = head;
        while (temp) {
            std::cout << temp->data << " -> ";
            temp = temp->next;
        }
        std::cout << "NULL" << std::endl;
    }
    
    ~LinkedList() {
        while (head) {
            Node* temp = head;
            head = head->next;
            delete temp;
        }
    }
};

// Stack
template<typename T>
class Stack {
private:
    std::vector<T> data;
    
public:
    void push(const T& value) { data.push_back(value); }
    void pop() { if (!data.empty()) data.pop_back(); }
    T& top() { return data.back(); }
    bool isEmpty() const { return data.empty(); }
    size_t size() const { return data.size(); }
};

// Queue
template<typename T>
class Queue {
private:
    std::deque<T> data;
    
public:
    void enqueue(const T& value) { data.push_back(value); }
    void dequeue() { if (!data.empty()) data.pop_front(); }
    T& front() { return data.front(); }
    bool isEmpty() const { return data.empty(); }
    size_t size() const { return data.size(); }
};

int main() {
    // Linked List Demo
    LinkedList<int> list;
    list.push_back(10);
    list.push_front(5);
    list.display();
    
    // Stack Demo
    Stack<int> stack;
    stack.push(1);
    stack.push(2);
    stack.push(3);
    std::cout << "Top: " << stack.top() << std::endl;
    
    // Queue Demo
    Queue<int> queue;
    queue.enqueue(1);
    queue.enqueue(2);
    std::cout << "Front: " << queue.front() << std::endl;
    
    return 0;
}`
        });
        
        // Algorithms
        this.templates.set('algorithm', {
            name: 'Algorithms',
            description: 'সর্টিং এবং সার্চিং',
            code: `// Algorithms - NEXUS AI
#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>

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
    return i + 1;
}

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

// Binary Search
int binarySearch(const std::vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    
    return -1;
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
    
    std::cout << "Original: ";
    printArray(arr);
    
    bubbleSort(arr);
    std::cout << "Bubble Sort: ";
    printArray(arr);
    
    // Reset and Quick Sort
    arr = {64, 34, 25, 12, 22, 11, 90};
    quickSort(arr, 0, arr.size() - 1);
    std::cout << "Quick Sort: ";
    printArray(arr);
    
    // Binary Search
    int index = binarySearch(arr, 25);
    std::cout << "Found 25 at index: " << index << std::endl;
    
    return 0;
}`
        });
        
        // File Handling
        this.templates.set('file', {
            name: 'File Handling',
            description: 'ফাইল রিড/রাইট',
            code: `// File Handling - NEXUS AI
#include <iostream>
#include <fstream>
#include <string>
#include <vector>

class FileHandler {
private:
    std::string filename;
    
public:
    FileHandler(const std::string& name) : filename(name) {}
    
    bool write(const std::string& content) {
        std::ofstream file(filename);
        if (file.is_open()) {
            file << content;
            file.close();
            return true;
        }
        std::cerr << "Error: Cannot open file for writing" << std::endl;
        return false;
    }
    
    std::string read() {
        std::string content, line;
        std::ifstream file(filename);
        
        if (file.is_open()) {
            while (getline(file, line)) {
                content += line + "\\n";
            }
            file.close();
        } else {
            std::cerr << "Error: Cannot open file for reading" << std::endl;
        }
        return content;
    }
    
    bool append(const std::string& content) {
        std::ofstream file(filename, std::ios::app);
        if (file.is_open()) {
            file << content;
            file.close();
            return true;
        }
        return false;
    }
    
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
    
    int countLines() {
        int count = 0;
        std::ifstream file(filename);
        std::string line;
        
        if (file.is_open()) {
            while (getline(file, line)) {
                count++;
            }
            file.close();
        }
        return count;
    }
};

int main() {
    FileHandler file("data.txt");
    
    // Write
    if (file.write("Hello World!\\nThis is NEXUS AI.\\n")) {
        std::cout << "File written successfully!" << std::endl;
    }
    
    // Append
    file.append("Appended text.\\n");
    
    // Read
    std::cout << "File content:\\n" << file.read() << std::endl;
    
    // Count lines
    std::cout << "Total lines: " << file.countLines() << std::endl;
    
    // Read as lines
    std::cout << "Lines:\\n";
    for (const auto& line : file.readLines()) {
        std::cout << "- " << line << std::endl;
    }
    
    return 0;
}`
        });
        
        // OOP
        this.templates.set('oop', {
            name: 'OOP Example',
            description: 'অবজেক্ট ওরিয়েন্টেড',
            code: `// OOP Example - NEXUS AI
#include <iostream>
#include <string>
#include <vector>

// Abstract Base Class
class Shape {
protected:
    std::string color;
    
public:
    Shape(const std::string& c = "white") : color(c) {}
    virtual double area() const = 0;
    virtual double perimeter() const = 0;
    virtual void display() const = 0;
    virtual ~Shape() {}
};

// Derived Class - Rectangle
class Rectangle : public Shape {
private:
    double width, height;
    
public:
    Rectangle(double w, double h, const std::string& c = "blue") 
        : Shape(c), width(w), height(h) {}
    
    double area() const override {
        return width * height;
    }
    
    double perimeter() const override {
        return 2 * (width + height);
    }
    
    void display() const override {
        std::cout << "Rectangle: " << width << " x " << height 
                  << ", Area: " << area() << std::endl;
    }
};

// Derived Class - Circle
class Circle : public Shape {
private:
    double radius;
    static const double PI = 3.14159;
    
public:
    Circle(double r, const std::string& c = "red") 
        : Shape(c), radius(r) {}
    
    double area() const override {
        return PI * radius * radius;
    }
    
    double perimeter() const override {
        return 2 * PI * radius;
    }
    
    void display() const override {
        std::cout << "Circle: radius " << radius 
                  << ", Area: " << area() << std::endl;
    }
};

// Derived Class - Triangle
class Triangle : public Shape {
private:
    double a, b, c;
    
public:
    Triangle(double x, double y, double z, const std::string& c = "green") 
        : Shape(c), a(x), b(y), c(z) {}
    
    double area() const override {
        double s = (a + b + c) / 2;
        return sqrt(s * (s-a) * (s-b) * (s-c));
    }
    
    double perimeter() const override {
        return a + b + c;
    }
    
    void display() const override {
        std::cout << "Triangle: sides " << a << ", " << b << ", " << c
                  << ", Area: " << area() << std::endl;
    }
};

// Shape Manager
class ShapeManager {
private:
    std::vector<Shape*> shapes;
    
public:
    void addShape(Shape* shape) {
        shapes.push_back(shape);
    }
    
    double totalArea() const {
        double total = 0;
        for (const auto& shape : shapes) {
            total += shape->area();
        }
        return total;
    }
    
    void displayAll() const {
        std::cout << "\\n=== All Shapes ===" << std::endl;
        for (const auto& shape : shapes) {
            shape->display();
        }
        std::cout << "Total Area: " << totalArea() << std::endl;
    }
    
    ~ShapeManager() {
        for (auto& shape : shapes) {
            delete shape;
        }
    }
};

int main() {
    ShapeManager manager;
    
    manager.addShape(new Rectangle(10, 5, "blue"));
    manager.addShape(new Circle(7, "red"));
    manager.addShape(new Triangle(3, 4, 5, "green"));
    manager.addShape(new Rectangle(8, 3, "yellow"));
    
    manager.displayAll();
    
    return 0;
}`
        });
        
        console.log('[C++ Generator] Templates loaded:', this.templates.size);
    }
    
    generate(templateKey) {
        const template = this.templates.get(templateKey);
        return template || null;
    }
    
    getTemplates() {
        return Array.from(this.templates.entries()).map(([key, value]) => ({
            key,
            name: value.name,
            description: value.description
        }));
    }
}

window.cppGenerator = new CPPGenerator();