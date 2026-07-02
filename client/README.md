# FastTrans Client Frontend

This folder contains the React frontend for the FastTrans Transport Booking and Vehicle Scheduling System(SWE 3040 group Project)

## My Module(Abraham BLeah)\_Client request form and frontend page

I was assigned part is the client request form and frontend pages.

This frontend module allows a client to:

- submit a new transport request
- enter pickup and destination details
- enter package type and package weight
- select pickup date and pickup time
- add special handling instructions
- save a request draft in the browser
- clear a saved draft
- view a request submission receipt
- view submitted transport requests
- search and filter request records
- open request details
- update request status
- navigate between dashboard, request form, and request records pages

## Technologies Used

- React
- Vite
- Tailwind CSS
- React Router
- JavaScript
- Fetch API

## Frontend Routes

Route Page Purpose

`/dashboard` Client Dashboard Shows client module overview and request totals
`/requests/new` Client Request Form Allows the client to submit a transport request
`/requests` Request Records Shows submitted requests and request details  
 `*` Not Found Page Handles invalid frontend URLs

## Main Files

File Purpose

`src/App.jsx` Defines frontend routes  
 `src/components/AppLayout.jsx` Provides shared navigation layout  
 `src/pages/ClientDashboardPage.jsx` Displays dashboard overview  
 `src/pages/ClientRequestPage.jsx` Handles the client request form  
 `src/pages/RequestsListPage.jsx` Displays submitted requests and details  
 `src/pages/NotFoundPage.jsx` Displays a clean 404 page  
 `src/config/api.js` Stores frontend API endpoint configuration

## API Connection

The frontend connects to the Express backend using:

```js
http://localhost:5000/api/requests
```
