# Silver Spoon Kitchen

Build a complete responsive full-stack restaurant web application.

PROJECT NAME:

RK SILVER SPOON MULTI CUISINE RESTAURANT

IMPORTANT:

I have limited build credits. Build the complete MVP in ONE implementation as much as possible.

Do not stop after creating only UI.

Do not over-engineer.

Do not add unnecessary libraries or unnecessary pages.

Keep the code clean and easy to continue editing later in VS Code.

The final project must be suitable for deployment on Netlify.

Use my uploaded restaurant logo as the main logo.

==================================================

TECH STACK

==================================================

Frontend:

- HTML/CSS/JavaScript or the framework already best supported by this project

- Fully responsive

Backend/Database:

- Supabase

- Supabase Authentication

- Supabase Database

- Supabase Realtime where required

The website must work on:

- Mobile

- Tablet

- Laptop/Desktop

==================================================

DESIGN

==================================================

Create a modern premium multi-cuisine restaurant website.

Restaurant name must always appear exactly as:

RK SILVER SPOON

MULTI CUISINE RESTAURANT

Use an elegant restaurant-style UI with:

- premium typography

- food photography

- smooth hover effects

- clean cards

- attractive hero section

- professional navigation

- modern mobile menu

Do not make the website look like a generic AI template.

==================================================

PUBLIC WEBSITE

==================================================

Navbar:

Logo

Home

Menu

Reservations

Track Order

About

Contact

Login

Cart

HOME PAGE:

Hero:

RK SILVER SPOON

MULTI CUISINE RESTAURANT

Add buttons:

VIEW MENU

ORDER NOW

RESERVE TABLE

Below hero show:

- Popular Dishes

- Today's Specials

- Food Categories

- Chef Recommendations

- About Restaurant

- Why Choose Us

- Customer Reviews

- Opening Hours

- Location

- Contact

- Footer

Restaurant Google Maps:

https://maps.app.goo.gl/dUGTCxtAts9Xggis9?g_st=ac

==================================================

DIGITAL MENU

==================================================

Categories:

Starters

Soups

Biryani

Indian

Chinese

Tandoori

Seafood

Vegetarian

Non-Vegetarian

Rice

Noodles

Breads

Desserts

Beverages

Each food item should contain:

- Image

- Food name

- Short description

- Price

- Category

- Veg / Non-Veg

- Available / Unavailable

- Bestseller optional

- Add to Cart

Add:

- Search

- Category filter

- Veg / Non-Veg filter

==================================================

CUSTOMER AUTHENTICATION

==================================================

Create:

REGISTER

LOGIN

FORGOT PASSWORD

LOGOUT

Registration:

Full Name

Mobile Number

Email

Password

Confirm Password

Use Supabase Auth.

After login show:

CUSTOMER DASHBOARD

Welcome, [Customer Name]

Dashboard should show:

- Current Order

- Order Status

- Order History

- Reservations

- Profile

Only logged-in customers can order food or reserve tables.

==================================================

CART & ORDERING

==================================================

Customer can:

- Add item

- Remove item

- Increase/decrease quantity

- See subtotal

- See total

Before checkout ask:

ORDER TYPE

1. DINE-IN

2. PARCEL / TAKEAWAY

DINE-IN:

Ask:

Table Number

Special Instructions

PARCEL:

Generate:

Unique Order ID

5-digit Pickup Code

Example:

ORDER #SS4821

Pickup Code: 48215

Never trust prices sent from the browser.

Calculate final order amount using database prices.

==================================================

DEMO PAYMENT

==================================================

THIS IS A HACKATHON DEMO.

Do NOT integrate a real payment gateway.

Show clearly:

DEMO PAYMENT

No real money will be charged.

Payment options:

UPI

CARD

CASH

UPI options:

Google Pay

PhonePe

Paytm

Other UPI

Button:

SIMULATE PAYMENT SUCCESS

Optional:

SIMULATE PAYMENT FAILURE

Never store real card number or CVV.

After successful simulation create:

Payment ID

Order ID

Amount

Method

Status = DEMO PAID

Timestamp

==================================================

ORDER STATUS

==================================================

Order workflow:

ORDER PLACED

→ ACCEPTED

→ PREPARING

→ COOKING

→ READY

→ COMPLETED

Also support CANCELLED.

Customer dashboard should show current order status.

Use Supabase Realtime if possible so status changes appear without refreshing.

==================================================

TABLE RESERVATION

==================================================

Logged-in customer can reserve a table.

Fields:

Name

Mobile

Number of Guests

Date

Time

Preferred Seating

Special Request

After booking generate:

Reservation ID

5-digit Verification Code

Statuses:

PENDING

CONFIRMED

SEATED

COMPLETED

REJECTED

CANCELLED

Customer can see reservation status in dashboard.

==================================================

OWNER / ADMIN LOGIN

==================================================

Create a separate OWNER LOGIN.

Owner Dashboard should show simple summary cards:

Today's Orders

Today's Revenue

Pending Orders

Reservations

Available Tables

OWNER CAN:

MENU:

- Add food

- Edit food

- Delete food

- Change price

- Change availability

- Mark Today's Special

- Mark Bestseller

ORDERS:

- View all orders

- View customer/order details

- Update status

- Cancel order

RESERVATIONS:

- View reservations

- Confirm

- Reject

- Mark seated

- Complete

TABLES:

- Add table

- Table number

- Capacity

- Available / Reserved / Occupied

CUSTOMERS:

- View basic customer/order information

Keep admin dashboard simple and functional.

Do not build complex analytics.

==================================================

STAFF LOGIN

==================================================

Create separate STAFF LOGIN.

Staff can:

- View current orders

- Update order status

- View reservations

- Confirm reservations

- Verify reservation code

- View tables

- Update table status

- Verify parcel pickup code

- Complete parcel handover

Staff cannot:

- Delete important business data

- Manage owner account

- Access sensitive administration

==================================================

KITCHEN LOGIN

==================================================

Create separate KITCHEN LOGIN.

Kitchen dashboard must be extremely simple and tablet friendly.

Display incoming food orders.

Example:

ORDER #SS4821

Chicken Biryani ×2

Chicken 65 ×1

Lime Soda ×1

TYPE: PARCEL

PAYMENT: DEMO PAID

Buttons:

ACCEPT

PREPARING

COOKING

READY

When kitchen changes status, update the customer order status.

==================================================

PARCEL VERIFICATION

==================================================

When parcel becomes READY:

Customer sees:

YOUR ORDER IS READY FOR PICKUP

Show:

Order ID

5-digit Pickup Code

Staff enters/verifies pickup code.

Correct code:

Mark order COMPLETED.

Wrong code:

Show invalid code message.

==================================================

TABLE MANAGEMENT

==================================================

Tables have:

Table Number

Capacity

Status

Statuses:

AVAILABLE

RESERVED

OCCUPIED

CLEANING

Staff/Owner can update table status.

==================================================

RESTAURANT CHATBOT

==================================================

Add floating chatbot:

SILVER SPOON ASSISTANT

IMPORTANT:

Do NOT use external paid AI APIs.

Use simple predefined/keyword/database-based responses.

It should answer ONLY restaurant questions:

- Menu

- Food price

- Food availability

- Veg / Non-Veg

- Today's specials

- Restaurant location

- Opening hours

- Table reservation

- Parcel ordering

- Order tracking

- Demo payment

- Contact information

If user asks unrelated question respond:

"I'm the RK Silver Spoon Assistant. I can only help with our restaurant, menu, orders and reservations."

==================================================

CUSTOMER FEEDBACK

==================================================

After completed order allow customer to submit:

Overall Rating

Food Rating

Service Rating

Comment

Owner can view feedback.

Show approved/sample restaurant reviews on public website.

==================================================

SUPABASE DATABASE

==================================================

Keep database SMALL.

Create only required tables such as:

profiles

menu_items

restaurant_tables

orders

order_items

reservations

payments

reviews

Use relationships correctly.

Use created_at and updated_at where useful.

Use Supabase Row Level Security.

CUSTOMER:

Can access only their personal orders/reservations/profile.

KITCHEN:

Can access required order information.

STAFF:

Can access operational orders/reservations/tables.

OWNER:

Can manage restaurant information.

==================================================

SECURITY

==================================================

Never store passwords manually.

Use Supabase Auth.

Never expose Supabase service-role secret in frontend.

Use environment variables.

Do not rely only on hidden buttons for role security.

Validate important data.

Order totals must come from database prices.

Never store actual card/CVV details.

==================================================

DEMO DATA

==================================================

Add enough sample data so I can demonstrate immediately:

- Menu items

- Tables

- Sample reviews

If Supabase is not connected yet, the UI should still be demonstrable with clearly labeled SAMPLE/DEMO data rather than showing broken screens.

==================================================

LOGIN ENTRY POINTS

==================================================

Create clearly separate login options:

CUSTOMER LOGIN

OWNER LOGIN

STAFF LOGIN

KITCHEN LOGIN

If demo credentials are needed, create development/demo credentials or explain how I can create each account in Supabase.

Never expose production passwords publicly.

==================================================

MAIN HACKATHON DEMO FLOW

==================================================

Make this flow the TOP PRIORITY:

CUSTOMER

→ REGISTER/LOGIN

→ VIEW MENU

→ ADD FOOD TO CART

→ SELECT PARCEL

→ DEMO PAYMENT

→ ORDER CREATED

→ STAFF/KITCHEN RECEIVES ORDER

→ ACCEPT

→ PREPARING

→ COOKING

→ READY

→ CUSTOMER SEES READY

→ CUSTOMER GETS PICKUP CODE

→ STAFF VERIFIES CODE

→ COMPLETED

SECOND PRIORITY:

CUSTOMER

→ LOGIN

→ RESERVE TABLE

→ RESERVATION CREATED

→ OWNER/STAFF CONFIRMS

→ CUSTOMER SEES CONFIRMED

→ STAFF VERIFIES CODE

==================================================

DO NOT BUILD THESE NOW

==================================================

To save build usage, DO NOT build:

- Inventory system

- Advanced sales analytics

- AI business analytics

- Complex charts

- Employee payroll

- Delivery driver system

- Real payment gateway

- Complex notification center

- Advanced permission editor

- Multi-restaurant support

- Advanced gallery CMS

==================================================

NETLIFY + VS CODE REQUIREMENT

==================================================

The generated project must be portable.

I will export/download the source code and continue development using VS Code.

I will deploy the website to Netlify.

Therefore:

- Do not make the app dependent on Lovable hosting.

- Keep environment variables configurable.

- Include .env.example.

- Configure SPA routing if needed for Netlify.

- Add netlify.toml or required redirect configuration if necessary.

- Make production build work.

- Do not hard-code localhost URLs.

- Keep Supabase configuration environment-based.

- Make sure refreshing routes after Netlify deployment does not cause 404 errors.

==================================================

FINAL REQUIREMENT

==================================================

DO NOT just design screens.

Implement the functionality.

Prioritize completing existing features instead of adding unnecessary features.

Before finishing:

- Check navigation

- Check mobile responsiveness

- Check login pages

- Check menu/cart

- Check checkout

- Check demo payment

- Check customer dashboard

- Check owner dashboard

- Check staff dashboard

- Check kitchen dashboard

- Check reservations

- Check order status

- Check pickup verification

- Check chatbot

Fix obvious errors.

At the end give me a SHORT report only:

1. What is completed

2. What requires Supabase configuration

3. Environment variables required

4. How to run locally in VS Code

5. How to build for production

6. How to deploy the project on Netlify

7. How to test Customer → Kitchen → Pickup flow

8. How to test reservation flow

DO NOT redesign completed sections unnecessarily.

DO NOT generate long documentation.

Spend effort on the working application.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://silver-spoon-bites.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7c84aa0d-b281-425a-89e0-35d914d4d047).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
