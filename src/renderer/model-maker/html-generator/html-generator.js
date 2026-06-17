/**
 * NEXUS AI - HTML Generator Module
 * HTML কোড জেনারেটর
 */

class HTMLGenerator {
    constructor() {
        this.templates = new Map();
        this.init();
    }
    
    init() {
        // Landing Page
        this.templates.set('landing', {
            name: 'Landing Page',
            description: 'ল্যান্ডিং পেজ',
            html: `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Hero Section -->
    <section class="hero">
        <nav class="navbar">
            <a href="#" class="logo">Brand</a>
            <ul class="nav-links">
                <li><a href="#features">বৈশিষ্ট্য</a></li>
                <li><a href="#pricing">মূল্য</a></li>
                <li><a href="#contact">যোগাযোগ</a></li>
            </ul>
        </nav>
        <div class="hero-content">
            <h1>আপনার ব্যবসা শুরু করুন</h1>
            <p>সেরা সার্ভিস, সেরা মূল্য</p>
            <div class="hero-buttons">
                <button class="btn btn-primary">শুরু করুন</button>
                <button class="btn btn-secondary">আরও জানুন</button>
            </div>
        </div>
    </section>
    
    <!-- Features -->
    <section id="features" class="features">
        <h2>আমাদের বৈশিষ্ট্য</h2>
        <div class="feature-grid">
            <div class="feature-card">
                <div class="feature-icon">🚀</div>
                <h3>দ্রুত</h3>
                <p>অতি দ্রুত সার্ভিস</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🔒</div>
                <h3>নিরাপদ</h3>
                <p>সম্পূর্ণ নিরাপদ</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">💯</div>
                <h3>ভালো মানের</h3>
                <p>সেরা মানের সেবা</p>
            </div>
        </div>
    </section>
    
    <!-- CTA -->
    <section class="cta">
        <h2>আজই শুরু করুন!</h2>
        <button class="btn btn-primary">Sign Up</button>
    </section>
    
    <!-- Footer -->
    <footer class="footer">
        <p>&copy; 2024 সর্বস্বত্ব সংরক্ষিত</p>
    </footer>
</body>
</html>`
        });
        
        // Dashboard
        this.templates.set('dashboard', {
            name: 'Dashboard',
            description: 'অ্যাডমিন ড্যাশবোর্ড',
            html: `<!DOCTYPE html>
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
                <a href="#" class="nav-item">Orders</a>
                <a href="#" class="nav-item">Products</a>
                <a href="#" class="nav-item">Settings</a>
            </nav>
        </aside>
        
        <!-- Main Content -->
        <main class="content">
            <header class="content-header">
                <h1>Dashboard</h1>
                <button class="btn btn-primary">+ Add New</button>
            </header>
            
            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Users</h3>
                    <p class="stat-number">1,234</p>
                    <span class="stat-change positive">+12%</span>
                </div>
                <div class="stat-card">
                    <h3>Revenue</h3>
                    <p class="stat-number">$5,678</p>
                    <span class="stat-change positive">+8%</span>
                </div>
                <div class="stat-card">
                    <h3>Orders</h3>
                    <p class="stat-number">89</p>
                    <span class="stat-change negative">-3%</span>
                </div>
            </div>
            
            <!-- Chart Placeholder -->
            <div class="chart-container">
                <h3>Monthly Revenue</h3>
                <div class="chart-placeholder">
                    Chart will be rendered here
                </div>
            </div>
        </main>
    </div>
</body>
</html>`
        });
        
        // E-Commerce
        this.templates.set('ecommerce', {
            name: 'E-Commerce',
            description: 'অনলাইন শপিং সাইট',
            html: `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online Shop</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-top">
            <a href="#" class="logo">Shop</a>
            <div class="search-box">
                <input type="text" placeholder="Search products...">
                <button>Search</button>
            </div>
            <div class="header-actions">
                <a href="#">Cart (0)</a>
                <a href="#">Account</a>
            </div>
        </div>
        <nav class="categories-nav">
            <a href="#">Electronics</a>
            <a href="#">Clothing</a>
            <a href="#">Home & Garden</a>
            <a href="#">Sports</a>
            <a href="#">Books</a>
        </nav>
    </header>
    
    <!-- Hero Slider -->
    <section class="hero-slider">
        <div class="slide">
            <h2>Summer Sale!</h2>
            <p>Up to 50% off</p>
            <button class="btn btn-primary">Shop Now</button>
        </div>
    </section>
    
    <!-- Products -->
    <section class="products">
        <h2>Featured Products</h2>
        <div class="product-grid">
            <div class="product-card">
                <img src="product1.jpg" alt="Product">
                <h3>Product Name</h3>
                <p class="price">$99.99</p>
                <button class="btn btn-secondary">Add to Cart</button>
            </div>
            <div class="product-card">
                <img src="product2.jpg" alt="Product">
                <h3>Product Name</h3>
                <p class="price">$149.99</p>
                <button class="btn btn-secondary">Add to Cart</button>
            </div>
            <div class="product-card">
                <img src="product3.jpg" alt="Product">
                <h3>Product Name</h3>
                <p class="price">$79.99</p>
                <button class="btn btn-secondary">Add to Cart</button>
            </div>
        </div>
    </section>
    
    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-section">
                <h3>Shop</h3>
                <p>Best online shop</p>
            </div>
            <div class="footer-section">
                <h3>Contact</h3>
                <p>info@shop.com</p>
            </div>
        </div>
    </footer>
</body>
</html>`
        });
        
        // Blog
        this.templates.set('blog', {
            name: 'Blog',
            description: 'ব্লগ ওয়েবসাইট',
            html: `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <a href="#" class="logo">My Blog</a>
        <nav class="nav">
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
        </nav>
    </header>
    
    <!-- Featured Post -->
    <section class="featured-post">
        <div class="post-image">
            <img src="featured.jpg" alt="Featured">
        </div>
        <div class="post-content">
            <span class="post-category">Technology</span>
            <h1>Featured Article Title</h1>
            <p class="post-excerpt">
                This is the excerpt of the featured article...
            </p>
            <div class="post-meta">
                <span>Author Name</span>
                <span>Jan 1, 2024</span>
                <span>5 min read</span>
            </div>
            <button class="btn btn-primary">Read More</button>
        </div>
    </section>
    
    <!-- Recent Posts -->
    <section class="recent-posts">
        <h2>Recent Posts</h2>
        <div class="posts-grid">
            <article class="post-card">
                <img src="post1.jpg" alt="Post">
                <h3>Post Title</h3>
                <p>Post excerpt...</p>
                <span>Jan 1, 2024</span>
            </article>
            <article class="post-card">
                <img src="post2.jpg" alt="Post">
                <h3>Post Title</h3>
                <p>Post excerpt...</p>
                <span>Dec 30, 2023</span>
            </article>
            <article class="post-card">
                <img src="post3.jpg" alt="Post">
                <h3>Post Title</h3>
                <p>Post excerpt...</p>
                <span>Dec 28, 2023</span>
            </article>
        </div>
    </section>
    
    <!-- Newsletter -->
    <section class="newsletter">
        <h2>Subscribe</h2>
        <p>Get latest updates</p>
        <form class="newsletter-form">
            <input type="email" placeholder="Your email">
            <button class="btn btn-primary">Subscribe</button>
        </form>
    </section>
</body>
</html>`
        });
        
        // Portfolio
        this.templates.set('portfolio', {
            name: 'Portfolio',
            description: 'পোর্টফোলিও',
            html: `<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Hero -->
    <section class="hero">
        <div class="hero-content">
            <h1>I'm a Developer</h1>
            <p>I build amazing web applications</p>
            <div class="social-links">
                <a href="#">GitHub</a>
                <a href="#">LinkedIn</a>
                <a href="#">Twitter</a>
            </div>
        </div>
    </section>
    
    <!-- About -->
    <section class="about">
        <h2>About Me</h2>
        <div class="about-content">
            <div class="about-image">
                <img src="profile.jpg" alt="Profile">
            </div>
            <div class="about-text">
                <p>Hello! I'm a passionate developer...</p>
                <div class="skills">
                    <span class="skill">HTML</span>
                    <span class="skill">CSS</span>
                    <span class="skill">JavaScript</span>
                    <span class="skill">React</span>
                    <span class="skill">Node.js</span>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Projects -->
    <section class="projects">
        <h2>My Projects</h2>
        <div class="project-grid">
            <div class="project-card">
                <img src="project1.jpg" alt="Project">
                <div class="project-info">
                    <h3>E-Commerce Site</h3>
                    <p>Online shopping platform</p>
                    <a href="#">View Project</a>
                </div>
            </div>
            <div class="project-card">
                <img src="project2.jpg" alt="Project">
                <div class="project-info">
                    <h3>Dashboard App</h3>
                    <p>Analytics dashboard</p>
                    <a href="#">View Project</a>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Contact -->
    <section class="contact">
        <h2>Contact Me</h2>
        <form class="contact-form">
            <input type="text" placeholder="Name">
            <input type="email" placeholder="Email">
            <textarea placeholder="Message"></textarea>
            <button class="btn btn-primary">Send</button>
        </form>
    </section>
</body>
</html>`
        });
        
        console.log('[HTML Generator] Templates loaded:', this.templates.size);
    }
    
    /**
     * Generate HTML
     */
    generate(templateKey) {
        const template = this.templates.get(templateKey);
        return template || null;
    }
    
    /**
     * Get all templates
     */
    getTemplates() {
        return Array.from(this.templates.entries()).map(([key, value]) => ({
            key,
            name: value.name,
            description: value.description
        }));
    }
}

// Create global instance
window.htmlGenerator = new HTMLGenerator();