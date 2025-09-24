'use strict';

const express = require('express');

function createServer() {
  const app = express();

  app.use(express.json());

  // In-memory storage
  const users = [];
  const expenses = [];
  let userIdCounter = 1;
  let expenseIdCounter = 1;

  /** ---------------- USERS ---------------- */
  app.post('/users', (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = { id: userIdCounter++, name };

    users.push(user);

    res.status(201).json(user);
  });

  app.get('/users', (req, res) => res.json(users));

  app.get('/users/:id', (req, res) => {
    const userId = Number(req.params.id);
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  });

  app.patch('/users/:id', (req, res) => {
    const userId = Number(req.params.id);
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    user.name = name;
    res.json(user);
  });

  app.delete('/users/:id', (req, res) => {
    const userId = Number(req.params.id);
    const index = users.findIndex((u) => u.id === userId);

    if (index === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users.splice(index, 1);
    res.status(204).end();
  });

  /** ---------------- EXPENSES ---------------- */
  app.post('/expenses', (req, res) => {
    const { userId, spentAt, title, amount, category, note } = req.body;

    if (!userId || !spentAt || !title || amount == null || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const expense = {
      id: expenseIdCounter++,
      userId,
      spentAt,
      title,
      amount,
      category,
      note,
    };

    expenses.push(expense);

    res.status(201).json(expense);
  });

  app.get('/expenses', (req, res) => {
    let results = [...expenses];
    const { userId, from, to, categories } = req.query;

    if (userId) {
      results = results.filter((e) => e.userId === Number(userId));
    }

    if (from && to) {
      results = results.filter((e) => e.spentAt >= from && e.spentAt <= to);
    }

    if (categories) {
      const cats = categories.split(',');

      results = results.filter((e) => cats.includes(e.category));
    }

    res.json(results);
  });

  app.get('/expenses/:id', (req, res) => {
    const expenseId = Number(req.params.id);
    const expense = expenses.find((e) => e.id === expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  });

  app.patch('/expenses/:id', (req, res) => {
    const expenseId = Number(req.params.id);
    const expense = expenses.find((e) => e.id === expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const { title, spentAt, amount, category, note, userId } = req.body;

    // Apply only provided fields (partial update)
    if (title !== undefined) {
      expense.title = title;
    }

    if (spentAt !== undefined) {
      expense.spentAt = spentAt;
    }

    if (amount !== undefined) {
      expense.amount = amount;
    }

    if (category !== undefined) {
      expense.category = category;
    }

    if (note !== undefined) {
      expense.note = note;
    }

    if (userId !== undefined) {
      expense.userId = userId;
    }

    res.json(expense);
  });

  app.delete('/expenses/:id', (req, res) => {
    const expenseId = Number(req.params.id);
    const index = expenses.findIndex((e) => e.id === expenseId);

    if (index === -1) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expenses.splice(index, 1);
    res.status(204).end();
  });

  return app;
}

module.exports = { createServer };
