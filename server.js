const express = require('express'), app = express();
const users = require('./routes/users'), avatars = require('./routes/avatars');
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': '*'
  });
  next();
});
app.use('/avatars', avatars);
app.use('/users', users);
app.get('/', (req, res) => res.send('Hello from Express!'))

app.listen(port, () => console.log(`Listening on http://localhost:${port}`));