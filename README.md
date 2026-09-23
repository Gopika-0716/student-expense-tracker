
# 🎓 Student Expense Tracker

A beginner-friendly, lightweight, and modern daily expense tracking web application crafted specifically for students to monitor their allowance, manage budgets, search/filter transaction history, and visualize spending habits across categories.

Built entirely with standard web technologies — **zero frameworks**, **zero external build steps**, and **zero backend dependencies**.

---

## 📖 Project Overview

Managing money in college or high school can be challenging. Between textbooks, cafeteria meals, public transit, and socializing, expenses add up quickly. 

The **Student Expense Tracker** provides students with an intuitive, all-in-one financial dashboard directly in their web browser. It calculates real-time budget balances, alerts students when they are close to or over budget, offers dynamic search and sorting, and categorizes every expense with visual breakdowns. All user data persists across browser sessions using HTML5 LocalStorage.

---

## ✨ Features

### 1. Financial Dashboard
- **Summary Cards**: Real-time display of **Total Expenses**, **Monthly Budget**, **Remaining Budget**, and **Transaction Count**.
- **Interactive Budget Visualizer**: A progress bar showing the percentage of your monthly budget consumed.
- **Budget Health Warnings**: Automatic color transitions (Emerald for safe, Amber for caution >80%, Rose/Red for over-budget >100%) and instant banner alerts when spending exceeds budget limits.

### 2. Expense Recording & Form Validation
- Add expenses with **Description**, **Amount**, **Category**, and **Date**.
- Built-in form validation ensures:
  - Amount must be greater than `$0.00`.
  - Category selection is required.
  - Description cannot be blank.
  - Date is required (defaults automatically to the current date).
- Accessible inline error messaging that clears automatically as the user types.

### 3. Student-Friendly Categories
Preconfigured categories with visual emoji icons and distinct color badges:
- 🍔 **Food**: Cafeteria meals, groceries, snacks, coffee
- 🚌 **Transport**: Bus pass, train tickets, rideshares, gas
- 📚 **Education**: Textbooks, stationery, course subscriptions, tuition
- 🎬 **Entertainment**: Movies, games, concert tickets, streaming
- 🛍️ **Shopping**: Clothes, tech accessories, dorm gear
- 💡 **Other**: Miscellaneous fees, laundry, emergency spending

### 4. Expense History & Management
- Clean transaction list displaying date, category badge, description, and currency amount.
- **Edit Expense**: Click ✏️ to populate the form, update fields, and save changes in place with a handy "Cancel" button.
- **Delete Expense**: Click 🗑️ to trigger an accessible confirmation dialog before permanently removing an entry.
- **Clear All**: Option to clear all transaction history with confirmation.
- **Empty State**: Friendly illustration and guidance when no expenses exist or search yields no results.

### 5. Search, Filter, and Sort
- **Instant Search**: Live search filtering by description or category name with a quick clear (✕) button.
- **Category Filter**: Filter expenses by specific categories (Food, Transport, etc.) or view All.
- **Flexible Sorting**:
  - Date (Newest first / Oldest first)
  - Amount (Highest first / Lowest first)
- **Active Filter Bar**: Clear indicator of active filters with a one-click "Reset Filters" action.

### 6. Spending Analysis
- Native CSS/SVG progress bars visualizing the percentage and total dollar amount allocated to each category.
- Automatically sorted by highest spending category down to lowest.
- 100% pure CSS and DOM manipulation — no heavy external charting libraries needed!

### 7. LocalStorage Persistence
- Expenses and monthly budget automatically persist across browser refreshes and tab closures.
- Gracefully handles empty storage or newly initialized trackers without errors.

### 8. Responsive Design
- Fully responsive layout utilizing CSS Grid and Flexbox.
- Optimized for desktop workstations, tablets, and smartphones.

---

## 🛠️ Technologies Used

- **HTML5**: Semantic elements (`<header>`, `<main>`, `<section>`, `<article>`, `<form>`, `<dialog>`), ARIA live regions, and accessible form labels.
- **CSS3**: Custom properties (CSS variables), modern CSS Grid, Flexbox, responsive media queries, card elevations, glassmorphism backdrop filters, and micro-animations.
- **Vanilla JavaScript (ES6+)**: Pure client-side JavaScript leveraging array methods (`reduce()`, `map()`, `filter()`, `sort()`), event delegation, DOM manipulation, and input validation.
- **Browser LocalStorage API**: Persistent client-side data storage without any database or backend server.
- **Typography**: Google Fonts ([Inter](https://fonts.google.com/specimen/Inter)) for clean typography.

---

## 📁 Project Structure

```
student-expense-tracker/
├── index.html        # Semantic HTML5 layout, dashboard cards, forms, and modals
├── style.css         # Responsive styling, design tokens, animations, and media queries
├── script.js         # State management, LocalStorage, calculations, and DOM manipulation
└── README.md         # Comprehensive project documentation
```

---

## 🚀 How to Run the Project

Since this is a 100% frontend static project with zero dependencies, you can run it immediately without installing any build tools, Node.js packages, or servers.

### Option 1: Direct File Open
1. Navigate to the `student-expense-tracker/` folder.
2. Double-click `index.html` or right-click and select **Open with...** -> your preferred web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

### Option 2: Using a Simple Local HTTP Server (Recommended)
If you have Python installed, you can launch a local server for testing:

```bash
# Navigate into the project folder
cd student-expense-tracker

# Start Python HTTP server
python -m http.server 8000
```
Then open your browser and navigate to:
```
http://localhost:8000
```

---

## 💾 How LocalStorage is Used

The application uses the browser's `window.localStorage` key-value store to maintain state:

| Storage Key | Data Type | Description |
| :--- | :--- | :--- |
| `student_expense_tracker_expenses` | JSON String (Array of Objects) | Stores the array of all user expense records. |
| `student_expense_tracker_budget` | String (Float Number) | Stores the user's defined monthly budget amount. |

### Data Flow Diagram:
```
[ User Interaction ] 
        ↓
[ State Object in JavaScript ] ──> (Add / Edit / Delete / Set Budget)
        ↓
[ JSON.stringify() ] ────────────> [ localStorage.setItem() ]
        ↓
[ Render Pipeline ] ─────────────> (Dashboard, Visualizer, Expense List, Spending Breakdown)
```

1. **On Page Load (`initApp`)**:
   `loadFromStorage()` reads `localStorage.getItem()`. If data is found, `JSON.parse()` reconstructs the array into `state.expenses`. If empty, it initializes an empty array `[]` gracefully.
2. **On Modification**:
   Every time an expense is added, edited, deleted, or the budget is updated, helper functions (`saveExpensesToStorage()`, `saveBudgetToStorage()`) update the LocalStorage string, guaranteeing immediate persistence.

---

## 📸 Screenshots

### 1. Desktop Dashboard Overview
<img width="1880" height="907" alt="image" src="https://github.com/user-attachments/assets/c09cc4a8-0bfb-4aa5-8f2b-811c6fb1760d" />


### 2. Budget Alert & Spending Breakdown
> *Visual category distribution bars and over-budget alert banner.*

### 3. Mobile View
> *Fluid single-column mobile experience with touch-friendly buttons.*

---

## 🔮 Future Improvements

While this version is designed to be accessible and straightforward for students and beginners, potential future enhancements include:
- **Export / Import**: Export expenses as a CSV file or JSON backup.
- **Recurring Expenses**: Support for automated monthly subscriptions (e.g., Spotify, college housing, bus passes).
- **Date Range Filters**: Filter expenses by week, month, or custom date ranges.
- **Dark Mode Toggle**: Optional dark color scheme switch.
- **Multi-Currency Support**: Option to switch between USD (`$`), EUR (`€`), GBP (`£`), INR (`₹`), and other regional currencies.
=======
# student-expense-tracker
A simple web-based Student Expense Tracker for managing and monitoring daily expenses.
>>>>>>> b18c500ea773ef8c3f8141208239a5716a0793fa
