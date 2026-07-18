// Tracked SQL practice set — LeetCode's canonical "Top SQL 50" study plan,
// grouped by its sections. Progress is keyed by `p-sql-<lc>`. URLs follow
// LeetCode's slug convention (kebab-case of the title).

export type SqlProblem = {
  id: string;
  lc: number;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
};

const RAW: [number, string, string, SqlProblem["difficulty"], string][] = [
  // Select
  [1757, "Recyclable and Low Fat Products", "recyclable-and-low-fat-products", "Easy", "Select"],
  [584, "Find Customer Referee", "find-customer-referee", "Easy", "Select"],
  [595, "Big Countries", "big-countries", "Easy", "Select"],
  [1148, "Article Views I", "article-views-i", "Easy", "Select"],
  [1683, "Invalid Tweets", "invalid-tweets", "Easy", "Select"],
  // Basic Joins
  [1378, "Replace Employee ID With The Unique Identifier", "replace-employee-id-with-the-unique-identifier", "Easy", "Basic Joins"],
  [1068, "Product Sales Analysis I", "product-sales-analysis-i", "Easy", "Basic Joins"],
  [1581, "Customer Who Visited but Did Not Make Any Transactions", "customer-who-visited-but-did-not-make-any-transactions", "Easy", "Basic Joins"],
  [197, "Rising Temperature", "rising-temperature", "Easy", "Basic Joins"],
  [1661, "Average Time of Process per Machine", "average-time-of-process-per-machine", "Easy", "Basic Joins"],
  [577, "Employee Bonus", "employee-bonus", "Easy", "Basic Joins"],
  [1280, "Students and Examinations", "students-and-examinations", "Easy", "Basic Joins"],
  [570, "Managers with at Least 5 Direct Reports", "managers-with-at-least-5-direct-reports", "Medium", "Basic Joins"],
  [1934, "Confirmation Rate", "confirmation-rate", "Medium", "Basic Joins"],
  // Basic Aggregate Functions
  [620, "Not Boring Movies", "not-boring-movies", "Easy", "Basic Aggregate Functions"],
  [1251, "Average Selling Price", "average-selling-price", "Easy", "Basic Aggregate Functions"],
  [1075, "Project Employees I", "project-employees-i", "Easy", "Basic Aggregate Functions"],
  [1633, "Percentage of Users Attended a Contest", "percentage-of-users-attended-a-contest", "Easy", "Basic Aggregate Functions"],
  [1211, "Queries Quality and Percentage", "queries-quality-and-percentage", "Easy", "Basic Aggregate Functions"],
  [1193, "Monthly Transactions I", "monthly-transactions-i", "Medium", "Basic Aggregate Functions"],
  [1174, "Immediate Food Delivery II", "immediate-food-delivery-ii", "Medium", "Basic Aggregate Functions"],
  [550, "Game Play Analysis IV", "game-play-analysis-iv", "Medium", "Basic Aggregate Functions"],
  // Sorting and Grouping
  [2356, "Number of Unique Subjects Taught by Each Teacher", "number-of-unique-subjects-taught-by-each-teacher", "Easy", "Sorting and Grouping"],
  [1141, "User Activity for the Past 30 Days I", "user-activity-for-the-past-30-days-i", "Easy", "Sorting and Grouping"],
  [1070, "Product Sales Analysis III", "product-sales-analysis-iii", "Medium", "Sorting and Grouping"],
  [596, "Classes More Than 5 Students", "classes-more-than-5-students", "Easy", "Sorting and Grouping"],
  [1729, "Find Followers Count", "find-followers-count", "Easy", "Sorting and Grouping"],
  [619, "Biggest Single Number", "biggest-single-number", "Easy", "Sorting and Grouping"],
  [1045, "Customers Who Bought All Products", "customers-who-bought-all-products", "Medium", "Sorting and Grouping"],
  // Advanced Select and Joins
  [1731, "The Number of Employees Which Report to Each Employee", "the-number-of-employees-which-report-to-each-employee", "Easy", "Advanced Select and Joins"],
  [1789, "Primary Department for Each Employee", "primary-department-for-each-employee", "Easy", "Advanced Select and Joins"],
  [610, "Triangle Judgement", "triangle-judgement", "Easy", "Advanced Select and Joins"],
  [1164, "Product Price at a Given Date", "product-price-at-a-given-date", "Medium", "Advanced Select and Joins"],
  [1204, "Last Person to Fit in the Bus", "last-person-to-fit-in-the-bus", "Medium", "Advanced Select and Joins"],
  [1907, "Count Salary Categories", "count-salary-categories", "Medium", "Advanced Select and Joins"],
  // Subqueries
  [1978, "Employees Whose Manager Left the Company", "employees-whose-manager-left-the-company", "Easy", "Subqueries"],
  [626, "Exchange Seats", "exchange-seats", "Medium", "Subqueries"],
  [1341, "Movie Rating", "movie-rating", "Medium", "Subqueries"],
  [1321, "Restaurant Growth", "restaurant-growth", "Medium", "Subqueries"],
  [602, "Friend Requests II: Who Has the Most Friends", "friend-requests-ii-who-has-the-most-friends", "Medium", "Subqueries"],
  [585, "Investments in 2016", "investments-in-2016", "Medium", "Subqueries"],
  [185, "Department Top Three Salaries", "department-top-three-salaries", "Hard", "Subqueries"],
  // Advanced String Functions / Regex / Clause
  [1667, "Fix Names in a Table", "fix-names-in-a-table", "Easy", "String Functions & Regex"],
  [1527, "Patients With a Condition", "patients-with-a-condition", "Easy", "String Functions & Regex"],
  [196, "Delete Duplicate Emails", "delete-duplicate-emails", "Easy", "String Functions & Regex"],
  [176, "Second Highest Salary", "second-highest-salary", "Medium", "String Functions & Regex"],
  [1484, "Group Sold Products By The Date", "group-sold-products-by-the-date", "Easy", "String Functions & Regex"],
  [1327, "List the Products Ordered in a Period", "list-the-products-ordered-in-a-period", "Easy", "String Functions & Regex"],
  [1517, "Find Users With Valid E-Mails", "find-users-with-valid-e-mails", "Easy", "String Functions & Regex"],
  [1587, "Bank Account Summary II", "bank-account-summary-ii", "Easy", "String Functions & Regex"],
];

export const SQL_PROBLEMS: SqlProblem[] = RAW.map(([lc, title, slug, difficulty, category]) => ({
  id: `p-sql-${lc}`,
  lc,
  title,
  slug,
  difficulty,
  category,
}));

export const SQL_CATEGORIES: string[] = SQL_PROBLEMS.reduce<string[]>((acc, p) => {
  if (!acc.includes(p.category)) acc.push(p.category);
  return acc;
}, []);

export function sqlProblemUrl(p: SqlProblem) {
  return `https://leetcode.com/problems/${p.slug}/`;
}

/** The official study plan these mirror. */
export const SQL_50_PLAN_URL = "https://leetcode.com/studyplan/top-sql-50/";
