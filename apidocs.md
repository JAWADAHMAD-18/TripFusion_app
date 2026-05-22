# Travel Fusion API Contracts & Documentation

This document serves as the official, comprehensive API Contract and Documentation for the Travel Fusion backend services. It defines all Mongoose schemas, REST endpoints, request/response models, authentication policies, rate limiting, and Redis caching behaviors.

---

## 📖 Table of Contents

1. [Global API Conventions](#-global-api-conventions)
2. [🗄️ Mongoose Schemas & Models](#%EF%B8%8F-mongoose-schemas--models)
   - [User Model](#1-user-model)
   - [Package Model](#2-package-model)
   - [CustomizePackage Model](#3-customizepackage-model)
   - [Booking Model](#4-booking-model)
   - [Favorite Model](#5-favorite-model)
   - [Conversation Model](#6-conversation-model)
   - [Message Model](#7-message-model)
3. [🔑 Authentication & User Profile APIs](#-authentication--user-profile-apis)
4. [🛠️ Predefined Package Management (Admin)](#%EF%B8%8F-predefined-package-management-admin)
5. [🌍 Public Package Browsing APIs](#-public-package-browsing-apis)
6. [❤️ Favorites Management](#%EF%B8%8F-favorites-management)
7. [✈️ Booking Flow (User)](#%EF%B8%8F-booking-flow-user)
8. [💼 Booking Operations (Admin)](#-booking-operations-admin)
9. [📈 Admin Dashboard Analytics](#-admin-dashboard-analytics)
10. [🤖 AI Custom Package Planner](#-ai-custom-package-planner)
11. [💬 AI Travel Chatbot](#-ai-travel-chatbot)
12. [⚡ Realtime Support Chat (WebSockets Backend)](#-realtime-support-chat-websockets-backend)
13. [🚀 Redis Caching & Locks Architecture](#-redis-caching--locks-architecture)

---

## 🌐 Global API Conventions

### 1. Base URL

All API paths listed in this document are relative to:

```
http://<host>:<port>/api/v1
```

### 2. Standard Success Response Shape

All endpoints (except the AI Chatbot specific endpoints which return customized payloads) wrap their responses in a standard `ApiResponse` format:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation description or custom message",
  "data": { ... } // Payload (object, array, or null)
}
```

### 3. Standard Error Response Shape

All unhandled exceptions, validation errors, and custom business failures are serialized via the `ApiError` class:

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Specific error description",
  "data": null,
  "errors": [] // Array containing sub-validation failures if applicable
}
```

### 4. Rate Limiting Policies

The system enforces strict request throttling at the API gateway layer to prevent credential-stuffing, database starvation, and excessive third-party API costs:

- **`authLimiter`**: Appiled to critical endpoints like `/register`, `/login`, and `/refresh-token`.
  - _Limit_: 5 requests per 15 minutes (Production) / 50 requests per 15 minutes (Development).
- **`strictLimiter`**: Applied to password recovery operations.
  - _Limit_: Throttled heavily to block brute-force attempts.
- **`chatLimiter`**: Applied to chatbot routes and realtime chat start triggers to moderate Gemini AI and WebSocket resources.
- **`customPackageLimiter`**: Throttles dynamic AI package previews and confirmation triggers.
  - _Limit_: 10 requests per 10 minutes.
- **`dbQueryLimiter`**: Applied to heavy fan-out operations (e.g., package listing, summaries).
- **`apiLimiter`**: General fallback rate-limiting for standard CRUD operations.

---

## 🗄️ Mongoose Schemas & Models

### 1. User Model

- **Collection Name**: `users`
- **Primary Key**: `_id` (ObjectId)
- **Behavior**: Pre-save hook hashes `password` with bcrypt (10 rounds) upon creation or modification.

| Field Name            | BSON Type | Required | Unique | Default Value / Enumeration / Description                                            |
| :-------------------- | :-------- | :------: | :----: | :----------------------------------------------------------------------------------- |
| `name`                | String    |   Yes    |   No   | Full name of the user                                                                |
| `email`               | String    |   Yes    |  Yes   | Validated email address                                                              |
| `password`            | String    |    No    |   No   | Bcrypt hash. Optional if authenticated via OAuth                                     |
| `isAdmin`             | Boolean   |   Yes    |   No   | `false`                                                                              |
| `profilePic`          | String    |    No    |   No   | `https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg` |
| `googleId`            | String    |    No    |   No   | `null` (Populated if `authProvider` is `"google"`)                                   |
| `authProvider`        | String    |    No    |   No   | `local`, `google` (default: `"local"`)                                               |
| `phone`               | String    |    No    |   No   | Contact number                                                                       |
| `refreshToken`        | String    |    No    |   No   | Session refresh token                                                                |
| `resetPasswordToken`  | String    |    No    |   No   | `null` (Hashed SHA-256 token for recovery)                                           |
| `resetPasswordExpiry` | Date      |    No    |   No   | `null` (Timestamp window for recovery validity)                                      |
| `createdAt`           | Date      |   Yes    |   No   | Auto-generated by mongoose timestamps                                                |
| `updatedAt`           | Date      |   Yes    |   No   | Auto-generated by mongoose timestamps                                                |

---

### 2. Package Model

- **Collection Name**: `packages`
- **Primary Key**: `_id` (ObjectId)
- **Description**: Represents a pre-defined holiday/tour package created by admins.

| Field Name       | BSON Type | Required | Unique | Default Value / Enumeration / Description           |
| :--------------- | :-------- | :------: | :----: | :-------------------------------------------------- |
| `title`          | String    |   Yes    |   No   | Display title                                       |
| `price`          | Number    |   Yes    |   No   | Package cost in PKR                                 |
| `description`    | String    |   Yes    |   No   | Detailed text summary                               |
| `highlights`     | String    |   Yes    |   No   | Highlights bullet-list text                         |
| `durationDays`   | Number    |   Yes    |   No   | Number of travel days                               |
| `durationNights` | Number    |   Yes    |   No   | Number of travel nights                             |
| `image`          | String    |   Yes    |   No   | Legacy cover image URL                              |
| `coverImage`     | String    |    No    |   No   | Principal listing media cover URL                   |
| `images`         | [String]  |    No    |   No   | `[]` (Array of supplementary image URLs)            |
| `imagePublicId`  | String    |    No    |   No   | Cloudinary assets tracking public identifier        |
| `location`       | String    |   Yes    |   No   | Main destination country/region (e.g., Maldives)    |
| `city`           | String    |    No    |   No   | `""` (Main destination city, e.g., Male)            |
| `available`      | Boolean   |    No    |   No   | Listing toggle visibility state                     |
| `trip_type`      | String    |   Yes    |   No   | `domestic`, `international`                         |
| `category`       | String    |   Yes    |   No   | `accommodations`, `flights`, `experiences`          |
| `start_date`     | Date      |   Yes    |   No   | Departure calendar date                             |
| `end_date`       | Date      |   Yes    |   No   | Return calendar date                                |
| `available_slot` | Number    |    No    |   No   | Remaining capacity slots for booking                |
| `createdBy`      | ObjectId  |    No    |   No   | Refers to the `User` model who created this package |
| `createdAt`      | Date      |   Yes    |   No   | Auto-generated timestamps                           |
| `updatedAt`      | Date      |   Yes    |   No   | Auto-generated timestamps                           |

---

### 3. CustomizePackage Model

- **Collection Name**: `customizepackages`
- **Primary Key**: `_id` (ObjectId)
- **Indexes**: `{ userId: 1, createdAt: -1 }`, `{ requestId: 1 }` (unique)
- **Description**: Holds dynamic itineraries generated via Gemini AI and external APIs for specific user requests.

| Field Name         | BSON Type | Required | Unique | Default Value / Enumeration / Description                                                                  |
| :----------------- | :-------- | :------: | :----: | :--------------------------------------------------------------------------------------------------------- |
| `userId`           | ObjectId  |   Yes    |   No   | Refers to `User` who initiated the request                                                                 |
| `destinationImage` | Object    |    No    |   No   | `null` (Object holding Unsplash image links)                                                               |
| `requestId`        | String    |   Yes    |  Yes   | Unique generation token (`userId-timestamp`)                                                               |
| `inputSnapshot`    | Object    |    No    |   No   | `{}` (Saves initial request constraints: tripType, budget, etc.)                                           |
| `flightsSnapshot`  | Array     |    No    |   No   | `[]` (Cached Amadeus flight search results)                                                                |
| `hotelsSnapshot`   | Array     |    No    |   No   | `[]` (Cached Amadeus hotel search results)                                                                 |
| `poisSnapshot`     | Array     |    No    |   No   | `[]` (Nearby Points of Interest)                                                                           |
| `weatherSnapshot`  | Array     |    No    |   No   | `[]` (Forecast snapshots for the travel window)                                                            |
| `selectedFlights`  | Array     |    No    |   No   | `[]` (Flight choices finalized for booking)                                                                |
| `selectedHotels`   | Array     |    No    |   No   | `[]` (Hotel choices finalized for booking)                                                                 |
| `itinerary`        | Array     |    No    |   No   | `[]` (Daily schedule objects)                                                                              |
| `adminFinalPrice`  | Number    |    No    |   No   | `null` (Locked pricing issued by admin after negotiation)                                                  |
| `assignedAdmin`    | ObjectId  |    No    |   No   | `null` (Admin handling the custom bid)                                                                     |
| `status`           | String    |   Yes    |   No   | `generated`, `negotiating`, `admin_assigned`, `finalized`, `cancelled`, `expired` (default: `"generated"`) |
| `expiresAt`        | Date      |    No    |   No   | Expiration threshold of generating snapshots (2 hours)                                                     |
| `archivedAt`       | Date      |    No    |   No   | `null`                                                                                                     |
| `lastModifiedAt`   | Date      |    No    |   No   | `null`                                                                                                     |
| `createdAt`        | Date      |   Yes    |   No   | Default: `Date.now`                                                                                        |

---

### 4. Booking Model

- **Collection Name**: `bookings`
- **Primary Key**: `_id` (ObjectId)
- **Indexes**: `{ user: 1, bookingDate: -1 }`, `{ package: 1, bookingStatus: 1 }`, `{ bookingStatus: 1, paymentStatus: 1 }`, `{ payment_status: 1 }`, `{ bookingType: 1, bookingStatus: 1 }`
- **Behavior**: Pre-save hook auto-generates a unique alphanumeric `bookingCode` starting with `"TF-<CurrentYear>-"` followed by 6 random digits.

| Field Name          | BSON Type | Required | Unique | Default Value / Enumeration / Description                                                             |
| :------------------ | :-------- | :------: | :----: | :---------------------------------------------------------------------------------------------------- |
| `user`              | ObjectId  |   Yes    |   No   | Refers to `User` model                                                                                |
| `bookingType`       | String    |   Yes    |   No   | `predefined`, `custom` (default: `"predefined"`)                                                      |
| `package`           | ObjectId  |    No    |   No   | `null` (Refers to `Package` if type is predefined)                                                    |
| `customPackageRef`  | ObjectId  |    No    |   No   | `null` (Refers to `CustomizePackage` if type is custom)                                               |
| `numPeople`         | Number    |   Yes    |   No   | default: `1` (Min: 1)                                                                                 |
| `packageSnapshot`   | Object    |   Yes    |   No   | Immutable snapshot of package details during booking time                                             |
| `currency`          | String    |    No    |   No   | `"PKR"`                                                                                               |
| `pricePerPerson`    | Number    |   Yes    |   No   | Unit cost per passenger                                                                               |
| `totalPrice`        | Number    |   Yes    |   No   | Calculated: `pricePerPerson * numPeople`                                                              |
| `savings`           | Number    |    No    |   No   | `0` (Automated loyalty discount calculated server-side)                                               |
| `bookingDate`       | Date      |   Yes    |   No   | Date booking was made. Default: `() => new Date()`                                                    |
| `travelDate`        | Date      |    No    |   No   | Fixed to package `start_date` or custom start                                                         |
| `bookingCode`       | String    |    No    |  Yes   | Unique string (e.g. `TF-2026-293847`)                                                                 |
| `bookingStatus`     | String    |    No    |   No   | `Pending`, `Confirmed`, `Cancelled` (default: `"Pending"`)                                            |
| `paymentStatus`     | String    |    No    |   No   | `NotPaid`, `Paid`, `Refunded` (default: `"NotPaid"`)                                                  |
| `paymentProof`      | Object    |    No    |   No   | **Embedded sub-schema** (see below)                                                                   |
| `payment_status`    | String    |    No    |   No   | `pending_payment`, `payment_submitted`, `payment_verified`, `refunded` (default: `"pending_payment"`) |
| `payment_proof_url` | String    |    No    |   No   | `null`                                                                                                |
| `payment_note`      | String    |    No    |   No   | `null`                                                                                                |
| `cancelReason`      | String    |    No    |   No   | `null`                                                                                                |
| `cancelledAt`       | Date      |    No    |   No   | `null`                                                                                                |
| `cancelledBy`       | String    |    No    |   No   | `User`, `Admin`, `null` (default: `null`)                                                             |
| `notes`             | String    |    No    |   No   | User-supplied custom trip notes                                                                       |
| `createdAt`         | Date      |   Yes    |   No   | Auto-generated timestamps                                                                             |
| `updatedAt`         | Date      |   Yes    |   No   | Auto-generated timestamps                                                                             |

#### Sub-Schema: `paymentProof`

- `imageUrl`: String (default: `null`)
- `uploadedAt`: Date (default: `null`)
- `verified`: Boolean (default: `false`)
- `verifiedBy`: ObjectId (ref: `User`, default: `null`)
- `verifiedAt`: Date (default: `null`)

---

### 5. Favorite Model

- **Collection Name**: `favorites`
- **Primary Key**: `_id` (ObjectId)
- **Indexes**: `{ user: 1, package: 1 }` (unique compound index)

| Field Name  | BSON Type | Required | Default Value / Enumeration / Description |
| :---------- | :-------- | :------: | :---------------------------------------- |
| `user`      | ObjectId  |   Yes    | Refers to `User` model                    |
| `package`   | ObjectId  |   Yes    | Refers to `Package` model                 |
| `createdAt` | Date      |   Yes    | Auto-generated timestamps                 |
| `updatedAt` | Date      |   Yes    | Auto-generated timestamps                 |

---

### 6. Conversation Model

- **Collection Name**: `conversations`
- **Primary Key**: `_id` (ObjectId)
- **Description**: Tracks live-chat WebSocket rooms between standard users and support admins.

| Field Name      | BSON Type | Required | Default Value / Enumeration / Description               |
| :-------------- | :-------- | :------: | :------------------------------------------------------ |
| `user`          | ObjectId  |   Yes    | Refers to the customer (`User`)                         |
| `assignedAdmin` | ObjectId  |    No    | `null` (Refers to `User` who accepted the ticket)       |
| `status`        | String    |    No    | `open`, `assigned`, `closed` (default: `"open"`)        |
| `lastMessage`   | ObjectId  |    No    | Refers to the latest `Message` document in this session |
| `lastMessageAt` | Date      |    No    | Timestamp of the latest message activity                |
| `createdAt`     | Date      |   Yes    | Auto-generated timestamps                               |
| `updatedAt`     | Date      |   Yes    | Auto-generated timestamps                               |

---

### 7. Message Model

- **Collection Name**: `messages`
- **Primary Key**: `_id` (ObjectId)

| Field Name     | BSON Type | Required | Default Value / Enumeration / Description |
| :------------- | :-------- | :------: | :---------------------------------------- |
| `conversation` | ObjectId  |   Yes    | Refers to parent `Conversation`           |
| `sender`       | ObjectId  |   Yes    | Refers to `User` who sent the message     |
| `senderRole`   | String    |   Yes    | `user`, `admin`, `ai`                     |
| `type`         | String    |    No    | `text`, `system` (default: `"text"`)      |
| `text`         | String    |   Yes    | Literal string content                    |
| `seen`         | Boolean   |    No    | `false` (Unread flag for UI badging)      |
| `createdAt`    | Date      |   Yes    | Auto-generated timestamps                 |
| `updatedAt`    | Date      |   Yes    | Auto-generated timestamps                 |

---

## 🔑 Authentication & User Profile APIs

### 1. Register User

- **Method**: `POST`
- **Path**: `/user/register`
- **Auth Required**: No
- **Throttling**: `authLimiter`
- **Media Support**: `multipart/form-data` (single profile picture)
- **Request Body**:
  ```yaml
  name: "John Doe"             # String (Required)
  email: "john@example.com"    # String (Required, Valid Email)
  password: "securePassword123"# String (Required)
  profilePic: <binary file>    # File (Optional, Name: profilePic)
  ```
- **Expected Response (201 Created)**:
  ```json
  {
    "statusCode": 201,
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "_id": "664c51bb31792f349d92837f",
        "name": "John Doe",
        "email": "john@example.com",
        "isAdmin": false,
        "profilePic": "https://res.cloudinary.com/travel-fusion/image/upload/v1/profile/john.png",
        "authProvider": "local",
        "createdAt": "2026-05-21T10:00:00.000Z",
        "updatedAt": "2026-05-21T10:00:00.000Z"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
  _Set-Cookie:_ `refreshToken=<token>; HttpOnly; Secure; SameSite=None; Max-Age=7 days`

---

### 2. Login User

- **Method**: `POST`
- **Path**: `/user/login`
- **Auth Required**: No
- **Throttling**: `authLimiter`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "User logged in successfully",
    "data": {
      "user": {
        "_id": "664c51bb31792f349d92837f",
        "name": "John Doe",
        "email": "john@example.com",
        "isAdmin": false,
        "profilePic": "https://res.cloudinary.com/...",
        "authProvider": "local",
        "createdAt": "2026-05-21T10:00:00.000Z",
        "updatedAt": "2026-05-21T10:00:00.000Z"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
  _Set-Cookie:_ `refreshToken=<token>; HttpOnly; Secure; SameSite=None; Max-Age=7 days`

---

### 3. Refresh Access Token

- **Method**: `POST`
- **Path**: `/user/refresh-token`
- **Auth Required**: No (Verified via HttpOnly cookie value)
- **Throttling**: `authLimiter`
- **Request Headers**:
  - _Cookie_: `refreshToken=<Token>` (Only source of read)
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Access token refreshed successfully",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
  _Note: Rotates both Refresh and Access token keys._

---

### 4. Forgot Password

- **Method**: `POST`
- **Path**: `/user/auth/forgot-password`
- **Auth Required**: No
- **Throttling**: `strictLimiter`
- **Request Body**:
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "If an account with that email exists, a password reset link has been sent.",
    "data": {}
  }
  ```
  _Security detail: Returns identical message even if email is absent from DB to block account enumeration attacks._

---

### 5. Reset Password

- **Method**: `POST`
- **Path**: `/user/auth/reset-password`
- **Auth Required**: No
- **Throttling**: `strictLimiter`
- **Request Query Parameters**:
  - `token` (String, Required) - Unhashed random token from recovery email url.
- **Request Body**:
  ```json
  {
    "newPassword": "brandNewSecurePassword"
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Password has been reset successfully",
    "data": {}
  }
  ```

---

### 6. Google Sign-In

- **Method**: `POST`
- **Path**: `/user/auth/google`
- **Auth Required**: No
- **Throttling**: `apiLimiter`
- **Request Body**:
  ```json
  {
    "idToken": "ya29.a0AfH6SMB..." // Google Credentials JWT
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Google authentication successful",
    "data": {
      "user": {
        "_id": "664c62cc31792f349d92838d",
        "name": "John Google",
        "email": "john.google@gmail.com",
        "isAdmin": false,
        "profilePic": "https://lh3.googleusercontent.com/...",
        "googleId": "10283749283749283",
        "authProvider": "google",
        "createdAt": "2026-05-21T10:10:00.000Z",
        "updatedAt": "2026-05-21T10:10:00.000Z"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
  _Set-Cookie:_ `refreshToken=<token>; HttpOnly; Secure; SameSite=None; Max-Age=7 days`

---

### 7. Logout User

- **Method**: `POST`
- **Path**: `/user/logout`
- **Auth Required**: Yes (Bearer JWT)
- **Throttling**: `apiLimiter`
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "User logged out successfully",
    "data": {}
  }
  ```
  _Action: Unsets Mongoose `refreshToken` state and clears cookie attributes in client browser._

---

### 8. Get Current User Details

- **Method**: `GET`
- **Path**: `/user/me`
- **Auth Required**: Yes (Bearer JWT)
- **Throttling**: `apiLimiter`
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "User data retrieved successfully",
    "data": {
      "user": {
        "_id": "664c51bb31792f349d92837f",
        "name": "John Doe",
        "email": "john@example.com",
        "isAdmin": false,
        "profilePic": "https://res.cloudinary.com/...",
        "authProvider": "local",
        "phone": "03001234567",
        "createdAt": "2026-05-21T10:00:00.000Z",
        "updatedAt": "2026-05-21T10:00:00.000Z"
      }
    }
  }
  ```

---

### 9. Update User Profile

- **Method**: `PATCH`
- **Path**: `/user/profile-update`
- **Auth Required**: Yes (Bearer JWT)
- **Throttling**: `apiLimiter`
- **Media Support**: `multipart/form-data`
- **Request Body** (All fields are optional, but at least one must be provided):
  ```yaml
  name: "John Updated" # String (Min: 3 chars)
  phone: "+92 300 1234567" # String (Valid Phone Format Check)
  profilePic: <binary file> # File (Profile upload to Cloudinary)
  ```
  _Note: Email updates are strictly blocked by the controller backend for security reasons._
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "user": {
        "_id": "664c51bb31792f349d92837f",
        "name": "John Updated",
        "email": "john@example.com",
        "isAdmin": false,
        "profilePic": "https://res.cloudinary.com/updated_pic.png",
        "authProvider": "local",
        "phone": "+92 300 1234567",
        "createdAt": "2026-05-21T10:00:00.000Z",
        "updatedAt": "2026-05-21T10:15:00.000Z"
      }
    }
  }
  ```

---

## 🛠️ Predefined Package Management (Admin)

### 1. Add Predefined Package

- **Method**: `POST`
- **Path**: `/admin/add-package`
- **Auth Required**: Yes (JWT + Admin Role verification)
- **Throttling**: `apiLimiter`
- **Media Support**: `multipart/form-data`
- **Request Body**:
  ```yaml
  title: "Scenic Swat Tour"            # String (Required)
  description: "5 days road trip Swat"# String (Required)
  price: 45000                         # Number (Required)
  durationDays: 5                      # Number (Required)
  durationNights: 4                    # Number (Required)
  highlights: "Mingora, Kalam, Malam"  # String (Required)
  location: "Swat"                     # String (Required)
  city: "Kalam"                        # String (Optional)
  available: true                      # Boolean (Optional)
  trip_type: "domestic"                # Enum: ["domestic", "international"] (Required)
  category: "experiences"              # Enum: ["accommodations", "flights", "experiences"] (Required)
  start_date: "2026-07-01"             # Date (Required)
  end_date: "2026-07-06"               # Date (Required)
  available_slot: 12                   # Number (Optional)
  image: <binary file>                 # File (Required, Cover media)
  ```
- **Expected Response (201 Created)**:
  ```json
  {
    "statusCode": 201,
    "success": true,
    "message": "Package added successfully",
    "data": {
      "_id": "664c760031792f349d9283ab",
      "title": "Scenic Swat Tour",
      "price": 45000,
      "description": "5 days road trip Swat",
      "highlights": "Mingora, Kalam, Malam",
      "durationDays": 5,
      "durationNights": 4,
      "image": "https://res.cloudinary.com/.../swat.jpg",
      "imagePublicId": "packages/swat_public_id",
      "location": "Swat",
      "city": "Kalam",
      "available": true,
      "trip_type": "domestic",
      "category": "experiences",
      "start_date": "2026-07-01T00:00:00.000Z",
      "end_date": "2026-07-06T00:00:00.000Z",
      "available_slot": 12,
      "createdBy": "664c51bb31792f349d92837f",
      "createdAt": "2026-05-21T10:20:00.000Z",
      "updatedAt": "2026-05-21T10:20:00.000Z"
    }
  }
  ```
  _Cache Effect:_ Invalidates all package list/type cache buckets.

---

### 2. Update Package Details

- **Method**: `PATCH`
- **Path**: `/admin/package/:packageId`
- **Auth Required**: Yes (JWT + Admin Role)
- **Throttling**: `apiLimiter`
- **Media Support**: `multipart/form-data`
- **Request Params**:
  - `packageId` (String, Required)
- **Request Body**: Any package fields (All optional). Supplying `image` file replaces old image on Cloudinary.
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Package updated successfully",
    "data": { ... } // Updated Package document
  }
  ```
  _Cache Effect:_ Invalidates specific `package:details:*` and broad listing caching entries.

---

### 3. Delete Package

- **Method**: `DELETE`
- **Path**: `/admin/package/:packageId`
- **Auth Required**: Yes (JWT + Admin Role)
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `packageId` (String, Required)
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Package deleted successfully",
    "data": null
  }
  ```
  _Validation Rule: Rejects command if active Bookings (`Pending` or `Confirmed`) refer to this package._
  _Cache Effect:_ Invalidates all associated package caching buckets.

---

## 🌍 Public Package Browsing APIs

### 1. Get All Packages

- **Method**: `GET`
- **Path**: `/packages`
- **Auth Required**: No (Optional token parses admin context for customized sorting filters)
- **Throttling**: `dbQueryLimiter`
- **Caching**: **Redis Cache Enabled**
  - _Guest Cache Key:_ `packages:all:user` (TTL: 15 mins)
  - _Admin Cache Key:_ `packages:all:admin` (TTL: 15 mins)
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Packages retrieved successfully",
    "data": {
      "packages": [
        {
          "_id": "664c760031792f349d9283ab",
          "title": "Scenic Swat Tour",
          "price": 45000,
          "description": "5 days road trip Swat",
          "highlights": "Mingora, Kalam, Malam",
          "durationDays": 5,
          "durationNights": 4,
          "image": "https://res.cloudinary.com/.../swat.jpg",
          "coverImage": "https://res.cloudinary.com/.../swat.jpg",
          "images": ["https://res.cloudinary.com/.../swat.jpg"],
          "location": "Swat",
          "city": "Kalam",
          "available": true,
          "trip_type": "domestic",
          "category": "experiences",
          "start_date": "2026-07-01T00:00:00.000Z",
          "end_date": "2026-07-06T00:00:00.000Z",
          "available_slot": 12
        }
      ],
      "total": 1
    }
  }
  ```

---

### 2. Get Active Packages

- **Method**: `GET`
- **Path**: `/packages/active`
- **Auth Required**: No (Optional Token support)
- **Throttling**: `dbQueryLimiter`
- **Caching**: **Redis Cache Enabled**
  - _User Key:_ `packages:active:user` (TTL: 10 mins)
  - _Admin Key:_ `packages:active:admin` (TTL: 10 mins)
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Active packages retrieved successfully",
    "data": [ ... ] // Normalized active packages array
  }
  ```

---

### 3. Get Packages by Trip Type

- **Method**: `GET`
- **Path**: `/packages/type/:tripType`
- **Auth Required**: No (Optional Token support)
- **Throttling**: `dbQueryLimiter`
- **Request Params**:
  - `tripType` (String, Required) - `domestic` or `international`
- **Caching**: **Redis Cache Enabled**
  - _Key patterns:_ `packages:type:domestic:user` or `packages:type:international:admin` (TTL: 10 mins)
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "domestic packages retrieved successfully",
    "data": [ ... ]
  }
  ```

---

### 4. Get Single Package Details

- **Method**: `GET`
- **Path**: `/packages/:packageId`
- **Auth Required**: No (Optional Token support)
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `packageId` (String, Required)
- **Caching**: **Redis Cache Enabled** (TTL: 1 hour)
  - _User Key:_ `package:details:user:<packageId>`
  - _Admin Key:_ `package:details:admin:<packageId>`
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Package retrieved successfully",
    "data": { ... } // Standard single package representation
  }
  ```
  _Rule: Guests/non-admin users receive a `404 Not Found` if a package is expired or toggled unavailable._

---

## ❤️ Favorites Management

### 1. Add to Favorites

- **Method**: `POST`
- **Path**: `/favorites/add-favorite`
- **Auth Required**: Yes (JWT)
- **Throttling**: `apiLimiter`
- **Request Body**:
  ```json
  {
    "packageId": "664c760031792f349d9283ab"
  }
  ```
- **Expected Response (201 Created)**:
  ```json
  {
    "statusCode": 201,
    "success": true,
    "message": "Added to favorites successfully",
    "data": null
  }
  ```
  _Cache Effect:_ Invalidates the specific user's favorites cached entry.

---

### 2. Get User Favorites

- **Method**: `GET`
- **Path**: `/favorites`
- **Auth Required**: Yes (JWT)
- **Throttling**: `apiLimiter`
- **Caching**: **Redis Cache Enabled**
  - _Cache Key:_ `user:favorites:<userId>` (TTL: 10 mins)
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Favorites retrieved successfully",
    "data": [
      {
        "_id": "664c892231792f349d9283ee",
        "user": "664c51bb31792f349d92837f",
        "package": "664c760031792f349d9283ab",
        "createdAt": "2026-05-21T10:30:00.000Z",
        "updatedAt": "2026-05-21T10:30:00.000Z"
      }
    ]
  }
  ```

---

### 3. Remove from Favorites

- **Method**: `DELETE`
- **Path**: `/favorites/:packageId`
- **Auth Required**: Yes (JWT)
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `packageId` (String, Required)
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Removed from favorites successfully",
    "data": null
  }
  ```
  _Cache Effect:_ Purges `user:favorites:<userId>` from Redis.

---

### 4. Get Favorites Count

- **Method**: `GET`
- **Path**: `/favorites/count`
- **Auth Required**: Yes (JWT)
- **Throttling**: `apiLimiter`
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Favorite count retrieved successfully",
    "data": 1
  }
  ```

---

## ✈️ Booking Flow (User)

- **URL Aliases**: `/user/booking` AND `/bookings` (both map to the same controllers)

### 1. Create Predefined Package Booking

- **Method**: `POST`
- **Path**: `/bookings`
- **Auth Required**: Yes (JWT)
- **Throttling**: `dbQueryLimiter`
- **Media Support**: `multipart/form-data` (upload bank receipt screenshot)
- **Request Body**:
  ```yaml
  package: "664c760031792f349d9283ab" # String (Required)
  numPeople: 2 # Number (Optional, default: 1)
  notes: "Prefer window seats on flight" # String (Optional)
  paymentProof: <binary file> # File (Optional, bank transfer proof)
  ```
- **Operational Detail**: Uses unified MongoDB Session Transactions. Performs slot availability validations, decrements slot limits atomically inside transaction context, applies loyalty discounts server-side (5% off if total < 500k, 10% if higher), and snapshots package rules.
- **Expected Response (201 Created)**:
  ```json
  {
    "statusCode": 201,
    "success": true,
    "message": "Booking created successfully",
    "data": {
      "bookingId": "664c91cc31792f349d9283f9",
      "bookingCode": "TF-2026-829371",
      "bookingStatus": "Pending",
      "paymentStatus": "NotPaid",
      "payment_status": "pending_payment",
      "numPeople": 2,
      "pricePerPerson": 45000,
      "totalPrice": 90000,
      "savings": 4500,
      "durationDays": 5,
      "durationNights": 4,
      "travelDate": "2026-07-01T00:00:00.000Z",
      "start_date": "2026-07-01T00:00:00.000Z",
      "end_date": "2026-07-06T00:00:00.000Z",
      "packageSnapshot": {
        "title": "Scenic Swat Tour",
        "destination": "Swat",
        "durationDays": 5,
        "basePrice": 45000,
        "category": "experiences",
        "tripType": "domestic",
        "start_date": "2026-07-01T00:00:00.000Z",
        "end_date": "2026-07-06T00:00:00.000Z",
        "images": ["https://res.cloudinary.com/..."],
        "includes": [],
        "excludes": []
      },
      "createdAt": "2026-05-21T10:33:18.000Z"
    }
  }
  ```
  _Cache Effect:_ Invalidates Admin Dashboard summaries. Non-blocking email dispatch sends a confirmation receipt.

---

### 2. Get My Booking History

- **Method**: `GET`
- **Path**: `/bookings/me`
- **Auth Required**: Yes (JWT)
- **Throttling**: `dbQueryLimiter`
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Your bookings retrieved successfully",
    "data": [ ... ] // Array of raw user Booking documents
  }
  ```

---

### 3. Get Specific Booking Details

- **Method**: `GET`
- **Path**: `/bookings/:id`
- **Auth Required**: Yes (JWT)
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `id` (String, Required) - Booking ID
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Booking details retrieved successfully",
    "data": { ... } // Booking details
  }
  ```
  _Security Rule: Returns `403 Forbidden` if request user is not the booking creator._

---

### 4. Get Upcoming Travels

- **Method**: `GET`
- **Path**: `/bookings/upcoming`
- **Auth Required**: Yes (JWT)
- **Throttling**: `dbQueryLimiter`
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Upcoming bookings retrieved successfully",
    "data": [ ... ] // Active Bookings with travelDate >= today, sorted by travelDate asc
  }
  ```

---

### 5. Upload Bank Transfer Payment Proof

- **Method**: `POST`
- **Path**: `/bookings/:bookingId/payment-proof`
- **Auth Required**: Yes (JWT)
- **Throttling**: `apiLimiter`
- **Media Support**: `multipart/form-data`
- **Request Params**:
  - `bookingId` (String, Required)
- **Request Body**:
  ```yaml
  payment_note: "Transferred from HBL app" # String (Optional)
  paymentProof: <binary file> # File (Required, Max: 5MB, JPG/PNG)
  ```
- **Behavior**: Blocks re-upload if proof is already present. Updates workflow fields to notify admins.
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Payment proof uploaded successfully",
    "data": {
      // ... updated Booking object ...
      "payment_status": "payment_submitted",
      "payment_proof_url": "https://res.cloudinary.com/...",
      "paymentProof": {
        "imageUrl": "https://res.cloudinary.com/...",
        "uploadedAt": "2026-05-21T10:33:18.000Z",
        "verified": false
      }
    }
  }
  ```
  _Cache Effect:_ Invalidates Admin Dashboard summaries.

---

### 6. Cancel Booking

- **Method**: `PATCH`
- **Path**: `/bookings/:id/cancel`
- **Auth Required**: Yes (JWT)
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `id` (String, Required) - Booking ID
- **Request Body**:
  ```json
  {
    "cancelReason": "Medical emergency"
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Booking cancelled successfully",
    "data": {
      "bookingStatus": "Cancelled",
      "cancelledBy": "User",
      "cancelReason": "Medical emergency",
      "cancelledAt": "2026-05-21T10:33:18.000Z"
    }
  }
  ```
  _Cache Effect:_ Invalidates Admin Dashboard summaries. Launches non-blocking cancellation alert email.

---

### 7. Get Travel Financial & Category Summary

- **Method**: `GET`
- **Path**: `/bookings/summary`
- **Auth Required**: Yes (JWT)
- **Throttling**: `dbQueryLimiter`
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Travel summary retrieved successfully",
    "data": {
      "totalSpent": 90000,
      "fusionSavings": 4500,
      "categoryBreakdown": [
        {
          "name": "experiences",
          "percentage": 100
        },
        {
          "name": "accommodations",
          "percentage": 0
        },
        {
          "name": "flights",
          "percentage": 0
        },
        {
          "name": "custom",
          "percentage": 0
        }
      ]
    }
  }
  ```

---

## 💼 Booking Operations (Admin)

Prefix: `/admin/booking`

### 1. Get All Bookings

- **Method**: `GET`
- **Path**: `/admin/booking`
- **Auth Required**: Yes (JWT + Admin Role)
- **Throttling**: `dbQueryLimiter`
- **Request Query Parameters** (All optional filters):
  - `bookingStatus` (Enum: `Pending`, `Confirmed`, `Cancelled`)
  - `paymentStatus` (Enum: `NotPaid`, `Paid`, `Refunded`)
  - `bookingType` (Enum: `predefined`, `custom`)
  - `packageId` (ObjectId string)
  - `userId` (ObjectId string)
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "All bookings retrieved successfully",
    "data": [
      {
        "_id": "664c91cc31792f349d9283f9",
        "bookingCode": "TF-2026-829371",
        "user": {
          "_id": "664c51bb31792f349d92837f",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "package": {
          "_id": "664c760031792f349d9283ab",
          "title": "Scenic Swat Tour",
          "location": "Swat",
          "price": 45000
        },
        "bookingStatus": "Pending",
        "paymentStatus": "NotPaid",
        "payment_status": "pending_payment"
        // ... remaining booking properties ...
      }
    ]
  }
  ```

---

### 2. Search Bookings

- **Method**: `GET`
- **Path**: `/admin/booking/search`
- **Auth Required**: Yes (JWT + Admin Role)
- **Throttling**: `dbQueryLimiter`
- **Request Query Parameters**:
  - `q` (String, Required) - Case-insensitive regex match against `bookingCode`, OR 24-character hex ID (searches `user` or `package` directly).
  - _Optional filters:_ `bookingStatus`, `paymentStatus`, `bookingType`, `packageId`, `userId`
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Bookings retrieved successfully",
    "data": [ ... ] // Polulated matching Bookings
  }
  ```

---

### 3. Get Booking Details

- **Method**: `GET`
- **Path**: `/admin/booking/:id`
- **Auth Required**: Yes (JWT + Admin Role)
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `id` (String, Required)
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Booking details retrieved successfully",
    "data": { ... } // Fully populated Booking details
  }
  ```

---

### 4. Verify Customer Bank Payment

- **Method**: `PATCH`
- **Path**: `/admin/booking/:id/verify-payment`
- **Auth Required**: Yes (JWT + Admin Role)
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `id` (String, Required)
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Payment verified successfully",
    "data": {
      "bookingStatus": "Confirmed",
      "paymentStatus": "Paid",
      "payment_status": "payment_verified",
      "paymentProof": {
        "verified": true,
        "verifiedBy": "664c51bb31792f349d92837f",
        "verifiedAt": "2026-05-21T10:33:18.000Z"
      }
    }
  }
  ```
  _Business Rule:_ Fails with `400` if `paymentProof.imageUrl` is absent.
  _Cache Effect:_ Invalidates Admin Dashboard summaries. Dispatches automated "Payment Received" and "Booking Confirmed" emails.

---

### 5. Reject Submitted Bank Payment Proof

- **Method**: `PATCH`
- **Path**: `/admin/booking/:id/reject-payment`
- **Auth Required**: Yes (JWT + Admin Role)
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `id` (String, Required)
- **Request Body**:
  ```json
  {
    "reason": "Payment receipt screenshot is blurred."
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Payment rejected successfully",
    "data": {
      "bookingStatus": "Pending",
      "paymentStatus": "NotPaid",
      "payment_status": "pending_payment",
      "notes": "Payment receipt screenshot is blurred.",
      "paymentProof": {
        "verified": false,
        "verifiedBy": "664c51bb31792f349d92837f",
        "verifiedAt": "2026-05-21T10:33:18.000Z"
      }
    }
  }
  ```
  _Cache Effect:_ Invalidates Admin Dashboard summaries.

---

### 6. Cancel Booking by Admin

- **Method**: `PATCH`
- **Path**: `/admin/booking/:id/cancel`
- **Auth Required**: Yes (JWT + Admin Role)
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `id` (String, Required)
- **Request Body**:
  ```json
  {
    "cancelReason": "Adverse weather forecast at destination"
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Booking cancelled successfully",
    "data": {
      "bookingStatus": "Cancelled",
      "paymentStatus": "Refunded", // Transitioned if state was previously "Paid"
      "payment_status": "refunded",
      "cancelledBy": "Admin",
      "cancelReason": "Adverse weather forecast at destination",
      "cancelledAt": "2026-05-21T10:33:18.000Z"
    }
  }
  ```
  _Cache Effect:_ Invalidates Admin Dashboard summaries. Launches "Booking Cancelled" and "Refund Processed" emails.

---

## 📈 Admin Dashboard Analytics

Prefix: `/admin/dashboard`

### 1. Get Dashboard Summary

- **Method**: `GET`
- **Path**: `/admin/dashboard/summary`
- **Auth Required**: Yes (JWT + Admin Role)
- **Throttling**: `dbQueryLimiter`
- **Caching**: **Redis Cache Enabled** (TTL: 60 seconds)
  - _Cache Key:_ `admin:dashboard:summary`
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Dashboard summary fetched successfully",
    "data": {
      "revenue": {
        "totalRevenue": 2840000,
        "paidBookingsCount": 18
      },
      "bookings": {
        "total": 32,
        "pending": 4,
        "confirmed": 25,
        "cancelled": 3
      },
      "growth": {
        "currentMonthBookings": 12,
        "previousMonthBookings": 9,
        "growthPercentage": 33.3
      },
      "recentActivity": [
        {
          "bookingCode": "TF-2026-829371",
          "bookingStatus": "Pending",
          "paymentStatus": "NotPaid",
          "totalPrice": 90000,
          "numPeople": 2,
          "bookingDate": "2026-05-21T10:33:18.000Z",
          "packageTitle": "Scenic Swat Tour",
          "destination": "Swat",
          "user": {
            "name": "John Doe",
            "email": "john@example.com",
            "profilePic": "https://res.cloudinary.com/..."
          }
        }
      ],
      "revenueChart": {
        "labels": [
          "Dec 2025",
          "Jan 2026",
          "Feb 2026",
          "Mar 2026",
          "Apr 2026",
          "May 2026"
        ],
        "data": [150000, 390000, 240000, 520000, 710000, 830000]
      },
      "generatedAt": "2026-05-21T10:33:18.000Z"
    }
  }
  ```

---

## 🤖 AI Custom Package Planner

- **Path Mounting**: Mounted relative to `/api/v1`

### 1. Generate Custom Package Preview

- **Method**: `POST`
- **Path**: `/preview`
- **Auth Required**: Yes (JWT)
- **Throttling**: `customPackageLimiter`
- **Acquires Redis Mutex Lock**: Sets a key `lock:customPackage:<userId>` (TTL: 30 seconds) to block race generation or client spam.
- **Request Body**:
  ```json
  {
    "tripType": "international",
    "locations": ["Karachi", "Dubai"],
    "start_date": "2026-06-15",
    "end_date": "2026-06-20",
    "adults": 2,
    "budgetPreference": "high" // Enum: ["low", "medium", "high"]
  }
  ```
  _Validation: Maximum allowed itinerary size is 12 days._
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Custom package created successfully",
    "data": {
      "tripType": "international",
      "start_date": "2026-06-15",
      "end_date": "2026-06-20",
      "adults": 2,
      "destination": {
        "name": "Dubai",
        "weather": [ ... ],
        "totalHotels": 45,
        "hotels": [ ... ],
        "pois": [ ... ]
      },
      "locations": [ ... ],
      "flights": {
        "count": 5,
        "offers": [ ... ]
      },
      "created_at": "2026-05-21T10:33:18.000Z",
      "requestId": "664c51bb31792f349d92837f-1779836400000",
      "status": "generated",
      "expiresAt": "2026-05-21T12:33:18.000Z",
      "destinationImage": { ... },
      "pois": [ ... ],
      "inputSnapshot": { ... },
      "flightsSnapshot": [ ... ],
      "hotelsSnapshot": [ ... ],
      "weatherSnapshot": [ ... ],
      "poisSnapshot": [ ... ],
      "selectedFlights": [ ... ],
      "selectedHotels": [ ... ],
      "itinerary": [ ... ],
      "reasoningSummary": "Selected high tier flights & luxury beachfront resort.",
      "flightsFetchStatus": "success",
      "hotelsFetchStatus": "success"
    }
  }
  ```

---

### 2. Confirm Custom Package Choice

- **Method**: `POST`
- **Path**: `/confirm`
- **Auth Required**: Yes (JWT)
- **Throttling**: `customPackageLimiter`
- **Request Body**: The exact, flat `data` object returned by the `/preview` endpoint.
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Custom package confirmed successfully",
    "data": {
      "requestId": "664c51bb31792f349d92837f-1779836400000",
      "packageId": "664cb92231792f349d92842c",
      "status": "generated",
      "expiresAt": "2026-05-21T12:33:18.000Z",
      "createdAt": "2026-05-21T10:33:20.000Z"
    }
  }
  ```

---

### 3. Move Custom Package to Negotiating (User)

- **Method**: `PATCH`
- **Path**: `/status/negotiating`
- **Auth Required**: Yes (JWT)
- **Throttling**: `apiLimiter`
- **Request Body**:
  ```json
  {
    "requestId": "664c51bb31792f349d92837f-1779836400000"
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Status updated to negotiating",
    "data": {
      "requestId": "664c51bb31792f349d92837f-1779836400000",
      "status": "negotiating"
    }
  }
  ```

---

### 4. Get Custom Package Details (Admin)

- **Method**: `GET`
- **Path**: `/admin/custom-package/:requestId`
- **Auth Required**: Yes (JWT + Admin Role)
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `requestId` (String, Required)
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Custom package retrieved",
    "data": { ... } // Complete CustomizePackage document
  }
  ```

---

### 5. Finalize or Cancel Custom Deal (Admin)

- **Method**: `PATCH`
- **Path**: `/admin/custom-package/:requestId/status`
- **Auth Required**: Yes (JWT + Admin Role)
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `requestId` (String, Required)
- **Request Body**:
  ```json
  {
    "status": "finalized", // Enum: ["finalized", "cancelled"]
    "finalSelection": {
      // Optional selections override snapshot lists
      "selectedFlights": ["flight_id_1"],
      "selectedHotels": ["hotel_id_1"]
    }
  }
  ```
- **Operational Detail**: Finalizing a deal triggers an auto-created unified `Booking` document of type `"custom"` with status `"Confirmed"`, locking in the agreed pricing parameters so that the customer is directly channeled into standard payment workflows.
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Status updated",
    "data": {
      "requestId": "664c51bb31792f349d92837f-1779836400000",
      "status": "finalized",
      "bookingId": "664cc82231792f349d92843f",
      "bookingCode": "TF-2026-928371"
    }
  }
  ```
  _Cache Effect:_ Invalidates Admin Dashboard summaries. Sends booking creation alert email.

---

### 6. Partial Edit Custom Deal (Admin)

- **Method**: `PATCH`
- **Path**: `/admin/custom-package/:requestId/admin-update`
- **Auth Required**: Yes (JWT + Admin Role)
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `requestId` (String, Required)
- **Request Body** (At least one parameter required):
  ```json
  {
    "adminFinalPrice": 220000,
    "selectedFlights": [ ... ],
    "selectedHotels": [ ... ]
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Package updated successfully",
    "data": { ... } // Updated CustomizePackage document
  }
  ```
  _Rule: Throws `409 Conflict` if the CustomizePackage status is already `"finalized"`._

---

## 💬 AI Travel Chatbot

- **Path Mounting**: Mounted relative to `/api/v1/chat`
- **Note**: Responses do not use the nested standard success shape wrapper to allow standard chatbot message processing frameworks.

### 1. Chatbot Health Check

- **Method**: `GET`
- **Path**: `/health`
- **Auth Required**: No
- **Throttling**: Skipped for monitoring checks
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "status": "OK",
    "service": "Travel with Jawad Chatbot API",
    "createdBy": "Jawad Tech Group",
    "timestamp": "2026-05-21T10:33:18.000Z",
    "uptime": 3600.5
  }
  ```

---

### 2. Post Chat Message

- **Method**: `POST`
- **Path**: `/chat`
- **Auth Required**: No
- **Throttling**: `chatLimiter`
- **Request Body**:
  ```json
  {
    "message": "What is the best time to visit Swat Valley?",
    "sessionId": "swat-session-987"
  }
  ```
- **Operational Detail**: Uses Gemini API to evaluate whether input is travel-related. If non-travel, issues polite refusal instantly without logging chat logs to Redis. If valid, retrieves the last 2 turns (4 messages) from Redis, invokes Gemini, saves turns, and outputs response.
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "response": "Swat Valley is absolutely stunning! The ideal season is from May to August...",
    "isJson": false,
    "isRejected": false,
    "sessionId": "swat-session-987",
    "timestamp": "2026-05-21T10:33:18.000Z"
  }
  ```

---

### 3. Get Chatbot Session History

- **Method**: `GET`
- **Path**: `/session/:sessionId`
- **Auth Required**: No
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `sessionId` (String, Required)
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "sessionId": "swat-session-987",
    "messageCount": 2,
    "history": [
      { "role": "user", "text": "What is the best time to visit Swat Valley?" },
      { "role": "model", "text": "Swat Valley is absolutely stunning!..." }
    ],
    "expiresIn": "119 minutes",
    "timestamp": "2026-05-21T10:33:20.000Z"
  }
  ```

---

### 4. Delete Chatbot Session

- **Method**: `DELETE`
- **Path**: `/session/:sessionId`
- **Auth Required**: No
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `sessionId` (String, Required)
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Session cleared successfully",
    "sessionId": "swat-session-987",
    "timestamp": "2026-05-21T10:33:20.000Z"
  }
  ```

---

## ⚡ Realtime Support Chat (WebSockets Backend)

- **Path Mounting**: Mounted relative to `/api/v1/realtime-chat`
- **WebSocket Protocols**: Socket.io event connections are authenticated via custom `socketAuth.middleware.js` checking client cookies/handshake headers.

### 1. Start Customer Live Session

- **Method**: `GET`
- **Path**: `/start`
- **Auth Required**: Yes (JWT)
- **Throttling**: `chatLimiter`
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Success",
    "data": {
      "_id": "664cd1aa31792f349d92844a",
      "user": "664c51bb31792f349d92837f",
      "assignedAdmin": null,
      "status": "open",
      "createdAt": "2026-05-21T10:33:18.000Z",
      "updatedAt": "2026-05-21T10:33:18.000Z"
    }
  }
  ```
  _Action: Atomically queries for an existing, open conversation. If none exists, upserts a fresh conversation._

---

### 2. Fetch Chat Message History

- **Method**: `GET`
- **Path**: `/conversation/:conversationId/messages`
- **Auth Required**: Yes (JWT)
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `conversationId` (String, Required)
- **Request Query Parameters** (Optional):
  - `page` (Number, default: 1)
  - `limit` (Number, default: 50)
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Success",
    "data": [
      {
        "_id": "664cd2aa31792f349d92845c",
        "conversation": "664cd1aa31792f349d92844a",
        "sender": "664c51bb31792f349d92837f",
        "senderRole": "user",
        "text": "Hello, I have an issue with Swat booking",
        "seen": true,
        "createdAt": "2026-05-21T10:34:00.000Z",
        "updatedAt": "2026-05-21T10:34:00.000Z"
      }
    ]
  }
  ```

---

### 3. List All Live Chats (Admin)

- **Method**: `GET`
- **Path**: `/admin/conversations`
- **Auth Required**: Yes (JWT + Admin Role)
- **Throttling**: `apiLimiter`
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Success",
    "data": [
      {
        "_id": "664cd1aa31792f349d92844a",
        "user": {
          "_id": "664c51bb31792f349d92837f",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "assignedAdmin": null,
        "status": "open",
        "lastMessage": "664cd2aa31792f349d92845c",
        "lastMessageAt": "2026-05-21T10:34:00.000Z",
        "createdAt": "2026-05-21T10:33:18.000Z",
        "updatedAt": "2026-05-21T10:34:00.000Z"
      }
    ]
  }
  ```

---

### 4. Get Conversation with Messages (Admin)

- **Method**: `GET`
- **Path**: `/admin/conversation/:conversationId`
- **Auth Required**: Yes (JWT + Admin Role)
- **Throttling**: `apiLimiter`
- **Request Params**:
  - `conversationId` (String, Required)
- **Request Query Parameters** (Optional):
  - `page` (Number, default: 1)
  - `limit` (Number, default: 50)
- **Expected Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "message": "Success",
    "data": {
      "conversation": {
        "_id": "664cd1aa31792f349d92844a",
        "user": {
          "_id": "664c51bb31792f349d92837f",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "assignedAdmin": null,
        "status": "open"
      },
      "messages": [ ... ] // Messages array in order
    }
  }
  ```

---

## 🚀 Redis Caching & Locks Architecture

The backend utilizes Redis for two primary patterns: high-performance caching (read-through/write-through pattern) and concurrency distributed locking.

### 1. Redis Cache Targets

| Scope                     | Cache Key Pattern                                                                                 |   TTL   | Invalidation Trigger Events                                                                                                                         |
| :------------------------ | :------------------------------------------------------------------------------------------------ | :-----: | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| **All Packages**          | `packages:all:user`<br>`packages:all:admin`                                                       | 15 Mins | Admin added a package<br>Admin updated a package<br>Admin deleted a package                                                                         |
| **Active Packages**       | `packages:active:user`<br>`packages:active:admin`                                                 | 10 Mins | Admin added a package<br>Admin updated a package<br>Admin deleted a package                                                                         |
| **Packages by Trip Type** | `packages:type:<domestic\|international>:user`<br>`packages:type:<domestic\|international>:admin` | 10 Mins | Admin added a package<br>Admin updated a package<br>Admin deleted a package                                                                         |
| **Package Details**       | `package:details:user:<packageId>`<br>`package:details:admin:<packageId>`                         | 1 Hour  | Admin updated package `:packageId`<br>Admin deleted package `:packageId`                                                                            |
| **User Favorites**        | `user:favorites:<userId>`                                                                         | 10 Mins | User added a favorite package<br>User deleted a favorite package                                                                                    |
| **Admin Dashboard**       | `admin:dashboard:summary`                                                                         | 60 Secs | User booking created / cancelled / proof uploaded<br>Admin verified / rejected payment / cancelled booking<br>Admin finalized a custom package deal |

### 2. Redis Mutex Locks

To secure heavy computational pipelines and protect rate-limits on external partner quotas (such as Amadeus, OpenWeather, and Gemini), a Redis-based Mutex lock is utilized:

- **Key**: `lock:customPackage:<userId>`
- **Lock Duration (TTL)**: 30 Seconds
- **Endpoint Affected**: `POST /api/v1/preview` (AI Custom Package generation)
- **Behavior**: Blocks concurrent requests from the same user ID. If a user hits `/preview` while a generation is running, the server rejects the request with a `429 Too Many Requests` API error instantly.
