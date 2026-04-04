Edutech Ecommerce Product Sitemap
Summary- I want a custom-built web app store using React and Node, with a simple REST API, PostgreSQL database, admin dashboard, and secure payments. The product is offline-first learning flashcards, starting with physical and printable packs, and designed to evolve into a hybrid digital platform. These are my proposed stack.
Product- Educational Flashcards ( for different age range, subject topics)
Key Frontend Pages
1.	Landing Page
2.	Store / Catalog
3.	Product Detail Page
4.	Cart
5.	Checkout
6.	Order Confirmation
7.	User Account-Optional but necessary
8.	Admin Panel (separate route)
Backend (Server Side)
•	Runtime: 
•	Framework: 
•	API Type: 
•	Authentication: 
•	Database: Recommendation for a scalable database-NoSQL
Backend Responsibilities
•	Serve product data
•	Handle orders
•	Manage users
•	Process payments
•	Admin access control
•	Security & validation
Admin Capabilities
•	Login securely
•	Create/edit flashcard packs
•	Upload previews
•	Manage inventory
•	View orders
•	Update order status
•	Export order data

Here is  full Technical PRD I created for it which gives an overview of the requirement.
Technical Product Requirements Document (PRD)
Product Name
Offline-First Gamified Flashcard Store
________________________________________
1. Purpose & Background
This document defines the technical and functional requirements for building a custom web application that enables parents and educators to browse, purchase, and receive offline-first gamified flashcard packs for children.
The platform will initially focus on physical and printable flashcard packs, with a roadmap toward a hybrid model (offline learning + optional digital enhancements).
The PRD is intended for:
•	Software developers
•	Technical partners
•	Product stakeholders
________________________________________
2. Product Goals
Primary Goals
•	Enable parents to easily discover flashcard packs by age, subject, and learning focus
•	Allow secure ordering and payment for physical/printable packs
•	Provide an admin system to manage products, inventory, and orders
•	Maintain a simple, scalable, and cost-efficient architecture
Non-Goals (MVP)
•	No digital learning accounts for children
•	No mobile app
•	No real-time learning analytics
•	No subscriptions
________________________________________
3. Target Users
Primary User
•	Parents of children aged 3–8
Secondary Users
•	Teachers, Parents and home schoolers
•	Gift buyers
Internal Users
•	Admins (store owner / operations)
________________________________________
4. User Experience Overview
Core User Journey (Customer)
1.	Land on homepage
2.	Browse store
3.	Filter products by age, subject, or focus area
4.	View product details
5.	Add to cart
6.	Checkout and payment
7.	Receive order confirmation
Admin Journey
1.	Log in securely
2.	Create/edit flashcard products
3.	Manage inventory
4.	View and update orders
________________________________________
5. Functional Requirements
5.1 Product Catalogue
•	Display flashcard packs
•	Support filtering by:
o	Age range
o	Subject
o	Focus area
•	Support bundles (Phase 1 optional)
5.2 Product Detail Page
•	Product title
•	Description
•	Age range
•	Subject
•	Focus area
•	Price
•	Format (physical / printable)
•	What’s included
•	Add to cart
5.3 Cart
•	Add/remove items
•	Update quantities
•	View total cost
5.4 Checkout & Payments
•	Guest checkout supported
•	Shipping details collection
•	Secure payment via third-party gateway (e.g. Stripe)
•	Order confirmation page
•	Email confirmation (Phase 1 optional)
5.5 Orders
•	Order creation after payment confirmation
•	Order status tracking:
o	Pending
o	Paid
o	Shipped
5.6 Admin Dashboard
•	Secure admin login
•	Create/edit/delete products
•	Update inventory
•	View orders
•	Update order status

6. Technical Architecture
Frontend
Backend
Database
7. Data Model (High-Level)
Users
Products
Orders
Order Items
Payments
________________________________________
8. API Requirements (Summary)
Public APIs
Auth APIs
Admin APIs
9. Security Requirements
•	HTTPS enforced
•	Password hashing (bcrypt)
•	JWT-based authentication
•	Role-based access control
•	Input validation
•	Rate limiting on auth endpoints
•	No storage of card details
________________________________________
10. Performance & Reliability
•	Page load < 3 seconds on average
•	API response time < 500ms (target)
•	Graceful error handling
•	Basic logging and monitoring
________________________________________
11. MVP Scope
Included
•	Product browsing
•	Filters
•	Cart & checkout
•	Payments
•	Admin dashboard
Excluded
•	Subscriptions
•	Digital learning accounts
•	Mobile app
•	Offline sync
________________________________________
12. Future Enhancements-NOT NOW
•	Hybrid digital content
•	QR codes in flashcard packs
•	Parent dashboards
•	Learning progress tracking
•	Gamification (badges, rewards)
________________________________________
13. Success Metrics
•	Conversion rate (store → checkout)
•	Number of orders
•	Average order value
•	Repeat purchases
________________________________________
14. Risks & Assumptionscd server
npm install
npm run devcd server
npm install
npm run devcd server
npm install
npm run devcd server
npm install
npm run dev
Risks
•	Inventory management errors
•	Payment failures
•	Scope creep
Assumptions
•	Parents prefer offline learning tools
•	MVP validates demand before hybrid expansion
________________________________________
15. Open Questions
•	Shipping provider selection
•	Tax handling (region-based)