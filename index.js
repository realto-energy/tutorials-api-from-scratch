/**
 * Set-up
 * Importing modules and configuring some settings
 */

const express = require('express');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * Data
 * Normally we would fetch and store data via a database or file-system
 * For this tutorial we're keeping it simple and creating mock data in memory
 */

// Data array containing mock PPA deal information
let data = [
  {
    id: 1,
    seller: 'Generic Utility Co',
    buyer: 'Buyer Industries',
    country: 'Germany',
    technology: 'Solar',
    capacity: 15,
    term: '12 months',
    date: '2021-07-07',
  },
  {
    id: 2,
    seller: 'Generator X',
    buyer: 'XYZ Tech Corp',
    country: 'Belgium',
    technology: 'Offshore Wind',
    capacity: 500,
    term: '5 years',
    date: '2021-07-07',
  },
  {
    id: 3,
    seller: 'Another Power Seller',
    buyer: 'Large Corporate Co',
    country: 'France',
    technology: 'Onshore Wind',
    capacity: 50,
    term: '12 months',
    date: '2021-07-06',
  },
  {
    id: 4,
    seller: 'Generator X',
    buyer: 'Large Corporate Co',
    country: 'United Kingdom',
    technology: 'Solar',
    capacity: 20,
    term: '5 years',
    date: '2021-07-06',
  },
  {
    id: 5,
    seller: 'ABC Energy 123',
    buyer: 'XYZ Tech Corp',
    country: 'Spain',
    technology: 'Solar',
    capacity: 150,
    term: '10 years',
    date: '2021-07-05',
  },
];

/**
 * Services
 * These functions handle the business logic needed by the API
 */

// Validates that a specific PPA deal identifier exists
const checkDealIdExists = async (id) => {
  const check = data.filter((deal) => deal.id == id);
  if (check.length > 0) {
    return true;
  }
  return false;
};

// Helper function to filter deals based on query parameters
const filterDeals = (deal, query) => {
  if (!query) return true;
  for (const [key, value] of Object.entries(query)) {
    if (deal[key] != value) return false;
  }
  return true;
};

// Checks that incoming data has all expected properties and that they aren't empty
const validateData = async (payload) => {
  const propertiesToCheck = ['seller', 'buyer', 'country', 'technology', 'capacity', 'term', 'date'];
  for (let i = 0; i < propertiesToCheck.length; i++) {
    if (!payload.hasOwnProperty(propertiesToCheck[i]) || payload[propertiesToCheck[i]].length == 0) {
      return false;
    }
  }
  return true;
};

// Retrieve a list of deals
const getDeals = async (query) => {
  // If query parameters exist, filter the deals returned to those that match
  if (query) {
    return data.filter((deal) => filterDeals(deal, query));
  }
  return data;
};

// Retrieve a specific deal based on a deal identifier
const getDealById = async (id) => data.filter((deal) => deal.id === parseInt(id, 10));

// Create a new deal in the mock database
const createDeal = async (payload) => {
  // Find the largest id existing in table and increment by 1
  const id = data.map((deal) => deal.id).reduce((a, b) => Math.max(a, b)) + 1;
  // Create the deal based on information passed through the API
  const deal = {
    id,
    seller: payload.seller,
    buyer: payload.buyer,
    country: payload.country,
    technology: payload.technology,
    capacity: parseInt(payload.capacity, 10),
    term: payload.term,
    date: payload.date,
  };
  data.push(deal);
  return deal;
};

// Update a specific deal in the mock database
const updateDeal = async (id, payload) => {
  // Find the index of the record to update
  const index = data.findIndex((deal) => deal.id == id);
  // Update the deal based on information passed through the API
  data[index] = {
    id,
    seller: payload.seller,
    buyer: payload.buyer,
    country: payload.country,
    technology: payload.technology,
    capacity: parseInt(payload.capacity, 10),
    term: payload.term,
    date: payload.date,
  };
  return data[index];
};

// Delete a specific deal in the mock database
const deleteDeal = async (id) => {
  data = data.filter((deal) => deal.id != id);
  return data;
};

/**
 * Routes / Controllers
 * Here we describe the endpoints for the API and how they are handled
 */

// Hello World Example Route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Get a list of PPA deals
app.get('/api/deals', async (req, res) => {
  try {
    // Retrieve a list of deals for a given query
    const deals = await getDeals(req.query);

    // Respond with the deals that matched our query
    return res.status(200).json({ data: deals });
  } catch (e) {
    console.log(e);
  }
});

// Get a specific PPA deal
app.get('/api/deals/:id', async (req, res) => {
  try {
    // Check that an ID exists in the database
    const checked = await checkDealIdExists(req.params.id);

    // Return an error if it isn't
    if (!checked) return res.status(400).json({ error: 'Could not find this id' });

    // Otherwise respond with data for this specific deal
    const deal = await getDealById(req.params.id);
    return res.status(200).json({ data: deal });
  } catch (e) {
    console.log(e);
  }
});

// Create a new PPA deal
app.post('/api/deals', async (req, res) => {
  try {
    // Check that the incoming data is valid
    const validated = await validateData(req.body);

    // Return an error if it isn't
    if (!validated) return res.status(400).json({ error: 'Empty or missing properties and/or values' });

    // Create the deal in the mock database
    const createdDeal = await createDeal(req.body);

    // Respond with the newly created deal information
    return res.status(201).json({ data: createdDeal });
  } catch (e) {
    console.log(e);
  }
});

// Update an existing PPA deal
app.patch('/api/deals/:id', async (req, res) => {
  try {
    // Check that an ID exists in the database
    const checked = await checkDealIdExists(req.params.id);

    // Return an error if it isn't
    if (!checked) return res.status(400).json({ error: 'Could not find this id' });

    // Check that the incoming data is valid
    const validated = await validateData(req.body);

    // Return an error if it isn't
    if (!validated) return res.status(400).json({ error: 'Empty or missing properties and/or values' });

    // Update the specific deal with the new information
    const deal = await updateDeal(req.params.id, req.body);

    // Respond with the updated deal information
    return res.status(200).json({ data: deal });
  } catch (e) {
    console.log(e);
  }
});

// Delete a PPA deal
app.delete('/api/deals/:id', async (req, res) => {
  try {
    // Check that an ID exists in the database
    const checked = await checkDealIdExists(req.params.id);

    // Return an error if it isn't
    if (!checked) return res.status(400).json({ error: 'Could not find this id' });

    // Delete the specified deal
    const deals = await deleteDeal(req.params.id);

    // Respond with the most up to date deal information
    return res.status(200).json({ data: deals });
  } catch (e) {
    console.log(e);
  }
});

/**
 * Start the API 🚀
 */

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port} ⚡`);
});
