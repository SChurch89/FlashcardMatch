const express = require('express');
const knex = require('knex')(require('./knexfile'));
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000; // Corrected to use one port variable

// Configure CORS options to match the URL of your frontend
const corsOptions = {
  origin: 'http://localhost:3000', 
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json()); 

// Function to fetch a card by ID
function findCardById(id) {
  return knex('flashcard').where({ id }).first();
}

// Endpoint to get all flashcards
app.get('/flashcard', async (req, res) => {
  try {
    const flashcards = await knex.select('*').from('flashcard');
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Endpoint to get a single flashcard by ID
app.get('/flashcard/:id', async (req, res) => {
  try {
    const card = await findCardById(req.params.id);
    if (card) {
      res.json(card);
    } else {
      res.status(404).send('Flashcard not found');
    }
  } catch (error) {
    console.error('Error fetching card details:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to create a new flashcard
app.post('/flashcard', async (req, res) => {
  const { problem, solution, difficulty, deck } = req.body;
  try {
    const [id] = await knex('flashcard').insert({
      problem,
      solution,
      difficulty,
      deck
    });
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});

// Endpoint to update an existing flashcard
app.put('/flashcard/:id', async (req, res) => {
  const { id } = req.params;
  const { problem, solution, difficulty, deck } = req.body;
  try {
    const updated = await knex('flashcard').where({ id }).update({
      problem, solution, difficulty, deck
    }, '*');
    if (updated) {
      const updatedCard = await knex('flashcard').where({ id }).first();
      res.json(updatedCard);
    } else {
      res.status(404).send('Flashcard not found');
    }
  } catch (error) {
    res.status(500).json({ error: 'Database error', details: error });
  }
});

// Endpoint to delete a flashcard
app.delete('/flashcard/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`Received request to delete flashcard with ID: ${id}`);
  try {
    const deleted = await knex('flashcard').where({ id }).del();
    console.log(`Deleted rows count: ${deleted}`);
    if (deleted) {
      res.status(204).send(); // No content to send back
    } else {
      res.status(404).send('Flashcard not found');
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
