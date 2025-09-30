# API Endpoint Documentation (REST Compliant)

This documentation outlines the RESTful API endpoints for managing and viewing content within the application. Access to endpoints is governed by the presence of an Admin Authentication Token.

## 🔑 Authentication

**Admin** endpoints are secured using **BetterAuth**. An **Admin Token** must be provided in the request (typically via an `Authorization: Bearer <token>` header) to perform **Create, Update, and Delete** operations, or to view **draft/hidden** content.

**User** access (Read-Only) requires no authentication.

***

## 📝 Blog Posts (`/api/blogposts`)

| HTTP Method | Path | Description | Access Notes |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/blogposts` | Retrieve a list of blog posts. | **Public Default:** Returns only *published* posts.<br>**Admin:** Can use `?status=all` or `?status=draft` to view unpublished content. |
| **GET** | `/api/blogposts/:id` | Retrieve a single blog post by ID. | **Public Default:** Requires the post to be *published*.<br>**Admin:** Can view *any* post regardless of status (draft/private). |
| **POST** | `/api/blogposts` | Create a new blog post. | **Admin Only**. Requires authentication. |
| **PUT** | `/api/blogposts/:id` | Update an existing blog post. | **Admin Only**. Requires authentication. |
| **DELETE** | `/api/blogposts/:id` | Delete a blog post. | **Admin Only**. Requires authentication. |

***

## 🖼️ Photos (`/api/photos`)

| HTTP Method | Path | Description | Access Notes |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/photos` | Retrieve a list of photos. | **Public Default:** Returns only *published/visible* photos.<br>**Admin:** Can use `?status=all` or `?status=hidden` to view unpublished content. |
| **GET** | `/api/photos/:id` | Retrieve a single photo by ID. | **Public Default:** Requires the photo to be *published*.<br>**Admin:** Can view *any* photo regardless of visibility status. |
| **POST** | `/api/photos` | Upload a new photo. | **Admin Only**. Requires authentication. |
| **PUT** | `/api/photos/:id` | Update a photo's metadata (e.g., caption, status). | **Admin Only**. Requires authentication. |
| **DELETE** | `/api/photos/:id` | Delete a photo. | **Admin Only**. Requires authentication. |

***

## 🪣 Bucket List Items (`/api/bucketlist`)

| HTTP Method | Path | Description | Access Notes |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/bucketlist` | Retrieve a list of bucket list items. | **Public Default:** Returns only *visible/active* items.<br>**Admin:** Can use `?scope=all` to see private or internal items. |
| **GET** | `/api/bucketlist/:id` | Retrieve a single item by ID. | **Public Default:** Requires the item to be *visible*.<br>**Admin:** Can view *any* item regardless of visibility. |
| **POST** | `/api/bucketlist` | Create a new bucket list item. | **Admin Only**. Requires authentication. |
| **PUT** | `/api/bucketlist/:id` | Update an existing item (e.g., mark as completed, change visibility). | **Admin Only**. Requires authentication. |
| **DELETE** | `/api/bucketlist/:id` | Delete a bucket list item. | **Admin Only**. Requires authentication. |

***

## ⭐ Reviews (`/api/reviews`)

| HTTP Method | Path | Description | Access Notes |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/reviews` | Retrieve a list of reviews. | **Public Default:** Returns only *approved* reviews.<br>**Admin:** Can use `?status=all` or `?status=pending` to view unapproved/draft reviews. |
| **GET** | `/api/reviews/:id` | Retrieve a single review by ID. | **Public Default:** Requires the review to be *approved*.<br>**Admin:** Can view *any* review regardless of approval status. |
| **POST** | `/api/reviews` | Create a new review. | **Admin Only** (If posting on behalf of another user) or potentially **Public** (If allowing user submissions, which would default to a `pending` status). |
| **PUT** | `/api/reviews/:id` | Update an existing review (e.g., edit text, change approval status). | **Admin Only**. Requires authentication. |
| **DELETE** | `/api/reviews/:id` | Delete a review. | **Admin Only**. Requires authentication. |

***

## 🔐 Admin Authentication (`/api/auth`)

| HTTP Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/signin` | Signs in the admin user and returns a **BetterAuth Token**. | Public |
| **POST** | `/api/auth/signout` | Invalidates the current admin token. | Admin Only |
| **GET** | `/api/auth/me` | Retrieves the current authenticated admin user's details. | Admin Only |
